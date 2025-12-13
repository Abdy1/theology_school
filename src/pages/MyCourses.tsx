import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockMyCourses = [
  {
    id: 1,
    title: 'Introduction to Theology',
    progressPercent: 40,
    status: 'ACTIVE',
  },
  {
    id: 2,
    title: 'Biblical Hermeneutics',
    progressPercent: 0,
    status: 'PENDING',
  },
];

const MyCourses = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
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

        {mockMyCourses.length === 0 ? (
          <p className="text-muted-foreground">You have not purchased any courses yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockMyCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
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
                    <Link to={`/courses/${course.id}/learn`} className="text-primary hover:underline text-sm">
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
