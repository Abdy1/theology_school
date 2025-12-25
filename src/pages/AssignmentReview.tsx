import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, XCircle, Save, FileText } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

interface AssignmentSubmission {
  id: number;
  status: string;
  gradePercent: number | null;
  submittedAt: string;
  reviewedAt: string | null;
  answerText: string | null;
  attachmentUrl: string | null;
  assignmentId: number;
  enrollmentId: number;
  userId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  moduleId: number;
  moduleTitle: string;
  assignmentTitle: string;
  assignmentPassingPercent: number;
}

const AssignmentReview = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submission, setSubmission] = useState<AssignmentSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const fetchSubmission = async () => {
      if (!assignmentId) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/assignments/submissions/${assignmentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch submission');
        }
        const data = await response.json();
        setSubmission(data);
        setGrade(data.gradePercent?.toString() || '');
        setFeedback(data.reviewText || '');
      } catch (error) {
        console.error('Failed to fetch submission:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [assignmentId]);

  const handleApprove = async () => {
    if (!submission || !grade) return;
    
    setReviewing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assignments/submissions/${submission.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED',
          gradePercent: parseInt(grade),
          reviewText: feedback,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve submission');
      }

      toast({
        title: 'Submission approved',
        description: 'Student has been notified of the approval.',
      });
      navigate('/instructor');
    } catch (error) {
      console.error('Failed to approve submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve submission. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!submission) return;
    
    setReviewing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/assignments/submissions/${submission.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'REJECTED',
          gradePercent: null,
          reviewText: feedback,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject submission');
      }

      toast({
        title: 'Submission rejected',
        description: 'Student has been notified of the rejection.',
      });
      navigate('/instructor');
    } catch (error) {
      console.error('Failed to reject submission:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject submission. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setReviewing(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Submission not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <Button variant="outline" onClick={() => navigate('/instructor')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Student</p>
                    <p className="font-medium">{submission.studentName}</p>
                    <p className="text-xs text-muted-foreground">{submission.studentEmail}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Submitted</p>
                    <p className="font-medium">{new Date(submission.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Course & Module</p>
                  <p className="font-medium">{submission.courseTitle} – {submission.moduleTitle}</p>
                </div>
                
                <div>
                  <p className="text-muted-foreground">Assignment</p>
                  <p className="font-medium">{submission.assignmentTitle}</p>
                  <p className="text-xs text-muted-foreground">Passing grade: {submission.assignmentPassingPercent}%</p>
                </div>

                <div>
                  <p className="text-muted-foreground">Current Status</p>
                  <Badge
                    variant={
                      submission.status === 'APPROVED'
                        ? 'default'
                        : submission.status === 'REJECTED'
                        ? 'destructive'
                        : 'secondary'
                    }
                  >
                    {submission.status}
                  </Badge>
                  {submission.reviewedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Reviewed: {new Date(submission.reviewedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Answer</CardTitle>
              </CardHeader>
              <CardContent>
                {submission.answerText ? (
                  <div className="bg-muted p-4 rounded-md">
                    <p className="whitespace-pre-wrap">{submission.answerText}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No written answer provided.</p>
                )}
                
                {submission.attachmentUrl && (
                  <div className="mt-4">
                    <Button asChild variant="outline" size="sm">
                      <a href={submission.attachmentUrl} target="_blank" rel="noreferrer">
                        <FileText className="mr-2 h-4 w-4" />
                        View Attachment
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review & Grade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grade (%)</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter grade 0-100"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    disabled={submission.status !== 'PENDING'}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Provide feedback to the student..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    disabled={submission.status !== 'PENDING'}
                  />
                </div>

                {submission.status === 'PENDING' && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleApprove}
                      disabled={!grade || reviewing}
                      className="flex-1"
                      size="sm"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {reviewing ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      disabled={reviewing}
                      className="flex-1"
                      size="sm"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      {reviewing ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                )}

                {submission.status !== 'PENDING' && (
                  <div className="pt-4">
                    <Button
                      onClick={() => navigate('/instructor')}
                      className="w-full"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Back to Dashboard
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentReview;
