import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Play } from 'lucide-react';
import { mockCourseDetails } from './CourseDetail';

const CourseLearn = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

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

  const activeVideo =
    course.videos.find((v: any) => v.id === selectedVideoId) ?? course.videos[0];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
            Back to course overview
          </Button>
          <p className="text-sm text-muted-foreground">You own this course</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              <iframe
                className="w-full h-full"
                src={activeVideo.videoUrl}
                title={activeVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <CardHeader>
              <CardTitle>{activeVideo.title}</CardTitle>
            </CardHeader>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Play className="h-4 w-4" /> Videos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.videos.map((video: any) => (
                  <div key={video.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{video.title}</p>
                    </div>
                    <Button
                      variant={video.id === activeVideo.id ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setSelectedVideoId(video.id)}
                    >
                      Watch
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-4 w-4" /> Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {course.resources.map((resource: any) => (
                  <div key={resource.id} className="flex items-center justify-between">
                    <p className="font-medium">{resource.label}</p>
                    <Button asChild variant="outline" size="sm">
                      <a href={resource.url} target="_blank" rel="noreferrer">
                        Download
                      </a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearn;
