import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const API_BASE_URL = 'http://localhost:8081';

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
                  <CardTitle>{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Status</span>
                    <Badge variant="secondary">{course.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Progress</span>
                    <span>{course.progressPercent}%</span>
                  </div>
                  <div className="pt-2 flex justify-end">
                    <Link to={`/courses/${course.courseId}/learn`} className="text-primary hover:underline text-sm">
                      Continue learning
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
