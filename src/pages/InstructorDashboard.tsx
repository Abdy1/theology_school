import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle, Video, Users, FileText, ClipboardList, Edit, Trash2 } from 'lucide-react';

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

const InstructorDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<AssignmentSubmissionRow[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [showMyCourses, setShowMyCourses] = useState(false);

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
    const fetchSubmissions = async () => {
      try {
        const resp = await fetch(`${API_BASE_URL}/api/assignments/submissions`);
        if (!resp.ok) {
          throw new Error('Failed to load submissions');
        }
        const data = await resp.json();
        setSubmissions(data);
      } catch (error) {
        console.error('Failed to fetch assignment submissions', error);
      } finally {
        setLoading(false);
      }
    };

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

    fetchSubmissions();
    if (user) {
      fetchMyCourses();
    }
  }, [user]);

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
        throw new Error('Failed to delete course');
      }

      setCourses(courses.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Failed to delete course', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  const filteredSubmissions =
    statusFilter === 'ALL'
      ? submissions
      : submissions.filter((s) => s.status === statusFilter);

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

          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-primary" />
              <CardTitle>Students</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View enrolled students</p>
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
                        className="border rounded-md p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-lg">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Level: {course.level}</span>
                            <span>Duration: {course.durationMinutes} min</span>
                            <span>Price: ${course.price}</span>
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
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCourse(course.id)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Assignment submissions</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Filter by status:</span>
              <div className="flex gap-1">
                {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent submissions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading submissions...</p>
              ) : filteredSubmissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No assignment submissions to review yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {filteredSubmissions.map((s) => (
                    <div
                      key={s.id}
                      className="border rounded-md p-3 flex flex-col gap-1 text-sm bg-card cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => navigate(`/assignment/${s.id}/review`)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">
                            {s.courseTitle} – <span className="italic">{s.moduleTitle}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {s.assignmentTitle}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge
                            variant={
                              s.status === 'APPROVED'
                                ? 'default'
                                : s.status === 'REJECTED'
                                ? 'destructive'
                                : 'secondary'
                            }
                          >
                            {s.status}
                          </Badge>
                          {typeof s.gradePercent === 'number' && (
                            <span className="text-xs text-muted-foreground">
                              Grade: {s.gradePercent}% (pass {s.assignmentPassingPercent}%)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                          Student: {s.studentName} ({s.studentEmail})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Submitted:{' '}
                          {new Date(s.submittedAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1">
                        <p className="text-xs line-clamp-2">
                          {s.answerText || 'No written answer (file only).'}
                        </p>
                        {s.attachmentUrl && (
                          <Button asChild size="xs" variant="outline">
                            <a href={s.attachmentUrl} target="_blank" rel="noreferrer">
                              View file
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
