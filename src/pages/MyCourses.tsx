import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Users, BookOpen, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

// Utility function to truncate text
const truncateText = (text: string, maxLength: number = 200) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

const MyCourses = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [myCourses, setMyCourses] = useState([]);
  const [myCoursesLoading, setMyCoursesLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/enrollments/my?userId=${user?.id}`);
        if (response.ok) {
          const data = await response.json();
          setMyCourses(data);
        }
      } catch (error) {
        console.error('Failed to fetch my courses:', error);
      } finally {
        setMyCoursesLoading(false);
      }
    };

    if (user) {
      fetchMyCourses();
    }
  }, [user]);

  if (isLoading || myCoursesLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Breadcrumb />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">My Courses</h1>
        </div>

        {myCourses.length === 0 ? (
          <p className="text-muted-foreground">You have not purchased any courses yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((course: any) => (
              <Card key={course.enrollmentId} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl line-clamp-2">{course.title}</CardTitle>
                    <Badge variant={course.progressPercent === 100 ? "default" : "outline"} className="shrink-0">
                      {course.level}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-4 text-sm">
                    {course.description ? truncateText(course.description, 200) : 'No description available'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant="secondary">{course.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Progress</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${course.progressPercent}%` }}
                        />
                      </div>
                      <span className="font-medium">{course.progressPercent}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Duration</span>
                    <span>{course.durationMinutes || 0} min</span>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Link 
                      to={`/courses/${course.courseId}/learn`} 
                      className="flex items-center text-primary hover:underline text-sm font-medium"
                    >
                      {course.progressPercent === 100 ? (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Review Course
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Continue Learning
                        </>
                      )}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
