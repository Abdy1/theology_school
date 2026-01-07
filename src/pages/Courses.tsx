import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

// Utility function to truncate text
const truncateText = (text: string, maxLength: number = 120) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

const Courses = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/courses`);
        if (response.ok) {
          const data = await response.json();
          // Filter to show only approved courses
          const approvedCourses = data.filter((course: any) => course.status === 'ACTIVE');
          setCourses(approvedCourses);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setCoursesLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

  const filteredCourses = useMemo(
    () =>
      courses.filter((course: any) => {
        const q = search.toLowerCase();
        return (
          course.title.toLowerCase().includes(q) || course.description.toLowerCase().includes(q)
        );
      }),
    [search, courses],
  );

  if (isLoading || coursesLoading) {
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
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Academic Programms</h1>
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
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
              <CardHeader className="flex-grow">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl line-clamp-2">{course.title}</CardTitle>
                  <Badge variant="secondary" className="shrink-0">{course.durationMinutes} min</Badge>
                </div>
                <CardDescription className="line-clamp-3">
                  {truncateText(course.description, 150)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between mt-auto">
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

   
      </div>
    </div>
  );
}
;

export default Courses;
