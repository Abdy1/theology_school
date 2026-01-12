import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Video, Users, FileText, Edit, Trash2, ChevronDown, ChevronUp, BookOpen, Clock, CheckCircle, Circle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

interface AssignmentSubmissionRow {
  id: number;
  status: string;
  gradePercent: number | null;
  submittedAt: string;
  reviewedAt: string | null;
  answerText: string | null;
  attachmentUrl: string | null;
  assignmentId: number;
  enrollmentId: number;
  userId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  moduleId: number;
  moduleTitle: string;
  assignmentTitle: string;
  assignmentPassingPercent: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  level: string;
  price: number;
  status: string;
  modules: any[];
}

interface Student {
  id: number;
  name: string;
  email: string;
  enrollmentId: number;
  progressPercent: number;
  enrolledAt: string;
  lastActivity?: string;
  completedVideos: number;
  totalVideos: number;
  status: string;
  assignments?: AssignmentSubmissionRow[];
}

interface CourseWithStudents {
  course: Course;
  students: Student[];
  totalStudents: number;
  averageProgress: number;
}

const InstructorDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesWithStudents, setCoursesWithStudents] = useState<CourseWithStudents[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [showMyCourses, setShowMyCourses] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Get current user from AuthContext localStorage key
    const userData = localStorage.getItem('theology-user');
    console.log('Raw user data from localStorage:', userData);
    if (userData) {
      const parsedUser = JSON.parse(userData);
      console.log('Parsed user data:', parsedUser);
      setUser(parsedUser);
    } else {
      console.log('No user data found in localStorage');
    }
  }, []);

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!user) {
        return;
      }
      
      try {
        const resp = await fetch(`${API_BASE_URL}/api/courses/instructor/${user.id}`);
        if (!resp.ok) {
          const errorText = await resp.text();
          throw new Error('Failed to load courses');
        }
        const data = await resp.json();
        setCourses(data);
      } catch (error) {
        console.error('Failed to fetch courses', error);
      } finally {
        setCoursesLoading(false);
      }
    };

    const fetchStudentsForCourses = async () => {
      if (!user) {
        return;
      }

      try {
        // First get instructor's courses
        const coursesResp = await fetch(`${API_BASE_URL}/api/courses/instructor/${user.id}`);
        if (!coursesResp.ok) {
          throw new Error('Failed to load courses');
        }
        const instructorCourses = await coursesResp.json();
        console.log('Instructor courses:', instructorCourses);

        // For each course, get enrollments and assignments
        const coursesWithStudentsData = await Promise.all(
          instructorCourses.map(async (course: Course) => {
            try {
              const enrollmentsResp = await fetch(`${API_BASE_URL}/api/enrollments/course/${course.id}`);
              if (enrollmentsResp.ok) {
                const enrollments = await enrollmentsResp.json();
                console.log(`Enrollments for course ${course.id} (${course.title}):`, enrollments);
                
                // Get assignments for this course's students
                const assignmentsResp = await fetch(`${API_BASE_URL}/api/assignments/submissions`);
                let allAssignments = [];
                if (assignmentsResp.ok) {
                  allAssignments = await assignmentsResp.json();
                }
                
                // Filter assignments for this course and this instructor's students
                const courseAssignments = allAssignments.filter((assignment: any) => 
                  assignment.courseId === course.id && 
                  enrollments.some((enrollment: any) => enrollment.userId === assignment.userId)
                );
                
                console.log(`Assignments for course ${course.title}:`, courseAssignments);
                
                // Transform enrollment data to student format with assignments
                const students = enrollments.map((enrollment: any) => {
                  const studentAssignments = courseAssignments.filter(
                    (assignment: any) => assignment.userId === enrollment.userId
                  );
                  
                  return {
                    id: enrollment.userId,
                    name: enrollment.userName || 'Unknown Student',
                    email: enrollment.userEmail || 'unknown@example.com',
                    enrollmentId: enrollment.id,
                    progressPercent: enrollment.progressPercent || 0,
                    enrolledAt: enrollment.createdAt,
                    lastActivity: enrollment.lastActivity,
                    completedVideos: enrollment.completedVideos || 0,
                    totalVideos: enrollment.totalVideos || 0,
                    status: enrollment.progressPercent === 100 ? 'COMPLETED' : 
                             enrollment.progressPercent > 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
                    assignments: studentAssignments
                  };
                });

                const totalStudents = students.length;
                const averageProgress = totalStudents > 0 
                  ? students.reduce((sum, student) => sum + student.progressPercent, 0) / totalStudents 
                  : 0;

                console.log(`Processed students for course ${course.title}:`, { totalStudents, averageProgress, students });

                return {
                  course,
                  students,
                  totalStudents,
                  averageProgress
                };
              } else {
                console.error(`Failed to fetch enrollments for course ${course.id}:`, enrollmentsResp.status);
                return {
                  course,
                  students: [],
                  totalStudents: 0,
                  averageProgress: 0
                };
              }
            } catch (error) {
              console.error(`Failed to load enrollments for course ${course.id}:`, error);
              return {
                course,
                students: [],
                totalStudents: 0,
                averageProgress: 0
              };
            }
          })
        );

        console.log('Final courses with students data:', coursesWithStudentsData);
        setCoursesWithStudents(coursesWithStudentsData);
      } catch (error) {
        console.error('Failed to fetch students', error);
      } finally {
        setStudentsLoading(false);
      }
    };

    if (user) {
      fetchMyCourses();
      fetchStudentsForCourses();
    }
  }, [user]);

  const handleCourseClick = (course: Course) => {
    // Store course data in sessionStorage to avoid additional network requests
    sessionStorage.setItem('selectedCourse', JSON.stringify(course));
    navigate(`/course-management/${course.id}`);
  };

  const handleEditCourse = (courseId: number) => {
    navigate(`/edit-course/${courseId}`);
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    if (!user) return;

    try {
      const resp = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instructorId: user.id })
      });
      
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete course');
      }

      setCourses(courses.filter(course => course.id !== courseId));
      setCoursesWithStudents(coursesWithStudents.filter(cws => cws.course.id !== courseId));
    } catch (error) {
      console.error('Failed to delete course', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  const toggleCourseExpansion = (courseId: number) => {
    setExpandedCourses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary">{t('dashboard:instructorDashboard')}</h1>
          <p className="text-muted-foreground">{t('dashboard:manageCoursesAndStudents')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/create-course')}
          >
            <CardHeader>
              <PlusCircle className="h-8 w-8 text-primary" />
              <CardTitle>{t('dashboard:createCourse')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Start building a new course</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowMyCourses(!showMyCourses)}
          >
            <CardHeader>
              <Video className="h-8 w-8 text-primary" />
              <CardTitle>{t('dashboard:myCourses')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage existing courses</p>
              <Badge variant="secondary" className="mt-2">
                {courses.length} courses
              </Badge>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setShowStudents(!showStudents)}
          >
            <CardHeader>
              <Users className="h-8 w-8 text-primary" />
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View enrolled students</p>
              <Badge variant="secondary" className="mt-2">
                {coursesWithStudents.reduce((total, course) => total + course.totalStudents, 0)} students
              </Badge>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-8 w-8 text-primary" />
              <CardTitle>Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Upload course materials</p>
            </CardContent>
          </Card>
        </div>

        {/* My Courses Section */}
        {showMyCourses && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">{t('dashboard:myCourses')}</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Courses you created</CardTitle>
              </CardHeader>
              <CardContent>
                {coursesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading courses...</p>
                ) : courses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No courses created yet. Start by creating your first course!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className="border rounded-md p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleCourseClick(course)}
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Level: {course.level}</span>
                            <span>Duration: {course.durationMinutes} min</span>
                            <span>Price: Br {course.price}</span>
                            <span>Modules: {course.modules?.length || 0}</span>
                          </div>
                          <div className="mt-2">
                            <Badge
                              variant={
                                course.status === 'APPROVED'
                                  ? 'default'
                                  : course.status === 'REJECTED'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {course.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Students Section */}
        {showStudents && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Students Overview</h2>
              <Badge variant="secondary" className="ml-2">
                {coursesWithStudents.reduce((total, course) => total + course.totalStudents, 0)} total students
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Students grouped by courses</CardTitle>
              </CardHeader>
              <CardContent>
                {studentsLoading ? (
                  <p className="text-sm text-muted-foreground">Loading students...</p>
                ) : coursesWithStudents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No students enrolled in your courses yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {coursesWithStudents.map((courseWithStudents) => {
                      const isExpanded = expandedCourses.has(courseWithStudents.course.id);
                      
                      return (
                        <Card key={courseWithStudents.course.id} className="border-l-4 border-primary/20">
                          <CardHeader 
                            className="cursor-pointer hover:bg-muted/50 transition-colors pb-3"
                            onClick={() => toggleCourseExpansion(courseWithStudents.course.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex items-center gap-2 shrink-0">
                                  <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-base truncate">{courseWithStudents.course.title}</h3>
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {courseWithStudents.totalStudents} students
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      Avg: {Math.round(courseWithStudents.averageProgress)}% progress
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {courseWithStudents.course.durationMinutes} min
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <ChevronDown 
                                className={`h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`} 
                              />
                            </div>
                          </CardHeader>

                          {isExpanded && (
                            <CardContent className="pt-0">
                              {courseWithStudents.students.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4">
                                  No students enrolled in this course yet.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs font-medium text-muted-foreground pb-2 border-b">
                                    <span>Student Name</span>
                                    <span>Email</span>
                                    <span>Progress</span>
                                    <span>Assignments</span>
                                  </div>
                                  {courseWithStudents.students.map((student) => (
                                    <div 
                                      key={student.enrollmentId}
                                      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2 rounded-lg border hover:bg-muted/30 transition-colors text-sm"
                                    >
                                      <div className="font-medium">{student.name}</div>
                                      <div className="text-muted-foreground text-xs">{student.email}</div>
                                      <div className="flex items-center gap-2">
                                        <div className="w-16 bg-muted rounded-full h-2">
                                          <div 
                                            className="bg-primary h-2 rounded-full transition-all duration-300" 
                                            style={{ width: `${student.progressPercent}%` }}
                                          />
                                        </div>
                                        <span className="text-xs">{student.progressPercent}%</span>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        {student.assignments && student.assignments.length > 0 ? (
                                          <>
                                            {student.assignments.slice(0, 2).map((assignment, index) => (
                                              <div 
                                                key={assignment.id}
                                                className="text-xs p-1 rounded border cursor-pointer hover:bg-muted/50"
                                                onClick={() => navigate(`/assignment/${assignment.id}/review`)}
                                                title={`${assignment.assignmentTitle} - ${assignment.status}`}
                                              >
                                                <div className="flex items-center justify-between gap-1">
                                                  <span className="truncate max-w-20">{assignment.assignmentTitle}</span>
                                                  <Badge 
                                                    variant={
                                                      assignment.status === 'APPROVED' ? 'default' :
                                                      assignment.status === 'REJECTED' ? 'destructive' : 'secondary'
                                                    }
                                                    className="text-xs"
                                                  >
                                                    {assignment.status}
                                                  </Badge>
                                                </div>
                                              </div>
                                            ))}
                                            {student.assignments.length > 2 && (
                                              <div className="text-xs text-muted-foreground">
                                                +{student.assignments.length - 2} more
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <span className="text-xs text-muted-foreground">No assignments</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resources Section */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <FileText className="h-8 w-8 text-primary" />
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Upload course materials</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstructorDashboard;
