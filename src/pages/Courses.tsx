import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';

const mockCourses = [
  {
    id: 1,
    title: 'Introduction to Theology',
    description: 'Explore the fundamental concepts and principles of theological study.',
    duration: '45 min',
    level: 'Beginner',
  },
  {
    id: 2,
    title: 'Biblical Hermeneutics',
    description: 'Learn the art and science of biblical interpretation.',
    duration: '60 min',
    level: 'Intermediate',
  },
  {
    id: 3,
    title: 'Church History I',
    description: 'Journey through the early centuries of Christian history.',
    duration: '55 min',
    level: 'Intermediate',
  },
  {
    id: 4,
    title: 'Systematic Theology',
    description: 'Understand the organized study of Christian doctrines.',
    duration: '70 min',
    level: 'Advanced',
  },
];

const Courses = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

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

  const filteredCourses = useMemo(
    () =>
      mockCourses.filter((course) => {
        const q = search.toLowerCase();
        return (
          course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q)
        );
      }),
    [search],
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">My Courses</h1>
            <p className="text-muted-foreground">Continue your theological education journey</p>
          </div>
          <div className="w-full md:w-80">
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="course-search">
              Search courses
            </label>
            <input
              id="course-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or description..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <Badge variant="secondary">{course.duration}</Badge>
                </div>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{course.level}</p>
                <Link
                  to={`/courses/${course.id}`}
                  className="flex items-center text-primary hover:underline font-medium"
                >
                  <Play className="mr-2 h-4 w-4" />
                  View course
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 border-t pt-10">
          <h2 className="text-3xl font-bold text-primary mb-6">Programs Offered</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-xl font-semibold mb-3">Degree Programs</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Youth Ministry</li>
                <li>Child Development</li>
                <li>Academic Theology</li>
                <li>Christian Counseling</li>
                <li>Christian Leadership</li>
                <li>Church Planting</li>
                <li>Mission Studies</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Diploma Programs</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Church Planting</li>
                <li>Christian Journalism</li>
                <li>Christian Counseling Ministry</li>
                <li>Youth and Children’s Ministry</li>
                <li>Women’s Ministry</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Certificate Programs</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Church Planting</li>
                <li>Christian Journalism</li>
                <li>Christian Counseling Ministry</li>
                <li>Youth, Women, and Children’s Ministry</li>
                <li>Christian Leadership</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
;

export default Courses;
