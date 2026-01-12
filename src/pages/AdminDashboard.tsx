import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, BookOpen, Settings, TrendingUp, UserPlus, CheckCircle, XCircle, Library } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [enrolledUsers, setEnrolledUsers] = useState<any[]>([]);
  const [nonEnrolledUsers, setNonEnrolledUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryResponse, pendingResponse, enrolledResponse, nonEnrolledResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/summary`),
          fetch(`${API_BASE_URL}/api/admin/courses/pending`),
          fetch(`${API_BASE_URL}/api/admin/users/enrolled`),
          fetch(`${API_BASE_URL}/api/admin/users/non-enrolled`)
        ]);

        const summaryData = await summaryResponse.json();
        const pendingData = await pendingResponse.json();
        const enrolledData = await enrolledResponse.json();
        const nonEnrolledData = await nonEnrolledResponse.json();

        setSummary(summaryData);
        setPendingCourses(pendingData);
        setEnrolledUsers(enrolledData);
        setNonEnrolledUsers(nonEnrolledData);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveCourse = async (courseId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}/approve`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        setPendingCourses(prev => prev.filter(course => course.id !== courseId));
        setSummary(prev => ({
          ...prev,
          courses: {
            ...prev.courses,
            pending: prev.courses.pending - 1,
            active: prev.courses.active + 1
          }
        }));
      }
    } catch (error) {
      console.error('Failed to approve course:', error);
    }
  };

  const handleRejectCourse = async (courseId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}/reject`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        setPendingCourses(prev => prev.filter(course => course.id !== courseId));
        setSummary(prev => ({
          ...prev,
          courses: {
            ...prev.courses,
            pending: prev.courses.pending - 1
          }
        }));
      }
    } catch (error) {
      console.error('Failed to reject course:', error);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherForm)
      });
      
      if (response.ok) {
        setShowAddTeacher(false);
        setTeacherForm({ name: '', email: '', password: '', phoneNumber: '' });
        setSummary(prev => ({
          ...prev,
          users: {
            ...prev.users,
            teachers: prev.users.teachers + 1
          }
        }));
      }
    } catch (error) {
      console.error('Failed to add teacher:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary">{t('dashboard:adminDashboard')}</h1>
          <p className="text-muted-foreground">{t('dashboard:manageSystemAndUsers')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:totalUsers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.users.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard:studentsAndTeachers', { students: summary?.users.students || 0, teachers: summary?.users.teachers || 0 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:totalCourses')}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.courses.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard:activeAndPending', { active: summary?.courses.active || 0, pending: summary?.courses.pending || 0 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:totalEnrollments')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.enrollments.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard:completed', { completed: summary?.enrollments.completed || 0 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:avgProgress')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.enrollments.average_progress || 0}%</div>
              <p className="text-xs text-muted-foreground">{t('dashboard:acrossAllEnrollments')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {t('dashboard:addTeacher')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-name">Name</Label>
                  <Input
                    id="teacher-name"
                    placeholder="Teacher Name"
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="teacher@example.com"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password</Label>
                  <Input
                    id="teacher-password"
                    type="password"
                    placeholder="Password"
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-phone">Phone Number</Label>
                  <Input
                    id="teacher-phone"
                    placeholder="+1234567890"
                    value={teacherForm.phoneNumber}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Teacher
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddTeacher(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button 
            className="flex items-center gap-2"
            onClick={() => navigate('/admin/library-management')}
          >
            <Library className="h-4 w-4" />
            Library Management
          </Button>
        </div>

        {/* Pending Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">{t('dashboard:pendingCoursesWithCount', { count: pendingCourses.length })}</h2>
          
          {pendingCourses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">{t('dashboard:noPendingCourses')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <p className="text-muted-foreground">{course.description}</p>
                      </div>
                      <Badge variant="secondary">{t('dashboard:pending')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        <span>{course.level} • {course.durationMinutes} min • ${course.price}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1"
                          onClick={() => handleRejectCourse(course.id)}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => handleApproveCourse(course.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* User Management */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">User Management</h2>
          
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Enrolled Users */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Enrolled Users</CardTitle>
                  <Badge variant="default">{enrolledUsers.length}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Users who are enrolled in at least one course
                </p>
              </CardHeader>
              <CardContent>
                {enrolledUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No enrolled users found</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {enrolledUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            {user.enrollment_count || 0} courses
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {user.role || 'student'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Non-Enrolled Users */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Non-Enrolled Users</CardTitle>
                  <Badge variant="secondary">{nonEnrolledUsers.length}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Users who have accounts but are not enrolled in any courses
                </p>
              </CardHeader>
              <CardContent>
                {nonEnrolledUsers.length === 0 ? (
                  <div className="text-center py-4">
                    <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">All users are enrolled!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {nonEnrolledUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-secondary">
                              {user.name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-xs">
                            Not enrolled
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {user.role || 'student'}
                          </p>
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
    </div>
  );
};

export default AdminDashboard;
