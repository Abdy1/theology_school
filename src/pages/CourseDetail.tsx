import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://dothanministries.org';

const CourseDetail = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setCourseLoading(false);
      }
    };

    if (user) {
      fetchCourse();
    }
  }, [user, courseId]);

  // Check if user is already enrolled
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!courseId || !user?.id) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/enrollments/my?userId=${user.id}`);
        if (response.ok) {
          const enrollments = await response.json();
          const enrolled = enrollments.some((enrollment: any) => enrollment.courseId === Number(courseId));
          setIsEnrolled(enrolled);
        }
      } catch (error) {
        console.error('Failed to check enrollment:', error);
      }
    };

    if (user && courseId) {
      checkEnrollment();
    }
  }, [user, courseId]);

  if (isLoading || courseLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Breadcrumb />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Course not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Breadcrumb />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            Back to courses
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <Card className="overflow-hidden">
            <div className="aspect-video bg-muted flex items-center justify-center">
              {course.modules && course.modules.length > 0 && course.modules[0].videos && course.modules[0].videos.length > 0 ? (
                <iframe
                  className="w-full h-full"
                  src={course.modules[0].videos[0].url.replace('watch?v=', 'embed/').replace('youtube.com', 'youtube-nocookie.com') + '?rel=0&modestbranding=1&enablejsapi=1'}
                  title={course.modules[0].videos[0].title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ minHeight: '500px' }}
                  onError={() => {
                    console.error('YouTube iframe failed to load');
                  }}
                  onLoad={() => {
                    console.log('YouTube iframe loaded successfully');
                  }}
                />
              ) : (
                <div className="text-center">
                  <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No video available</p>
                </div>
              )}
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription className="mt-2">{course.description}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <Badge variant="secondary">{course.durationMinutes} min</Badge>
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
                  <p>{course.description}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Course level</p>
                  <Badge variant="secondary">{course.level}</Badge>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">Modules included</p>
                  {course.modules && course.modules.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1">
                      {course.modules.map((module: any, index: number) => (
                        <li key={module.id}>Module {index + 1}: {module.title}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No modules available</p>
                  )}
                </div>
                {course.modules && course.modules.length > 0 && (
                  <div>
                    <p className="font-medium text-foreground mb-1">Course content</p>
                    <div className="space-y-2">
                      {course.modules.map((module: any) => (
                        <div key={module.id} className="border-l-2 border-primary pl-3">
                          <p className="font-medium text-foreground">{module.title}</p>
                          {module.videoUrls && module.videoUrls.length > 0 && (
                            <p className="text-xs">{module.videoUrls.length} video(s)</p>
                          )}
                          {module.materials && module.materials.length > 0 && (
                            <p className="text-xs">{module.materials.length} material(s)</p>
                          )}
                          {module.questions && module.questions.length > 0 && (
                            <p className="text-xs">{module.questions.length} question(s)</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Course price</p>
                    <p className="text-2xl font-bold text-primary">${course.price}</p>
                  </div>
                  {isEnrolled ? (
                    <div className="text-right">
                      <Button
                        size="lg"
                        onClick={() => navigate(`/courses/${courseId}/learn`)}
                      >
                        Continue Learning
                      </Button>
                      <p className="text-sm text-green-600 mt-2">You're enrolled in this course</p>
                    </div>
                  ) : (
                    <Button
                      size="lg"
                      disabled={enrolling}
                      onClick={async () => {
                        if (!courseId || !user?.id) {
                          toast({
                            title: 'Unable to purchase',
                            description: 'User or course missing. Please log in again.',
                            variant: 'destructive',
                          });
                          return;
                        }

                        setEnrolling(true);
                        try {
                          const response = await fetch(`${API_BASE_URL}/api/payment/initialize`, {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer YOUR_JWT_TOKEN`, // Will use actual user token
                            },
                            body: JSON.stringify({
                              userId: user.id,
                              courseId: Number(courseId),
                              amount: course.price,
                              email: user.email,
                              firstName: user.name || 'User'
                            })
                          });

                          if (!response.ok) {
                            throw new Error('Payment initialization failed');
                          }

                          const paymentData = await response.json();
                          
                          if (paymentData.success) {
                            toast({
                              title: 'Payment initiated',
                              description: 'Redirecting to payment page...',
                            });
                            // Redirect to Chapa checkout
                            window.location.href = paymentData.checkout_url;
                          } else {
                            throw new Error(paymentData.error || 'Payment failed');
                          }
                        } catch (error) {
                          console.error('Payment failed:', error);
                          toast({
                            title: 'Payment failed',
                            description: 'Please try again or contact support.',
                            variant: 'destructive',
                          });
                        } finally {
                          setEnrolling(false);
                        }
                      }}
                    >
                      {enrolling ? 'Processing...' : 'Buy course'}
                    </Button>
                  )}
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
