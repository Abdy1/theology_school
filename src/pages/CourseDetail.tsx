import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export const mockCourseDetails = {
  1: {
    title: 'Introduction to Theology',
    description: 'Explore the fundamental concepts and principles of theological study.',
    duration: '45 min',
    price: '$49',
    videos: [
      {
        id: 'video-1',
        title: 'Module 1: Introduction and Overview',
        videoUrl: 'https://www.youtube.com/embed/ZFlZW6hWPro',
      },
      {
        id: 'video-2',
        title: 'Module 2: Core Concepts',
        videoUrl: 'https://www.youtube.com/embed/oR6txCok6Ao',
      },
      {
        id: 'video-3',
        title: 'Module 3: Key Doctrines',
        videoUrl: 'https://www.youtube.com/embed/av25t75y0JU',
      },
      {
        id: 'video-4',
        title: 'Module 4: Applications',
        videoUrl: 'https://www.youtube.com/embed/id3H646l57U',
      },
      {
        id: 'video-5',
        title: 'Module 5: Review and Next Steps',
        videoUrl: 'https://www.youtube.com/embed/4Kzs1cLQ7qc',
      },
    ],
    resources: [
      {
        id: 'notes',
        label: 'Lecture Notes (PDF)',
        url: 'https://example.com/resources/introduction-to-theology-notes.pdf',
      },
    ],
  },
  2: {
    title: 'Biblical Hermeneutics',
    description: 'Learn the art and science of biblical interpretation.',
    duration: '60 min',
    price: '$59',
    videos: [
      {
        id: 'video-1',
        title: 'Module 1: Introduction and Overview',
        videoUrl: 'https://www.youtube.com/embed/ZFlZW6hWPro',
      },
      {
        id: 'video-2',
        title: 'Module 2: Core Concepts',
        videoUrl: 'https://www.youtube.com/embed/oR6txCok6Ao',
      },
      {
        id: 'video-3',
        title: 'Module 3: Key Doctrines',
        videoUrl: 'https://www.youtube.com/embed/av25t75y0JU',
      },
      {
        id: 'video-4',
        title: 'Module 4: Applications',
        videoUrl: 'https://www.youtube.com/embed/id3H646l57U',
      },
      {
        id: 'video-5',
        title: 'Module 5: Review and Next Steps',
        videoUrl: 'https://www.youtube.com/embed/4Kzs1cLQ7qc',
      },
    ],
    resources: [
      {
        id: 'guide',
        label: 'Interpretation Guide (PDF)',
        url: 'https://example.com/resources/biblical-hermeneutics-guide.pdf',
      },
    ],
  },
  3: {
    title: 'Church History I',
    description: 'Journey through the early centuries of Christian history.',
    duration: '55 min',
    price: '$55',
    videos: [
      {
        id: 'video-1',
        title: 'Module 1: Introduction and Overview',
        videoUrl: 'https://www.youtube.com/embed/ZFlZW6hWPro',
      },
      {
        id: 'video-2',
        title: 'Module 2: Core Concepts',
        videoUrl: 'https://www.youtube.com/embed/oR6txCok6Ao',
      },
      {
        id: 'video-3',
        title: 'Module 3: Key Doctrines',
        videoUrl: 'https://www.youtube.com/embed/av25t75y0JU',
      },
      {
        id: 'video-4',
        title: 'Module 4: Applications',
        videoUrl: 'https://www.youtube.com/embed/id3H646l57U',
      },
      {
        id: 'video-5',
        title: 'Module 5: Review and Next Steps',
        videoUrl: 'https://www.youtube.com/embed/4Kzs1cLQ7qc',
      },
    ],
    resources: [
      {
        id: 'timeline',
        label: 'Historical Timeline (PDF)',
        url: 'https://example.com/resources/church-history-timeline.pdf',
      },
    ],
  },
  4: {
    title: 'Systematic Theology',
    description: 'Understand the organized study of Christian doctrines.',
    duration: '70 min',
    price: '$69',
    videos: [
      {
        id: 'video-1',
        title: 'Module 1: Introduction and Overview',
        videoUrl: 'https://www.youtube.com/embed/ZFlZW6hWPro',
      },
      {
        id: 'video-2',
        title: 'Module 2: Core Concepts',
        videoUrl: 'https://www.youtube.com/embed/oR6txCok6Ao',
      },
      {
        id: 'video-3',
        title: 'Module 3: Key Doctrines',
        videoUrl: 'https://www.youtube.com/embed/av25t75y0JU',
      },
      {
        id: 'video-4',
        title: 'Module 4: Applications',
        videoUrl: 'https://www.youtube.com/embed/id3H646l57U',
      },
      {
        id: 'video-5',
        title: 'Module 5: Review and Next Steps',
        videoUrl: 'https://www.youtube.com/embed/4Kzs1cLQ7qc',
      },
    ],
    resources: [
      {
        id: 'outline',
        label: 'Doctrine Outline (PDF)',
        url: 'https://example.com/resources/systematic-theology-outline.pdf',
      },
    ],
  },
} as const;

const CourseDetail = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams();

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

  const numericId = courseId ? parseInt(courseId, 10) : NaN;
  const course = Number.isNaN(numericId) ? null : (mockCourseDetails as any)[numericId];

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Course not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            Back to courses
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <iframe
                className="w-full h-full"
                src={course.videos[0].videoUrl}
                title={course.videos[0].title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription className="mt-2">{course.description}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <Badge variant="secondary">{course.duration}</Badge>
                </div>
              </div>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">About this course</p>
                  <p>
                    This introductory theology course walks you through the big questions of the Christian
                    faith in a clear, structured way. You&apos;ll move from basic concepts to practical
                    application in ministry and everyday life.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Requirements</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Basic familiarity with the Bible.</li>
                    <li>Willingness to reflect and take notes.</li>
                    <li>Internet connection to watch the video lessons.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Who this course is for</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>New believers wanting a structured overview of theology.</li>
                    <li>Lay leaders and volunteers in local churches.</li>
                    <li>Anyone curious about the core doctrines of the Christian faith.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Modules included</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Module 1: Introduction and Overview</li>
                    <li>Module 2: Core Concepts</li>
                    <li>Module 3: Key Doctrines</li>
                    <li>Module 4: Applications</li>
                    <li>Module 5: Review and Next Steps</li>
                  </ul>
                </div>
                <div className="pt-2 border-t mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Course price</p>
                    <p className="text-2xl font-bold text-primary">{course.price}</p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => {
                      navigate(`/courses/${courseId}/learn`);
                    }}
                  >
                    Buy course
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
