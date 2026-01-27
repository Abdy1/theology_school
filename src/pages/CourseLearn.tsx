import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Play, ClipboardList, ChevronDown, ChevronRight, CheckCircle, Circle, Clock, BookOpen, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VideoPlayer from '@/components/VideoPlayer';
import { cn } from '@/lib/utils';

const API_BASE_URL = 'https://dothanministries.org';

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
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());

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

  // Fetch all assignment statuses when course loads
  useEffect(() => {
    if (!course || !enrollmentId || !user?.id) return;

    const fetchAllAssignmentStatuses = async () => {
      const assignmentPromises = course.modules
        .filter((module: any) => module.assignment)
        .map((module: any) => 
          fetch(
            `${API_BASE_URL}/api/assignments/${module.assignment.id}/my?enrollmentId=${enrollmentId}&userId=${user.id}`
          )
        );

      try {
        const responses = await Promise.all(assignmentPromises);
        const statuses: Record<number, any> = {};
        
        for (let i = 0; i < course.modules.length; i++) {
          const module = course.modules[i];
          if (module.assignment && responses[i]) {
            const response = responses[i];
            if (response.ok) {
              statuses[module.assignment.id] = await response.json();
            }
          }
        }

        setAssignmentStatus(statuses);
      } catch (error) {
        console.error('Failed to fetch assignment statuses', error);
      }
    };

    fetchAllAssignmentStatuses();
  }, [course, enrollmentId, user]);

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

  // Toggle module expansion
  const toggleModuleExpansion = (moduleId: number) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  // Calculate module progress
  const getModuleProgress = (module: any, moduleIndex: number) => {
    const moduleVideos = module.videos || [];
    if (moduleVideos.length === 0) return 0;
    
    const completedCount = moduleVideos.filter((_: any, videoIndex: number) => {
      const videoId = `module-${moduleIndex}-video-${videoIndex}`;
      return completedVideoIds.has(videoId);
    }).length;
    
    return Math.round((completedCount / moduleVideos.length) * 100);
  };

  // Get module status
  const getModuleStatus = (module: any, moduleIndex: number) => {
    const progress = getModuleProgress(module, moduleIndex);
    
    if (progress === 100) {
      return 'completed';
    } else if (progress > 0) {
      return 'in-progress';
    } else {
      return 'not-started';
    }
  };

  // Initialize completed videos and current video from enrollment progress
  useEffect(() => {
    if (initializedFromEnrollment || !videos.length) return;

    // Only initialize if we have enrollment data
    if (typeof enrollmentProgress === 'number' && enrollmentProgress > 0) {
      const videosToMark = Math.min(
        videos.length,
        Math.round((enrollmentProgress / 100) * videos.length)
      );

      if (videosToMark > 0) {
        const newCompletedIds = new Set<string>();
        for (let i = 0; i < videosToMark; i++) {
          newCompletedIds.add(videos[i].id);
        }
        setCompletedVideoIds(newCompletedIds);
        setSelectedVideoId(videos[videosToMark - 1]?.id || videos[0]?.id);
      }
    } else if (enrollmentProgress === 0) {
      // If progress is explicitly 0, start from beginning
      setSelectedVideoId(videos[0]?.id || null);
    } else {
      // If enrollmentProgress is null (still loading), don't reset anything
      // Just set a default video if none selected
      if (!selectedVideoId && videos.length > 0) {
        setSelectedVideoId(videos[0]?.id || null);
      }
      return; // Don't mark as initialized yet
    }

    setInitializedFromEnrollment(true);
  }, [videos, enrollmentProgress, initializedFromEnrollment]);

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
        setAssignmentStatus(prev => ({ ...prev, [assignmentId]: data }));
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
  const currentAssignmentStatus = currentAssignment ? assignmentStatus[currentAssignment.id] : null;

  const getDialogTitle = () => {
    if (!currentAssignment) return '';
    
    if (!currentAssignmentStatus) return currentAssignment.title;
    
    switch (currentAssignmentStatus.status) {
      case 'APPROVED':
        return `${currentAssignment.title} - Result`;
      case 'PENDING':
        return `${currentAssignment.title} - Under Review`;
      case 'REJECTED':
        return `${currentAssignment.title} - Result`;
      default:
        return currentAssignment.title;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Breadcrumb />
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 space-y-6 lg:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button variant="outline" onClick={() => navigate('/my-courses')} className="w-full sm:w-auto">
            Back to My Courses
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            {progressPercent === 100 && enrollmentGrade && (
              <Button 
                onClick={handleCertificateRequest}
                disabled={certificateRequested || enrollmentGrade.finalGrade < 70}
                variant={enrollmentGrade.finalGrade >= 70 ? "default" : "outline"}
                className="w-full sm:w-auto"
              >
                {certificateRequested ? 'Generating...' : 
                 enrollmentGrade.finalGrade >= 70 ? 'Request Certificate' : 
                 `Grade: ${enrollmentGrade.finalGrade?.toFixed(1)}% (Need 70%)`}
              </Button>
            )}
            <p className="text-sm text-muted-foreground text-center sm:text-left">You own this course</p>
          </div>
        </div>

        <div className="grid gap-6 lg:gap-8 xl:grid-cols-[2fr,1fr]">
          <Card className="overflow-hidden">
            <div className="w-full" style={{ minHeight: '400px', maxHeight: '70vh' }}>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">{activeVideo?.title || 'No video selected'}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 border-t">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  Progress: {progressPercent}% ({completedVideoIds.size}/{totalVideos || 0} videos)
                </p>
                <Button
                  variant="default"
                  size="sm"
                  disabled={!activeVideo}
                  onClick={handleMarkComplete}
                  className="w-full sm:w-auto"
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

          <div className="space-y-4 xl:sticky xl:top-4 xl:h-fit">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Content
              </h2>
              <Badge variant="outline" className="text-sm shrink-0">
                {progressPercent}% Complete
              </Badge>
            </div>
            
            {course?.modules?.map((module: any, moduleIndex: number) => {
              const moduleProgress = getModuleProgress(module, moduleIndex);
              const moduleStatus = getModuleStatus(module, moduleIndex);
              const isExpanded = expandedModules.has(module.id || moduleIndex);
              const moduleVideos = module.videos || [];
              const moduleMaterials = module.materials || [];
              const hasAssignment = !!module.assignment;
              const hasQuiz = module.questions && module.questions.length > 0;
              
              return (
                <Card key={module.id ?? moduleIndex} className="overflow-hidden border-l-4 transition-all duration-200 hover:shadow-md" 
                      style={{ 
                        borderLeftColor: moduleStatus === 'completed' ? 'hsl(var(--primary))' : 
                                       moduleStatus === 'in-progress' ? 'hsl(var(--muted-foreground))' : 'hsl(var(--border))'
                      }}>
                  <CardHeader 
                    className="cursor-pointer hover:bg-muted/50 transition-colors pb-3"
                    onClick={() => toggleModuleExpansion(module.id || moduleIndex)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2 shrink-0">
                          {moduleStatus === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          ) : moduleStatus === 'in-progress' ? (
                            <Clock className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg truncate">{module.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {moduleProgress}% complete
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {moduleVideos.length} videos
                            </span>
                            {hasAssignment && (
                              <Badge variant="secondary" className="text-xs">
                                Assignment
                              </Badge>
                            )}
                            {hasQuiz && (
                              <Badge variant="secondary" className="text-xs">
                                Quiz
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground transition-transform duration-200 shrink-0 ${
                          isExpanded ? 'rotate-180' : ''
                        }`} 
                      />
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="pt-0 space-y-4">
                      {moduleVideos.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <Play className="h-4 w-4" />
                            Videos ({moduleVideos.length})
                          </div>
                          <div className="space-y-1">
                            {moduleVideos.map((video: any, videoIndex: number) => {
                              const id = `module-${moduleIndex}-video-${videoIndex}`;
                              const isActive = activeVideo?.id === id;
                              const isCompleted = completedVideoIds.has(id);
                              return (
                                <div
                                  key={id}
                                  className={cn(
                                    "flex items-center justify-between rounded-lg border px-3 py-2 transition-colors",
                                    isActive ? "bg-primary/10 border-primary/30" : 
                                    isCompleted ? "bg-muted/50 border-primary/20" : "hover:bg-muted/30"
                                  )}
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {isCompleted ? (
                                      <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                    ) : (
                                      <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className={cn(
                                        "text-sm font-medium truncate",
                                        isCompleted && "text-muted-foreground"
                                      )}>
                                        {video.title}
                                      </p>
                                      <p className="text-xs text-muted-foreground">Video {videoIndex + 1}</p>
                                    </div>
                                  </div>
                                  <Button
                                    variant={isActive ? "default" : isCompleted ? "outline" : "ghost"}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedVideoId(id);
                                    }}
                                  >
                                    {isActive ? 'Watching' : isCompleted ? 'Replay' : 'Watch'}
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {moduleMaterials.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            Materials ({moduleMaterials.length})
                          </div>
                          <div className="space-y-1">
                            {moduleMaterials.map((resource: any) => (
                              <div key={resource.id} className="flex items-center justify-between rounded-lg border px-3 py-2 hover:bg-muted/30">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <Download className="h-4 w-4 text-muted-foreground shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{resource.title}</p>
                                    <p className="text-xs text-muted-foreground">{resource.fileType || 'File'}</p>
                                  </div>
                                </div>
                                <Button asChild variant="outline" size="sm">
                                  <a href={resource.url} target="_blank" rel="noreferrer">
                                    Download
                                  </a>
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {hasAssignment && (
                        <div className="space-y-2 border-t pt-3">
                          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <ClipboardList className="h-4 w-4" />
                            Assignment
                          </div>
                          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                            {module.assignment.description && (
                              <p className="text-sm text-muted-foreground">
                                {module.assignment.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                Passing: {module.assignment.passingPercent ?? 70}%
                              </p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAssignmentDialog(module.id, module.assignment.id);
                                }}
                              >
                                {assignmentStatus[module.assignment.id] ? (
                                  assignmentStatus[module.assignment.id].status === 'APPROVED' ? 
                                    'View Result' : 
                                    assignmentStatus[module.assignment.id].status === 'PENDING' ? 
                                      'Under Review' : 
                                      'View Assignment'
                                ) : 'Start Assignment'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {hasQuiz && (
                        <div className="pt-2">
                          <Button 
                            asChild 
                            variant="secondary" 
                            size="sm" 
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link to={`/courses/${courseId}/modules/${moduleIndex}/quiz`}>
                              Take Module Quiz
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
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
                <DialogTitle>{getDialogTitle()}</DialogTitle>
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
                    disabled={currentAssignmentStatus && currentAssignmentStatus.status !== 'PENDING'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Attach a file (optional)</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                    onChange={handleAssignmentFileUpload}
                    disabled={currentAssignmentStatus && currentAssignmentStatus.status !== 'PENDING'}
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
                {currentAssignmentStatus && currentAssignmentStatus.status !== 'PENDING' ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAssignmentDialogModuleId(null)}
                  >
                    Close
                  </Button>
                ) : (
                  <Button
                    type="button"
                    disabled={assignmentSubmitting}
                    onClick={() => handleAssignmentSubmit(currentAssignment.id)}
                  >
                    {assignmentSubmitting ? 'Submitting...' : 'Submit assignment'}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseLearn;
