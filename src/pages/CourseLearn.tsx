import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Play, ClipboardList } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VideoPlayer from '@/components/VideoPlayer';

const API_BASE_URL = 'http://localhost:8081';

// Convert various video URLs into proper format for VideoPlayer
const normalizeVideoUrl = (url: string) => {
  if (!url) return url;
  try {
    // Handle uploaded videos (local files)
    if (url.startsWith('/uploads/')) {
      return `${API_BASE_URL}${url}`;
    }
    
    // Handle YouTube watch links and short links
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const urlObj = new URL(url);
      let videoId = urlObj.searchParams.get('v');
      if (!videoId && urlObj.hostname === 'youtu.be') {
        videoId = urlObj.pathname.replace('/', '');
      }
      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
      }
    }

    // Handle Google Drive share links
    if (url.includes('drive.google.com')) {
      // Formats: /file/d/<id>/view , /open?id=<id> , /uc?id=<id>
      const urlObj = new URL(url);

      const fileIdMatch = urlObj.pathname.match(/\/d\/([^/]+)/);
      const fileId =
        fileIdMatch?.[1] ||
        urlObj.searchParams.get('id');

      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }

    return url;
  } catch {
    return url;
  }
};

const CourseLearn = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [course, setCourse] = useState<any>(null);
  const [courseLoading, setCourseLoading] = useState(true);
  const [enrollmentId, setEnrollmentId] = useState<number | null>(null);
  const [enrollmentProgress, setEnrollmentProgress] = useState<number | null>(null);
  const [completedVideoIds, setCompletedVideoIds] = useState<Set<string>>(new Set());
  const [initializedFromEnrollment, setInitializedFromEnrollment] = useState(false);
  const { toast } = useToast();

  const [assignmentDialogModuleId, setAssignmentDialogModuleId] = useState<number | null>(null);
  const [assignmentAnswer, setAssignmentAnswer] = useState('');
  const [assignmentFileUrl, setAssignmentFileUrl] = useState('');
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);
  const [assignmentStatus, setAssignmentStatus] = useState<Record<number, any>>({});
  const [enrollmentGrade, setEnrollmentGrade] = useState<any>(null);
  const [certificateRequested, setCertificateRequested] = useState(false);

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

  useEffect(() => {
    const fetchEnrollment = async () => {
      if (!user?.id) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/enrollments/my?userId=${user.id}`);
        if (!response.ok) return;
        const list = await response.json();
        const current = list.find((e: any) => String(e.courseId) === String(courseId));
        if (current) {
          setEnrollmentId(current.enrollmentId ?? current.id ?? null);
          setEnrollmentProgress(typeof current.progressPercent === 'number' ? current.progressPercent : null);
          setEnrollmentGrade(current); // Set enrollment grade for certificate functionality
        }
      } catch (error) {
        console.error('Failed to fetch enrollment', error);
      }
    };

    fetchEnrollment();
  }, [user, courseId]);

  const videos = useMemo(
    () =>
      course?.modules?.flatMap((module: any, moduleIndex: number) =>
        module.videos?.map((video: any, videoIndex: number) => ({
          id: `module-${moduleIndex}-video-${videoIndex}`,
          title: video.title,
          videoUrl: video.url,
          type: video.type,
          moduleIndex,
        })) || [],
      ) || [],
    [course],
  );

  const totalVideos = videos.length;
  const progressPercent = totalVideos ? Math.round((completedVideoIds.size / totalVideos) * 100) : 0;

  // Initialize completed videos and current video from enrollment progress
  useEffect(() => {
    if (initializedFromEnrollment || !videos.length) return;

    if (typeof enrollmentProgress === 'number' && enrollmentProgress > 0) {
      const videosToMark = Math.min(
        videos.length,
        Math.round((enrollmentProgress / 100) * videos.length)
      );

      if (videosToMark > 0) {
        const newSet = new Set<string>();
        for (let i = 0; i < videosToMark; i++) {
          newSet.add(videos[i].id);
        }
        setCompletedVideoIds(newSet);

        const nextIndex = videosToMark < videos.length ? videosToMark : videos.length - 1;
        setSelectedVideoId(videos[nextIndex].id);
      } else if (!selectedVideoId && videos[0]) {
        setSelectedVideoId(videos[0].id);
      }
    } else if (!selectedVideoId && videos[0]) {
      setSelectedVideoId(videos[0].id);
    }

    setInitializedFromEnrollment(true);
  }, [videos, enrollmentProgress, initializedFromEnrollment, selectedVideoId]);

  const activeVideo =
    videos.find((video) => video.id === selectedVideoId) || videos[0] || null;

  const openAssignmentDialog = async (moduleId: number, assignmentId: number) => {
    setAssignmentDialogModuleId(moduleId);
    setAssignmentAnswer('');
    setAssignmentFileUrl('');

    if (!enrollmentId || !user?.id) return;

    try {
      const resp = await fetch(
        `${API_BASE_URL}/api/assignments/${assignmentId}/my?enrollmentId=${enrollmentId}&userId=${user.id}`,
      );
      if (resp.ok) {
        const data = await resp.json();
        setAssignmentStatus((prev) => ({
          ...prev,
          [assignmentId]: data,
        }));
      }
    } catch (error) {
      console.error('Failed to load assignment status', error);
    }
  };

  const handleAssignmentFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const resp = await fetch(`${API_BASE_URL}/api/upload/file`, {
        method: 'POST',
        body: formData,
      });
      if (!resp.ok) {
        throw new Error('Upload failed');
      }
      const result = await resp.json();
      setAssignmentFileUrl(result.url);
      toast({
        title: 'File uploaded',
        description: 'Your file has been attached to this assignment.',
      });
    } catch (error) {
      console.error('Assignment upload error', error);
      toast({
        title: 'Upload failed',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAssignmentSubmit = async (assignmentId: number) => {
    if (!enrollmentId || !user?.id) {
      toast({
        title: 'Cannot submit',
        description: 'Missing enrollment or user. Please re-open course.',
        variant: 'destructive',
      });
      return;
    }

    if (!assignmentAnswer.trim() && !assignmentFileUrl) {
      toast({
        title: 'Add some work first',
        description: 'Write an answer or upload a file before submitting.',
      });
      return;
    }

    setAssignmentSubmitting(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/assignments/${assignmentId}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enrollmentId,
          userId: Number(user.id),
          answerText: assignmentAnswer || null,
          attachmentUrl: assignmentFileUrl || null,
        }),
      });

      if (!resp.ok) {
        throw new Error('Submit failed');
      }

      toast({
        title: 'Assignment submitted',
        description: 'Your instructor will review it soon.',
      });

      // Close the dialog after successful submission
      setAssignmentDialogModuleId(null);

      // Refresh status
      const statusResp = await fetch(
        `${API_BASE_URL}/api/assignments/${assignmentId}/my?enrollmentId=${enrollmentId}&userId=${user.id}`,
      );
      if (statusResp.ok) {
        const data = await statusResp.json();
        setAssignmentStatus((prev) => ({
          ...prev,
          [assignmentId]: data,
        }));
      }
    } catch (error) {
      console.error('Submit assignment error', error);
      toast({
        title: 'Could not submit',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const handleQuizSubmit = async (moduleId: number, quizId: number, answers: Record<number, string>) => {
    if (!enrollmentId || !user?.id) {
      toast({
        title: 'Cannot submit quiz',
        description: 'Missing enrollment or user. Please re-open course.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/api/quiz/${quizId}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: Number(user.id),
          courseId: Number(courseId),
          moduleId: moduleId,
          answers: answers,
        }),
      });

      if (!resp.ok) {
        throw new Error('Quiz submit failed');
      }

      const result = await resp.json();
      
      toast({
        title: result.passed ? 'Quiz passed!' : 'Quiz not passed',
        description: `Score: ${result.score}% (${result.correctAnswers}/${result.totalQuestions})`,
        variant: result.passed ? 'default' : 'destructive',
      });

      // Refresh enrollment grade
      await fetchEnrollmentGrade();
    } catch (error) {
      console.error('Submit quiz error', error);
      toast({
        title: 'Could not submit quiz',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const fetchEnrollmentGrade = async () => {
    if (!enrollmentId || !user?.id || !courseId) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/enrollments/my?userId=${user.id}`);
      if (response.ok) {
        const enrollments = await response.json();
        const currentEnrollment = enrollments.find((e: any) => String(e.courseId) === String(courseId));
        if (currentEnrollment) {
          setEnrollmentGrade(currentEnrollment);
        }
      }
    } catch (error) {
      console.error('Failed to fetch enrollment grade:', error);
    }
  };

  const handleCertificateRequest = async () => {
    if (!enrollmentGrade || enrollmentGrade.finalGrade < 70) {
      toast({
        title: 'Not eligible for certificate',
        description: 'You need a final grade of 70% or higher to receive a certificate.',
        variant: 'destructive',
      });
      return;
    }

    if (enrollmentGrade.certificateIssued) {
      toast({
        title: 'Certificate already issued',
        description: 'You have already received a certificate for this course.',
        variant: 'destructive',
      });
      return;
    }

    setCertificateRequested(true);
    try {
      const requestBody = {
        userId: Number(user.id),
        courseId: Number(courseId),
      };
      
      console.log('Certificate request body:', requestBody);
      
      const resp = await fetch(`${API_BASE_URL}/api/assignments/certificate/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Certificate response status:', resp.status);
      
      if (!resp.ok) {
        const errorText = await resp.text();
        console.error('Certificate error response:', errorText);
        throw new Error('Certificate generation failed');
      }

      const result = await resp.json();
      
      toast({
        title: 'Certificate generated!',
        description: 'Your certificate has been generated successfully.',
      });

      // Redirect to certificate view page
      navigate(`/certificate/${result.certificate.certificateId}`);

      // Refresh enrollment grade
      await fetchEnrollmentGrade();
      
      // Download certificate (in real app, this would open PDF)
      const certificateUrl = `/api/certificates/${result.certificate.certificateId}.pdf`;
      window.open(certificateUrl, '_blank');
      
    } catch (error) {
      console.error('Certificate generation error:', error);
      toast({
        title: 'Certificate generation failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setCertificateRequested(false);
    }
  };

  const handleMarkComplete = async () => {
    if (!activeVideo) return;
    const updated = new Set(completedVideoIds);
    updated.add(activeVideo.id);
    setCompletedVideoIds(updated);

    if (!enrollmentId || totalVideos === 0) {
      toast({
        title: 'Progress not saved',
        description: 'Missing enrollment. Please reopen the course after buying.',
        variant: 'destructive',
      });
      return;
    }

    const progressPercent = Math.min(
      100,
      Math.round((updated.size / totalVideos) * 100)
    );

    try {
      await fetch(`${API_BASE_URL}/api/enrollments/${enrollmentId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progressPercent }),
      });
      toast({
        title: 'Progress saved',
        description: `Course is ${progressPercent}% complete.`,
      });
    } catch (error) {
      console.error('Failed to update progress', error);
      toast({
        title: 'Could not save progress',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }

    const currentIndex = videos.findIndex((v) => v.id === activeVideo.id);
    const next = videos[currentIndex + 1];
    if (next) {
      setSelectedVideoId(next.id);
    }
  };

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
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Course not found.</p>
        </div>
      </div>
    );
  }

  const currentAssignmentModule =
    assignmentDialogModuleId != null
      ? course.modules.find((m: any) => m.id === assignmentDialogModuleId)
      : null;

  const currentAssignment = currentAssignmentModule?.assignment;
  const currentAssignmentStatus = currentAssignment
    ? assignmentStatus[currentAssignment.id] || null
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(`/courses/${courseId}`)}>
            Back to course overview
          </Button>
          <div className="flex items-center gap-4">
            {progressPercent === 100 && enrollmentGrade && (
              <Button 
                onClick={handleCertificateRequest}
                disabled={certificateRequested || enrollmentGrade.finalGrade < 70}
                variant={enrollmentGrade.finalGrade >= 70 ? "default" : "outline"}
              >
                {certificateRequested ? 'Generating...' : 
                 enrollmentGrade.finalGrade >= 70 ? 'Request Certificate' : 
                 `Grade: ${enrollmentGrade.finalGrade?.toFixed(1)}% (Need 70%)`}
              </Button>
            )}
            <p className="text-sm text-muted-foreground">You own this course</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <Card className="overflow-hidden">
            <div className="w-full" style={{ minHeight: '500px' }}>
              {activeVideo ? (
                <VideoPlayer
                  videoUrl={activeVideo.videoUrl}
                  title={activeVideo.title}
                  onVideoComplete={() => {
                    // Auto-mark video as completed
                    if (!completedVideoIds.has(activeVideo.id)) {
                      setCompletedVideoIds(prev => new Set([...prev, activeVideo.id]));
                      toast({
                        title: 'Video completed!',
                        description: `"${activeVideo.title}" has been marked as completed.`,
                      });
                    }
                  }}
                  onProgress={(currentTime, duration) => {
                    // Optionally track progress to backend
                    console.log(`Video progress: ${currentTime}/${duration}`);
                  }}
                  disableFastForward={true}
                  autoMarkComplete={true}
                />
              ) : (
                <div className="text-center py-20">
                  <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No video available</p>
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle>{activeVideo?.title || 'No video selected'}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 border-t">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Progress: {progressPercent}% ({completedVideoIds.size}/{totalVideos || 0} videos)
                </p>
                <Button
                  variant="default"
                  size="sm"
                  disabled={!activeVideo}
                  onClick={handleMarkComplete}
                >
                  Mark video complete
                </Button>
              </div>
              {!enrollmentId && (
                <p className="text-xs text-destructive">
                  Progress saving requires an enrollment. Make sure you bought this course.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            {course?.modules?.map((module: any, moduleIndex: number) => (
              <Card key={module.id ?? moduleIndex} className="divide-y">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {module.videos?.length || 0} video(s) · {module.materials?.length || 0} material(s) · {module.questions?.length || 0} question(s)
                      </p>
                    </div>
                    <Badge variant="secondary">Module {moduleIndex + 1}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <p className="font-semibold flex items-center gap-2">
                      <Play className="h-4 w-4" /> Videos
                    </p>
                    {module.videos?.length ? (
                      module.videos.map((video: any, videoIndex: number) => {
                        const id = `module-${moduleIndex}-video-${videoIndex}`;
                        const isActive = activeVideo?.id === id;
                        const isCompleted = completedVideoIds.has(id);
                        return (
                          <div
                            key={id}
                            className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                              isCompleted ? 'bg-muted border-primary/60' : ''
                            }`}
                          >
                            <div>
                              <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                {video.title}
                              </p>
                              <p className="text-xs text-muted-foreground">Video {videoIndex + 1}</p>
                            </div>
                            <Button
                              variant={isActive ? 'default' : isCompleted ? 'outline' : 'ghost'}
                              size="sm"
                              onClick={() => setSelectedVideoId(id)}
                            >
                              {isActive ? 'Watching' : isCompleted ? 'Replay' : 'Watch'}
                            </Button>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">No videos in this module.</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <p className="font-semibold flex items-center gap-2">
                      <Download className="h-4 w-4" /> Materials
                    </p>
                    {module.materials?.length ? (
                      module.materials.map((resource: any) => (
                        <div key={resource.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                          <div>
                            <p className="font-medium">{resource.title}</p>
                            <p className="text-xs text-muted-foreground">{resource.fileType || 'File'}</p>
                          </div>
                          <Button asChild variant="outline" size="sm">
                            <a href={resource.url} target="_blank" rel="noreferrer">
                              Download
                            </a>
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No materials in this module.</p>
                    )}
                  </div>

                  {module.assignment && (
                    <div className="space-y-2 border-t pt-3 mt-2">
                      <p className="font-semibold flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" /> Assignment
                      </p>
                      {module.assignment.description && (
                        <p className="text-sm text-muted-foreground">
                          {module.assignment.description}
                        </p>
                      )}
                      {module.assignment.instructions && (
                        <p className="text-xs text-muted-foreground whitespace-pre-line">
                          {module.assignment.instructions}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Passing score: {module.assignment.passingPercent ?? 70}%
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAssignmentDialog(module.id, module.assignment.id)}
                      >
                        View / submit assignment
                      </Button>
                    </div>
                  )}

                  {module.questions?.length ? (
                    <div className="pt-2 flex gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <Link to={`/courses/${courseId}/modules/${moduleIndex}/quiz`}>
                          Take module quiz
                        </Link>
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog
        open={assignmentDialogModuleId != null}
        onOpenChange={(open) => {
          if (!open) setAssignmentDialogModuleId(null);
        }}
      >
        <DialogContent>
          {currentAssignment && (
            <>
              <DialogHeader>
                <DialogTitle>{currentAssignment.title}</DialogTitle>
                {currentAssignment.description && (
                  <DialogDescription>{currentAssignment.description}</DialogDescription>
                )}
              </DialogHeader>
              <div className="space-y-4 py-2">
                {currentAssignment.instructions && (
                  <div className="text-sm text-muted-foreground whitespace-pre-line border rounded-md p-3 bg-muted/40">
                    {currentAssignment.instructions}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Passing score for this assignment: {currentAssignment.passingPercent ?? 70}%
                </p>

                {currentAssignmentStatus && (
                  <div className="text-xs rounded-md border p-2 space-y-1">
                    <p>
                      Status: <span className="font-medium">{currentAssignmentStatus.status}</span>
                    </p>
                    {typeof currentAssignmentStatus.gradePercent === 'number' && (
                      <p>Grade: {currentAssignmentStatus.gradePercent}%</p>
                    )}
                    <p>
                      Passed:{' '}
                      <span className="font-medium">
                        {currentAssignmentStatus.passed ? 'Yes' : 'No'}
                      </span>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Written answer</Label>
                  <Textarea
                    rows={5}
                    value={assignmentAnswer}
                    onChange={(e) => setAssignmentAnswer(e.target.value)}
                    placeholder="Write your response here..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attach a file (optional)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                    onChange={handleAssignmentFileUpload}
                  />
                  {assignmentFileUrl && (
                    <p className="text-xs text-muted-foreground">
                      Attached:{' '}
                      <a
                        href={assignmentFileUrl}
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        View file
                      </a>
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  disabled={assignmentSubmitting}
                  onClick={() => handleAssignmentSubmit(currentAssignment.id)}
                >
                  {assignmentSubmitting ? 'Submitting...' : 'Submit assignment'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseLearn;
