import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:8081';

interface CertificateData {
  certificateId: string;
  studentName: string;
  courseTitle: string;
  finalGrade: number;
  gradeLetter: string;
  earnedPoints: number;
  totalPoints: number;
  completedAt: string;
  breakdown: {
    assignments: any[];
    quizzes: any[];
  };
}

const CertificateView = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificateId) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/certificates/${certificateId}`);
        if (response.ok) {
          const data = await response.json();
          setCertificate(data);
        } else {
          toast({
            title: 'Certificate not found',
            description: 'This certificate may not exist or has been revoked.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching certificate:', error);
        toast({
          title: 'Error',
          description: 'Failed to load certificate.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId, toast]);

  const handleDownload = async () => {
    if (!certificate) return;

    setDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/certificates/${certificateId}/pdf`, {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Certificate-${certificate.certificateId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Download started',
          description: 'Your certificate PDF is being downloaded.',
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Download failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!certificate) return;

    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Course Certificate',
          text: `I've successfully completed "${certificate.courseTitle}" with a grade of ${certificate.finalGrade}%!`,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link copied',
        description: 'Certificate link copied to clipboard.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading certificate...</div>
        </div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Certificate Not Found</h1>
            <p className="text-muted-foreground">This certificate may not exist or has been revoked.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto">
          {/* Certificate Display */}
          <Card className="border-2 border-gold bg-gradient-to-br from-slate-50 to-slate-100 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                {/* Header */}
                <div className="border-b-2 border-gold pb-4">
                  <h1 className="text-3xl font-bold text-slate-800">Certificate of Completion</h1>
                  <p className="text-slate-600 mt-2">Theology School Online</p>
                </div>

                {/* Certificate Content */}
                <div className="py-8">
                  <p className="text-lg text-slate-700 mb-4">This is to certify that</p>
                  <h2 className="text-4xl font-bold text-slate-900 mb-6">{certificate.studentName}</h2>
                  <p className="text-lg text-slate-700 mb-4">has successfully completed the course</p>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-6">{certificate.courseTitle}</h3>
                  
                  {/* Grade and Achievement */}
                  <div className="flex justify-center gap-8 mb-6">
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Final Grade</p>
                      <p className="text-3xl font-bold text-green-600">{certificate.finalGrade}%</p>
                      <Badge variant="secondary" className="mt-1">{certificate.gradeLetter}</Badge>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Points Earned</p>
                      <p className="text-3xl font-bold text-blue-600">{certificate.earnedPoints}/{certificate.totalPoints}</p>
                    </div>
                  </div>

                  {/* Completion Date */}
                  <p className="text-slate-600">
                    Completed on {new Date(certificate.completedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Verification */}
                <div className="border-t-2 border-gold pt-4">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-slate-600">Certificate ID: {certificate.certificateId}</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Verify this certificate at: {window.location.origin}/verify/{certificate.certificateId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <Button onClick={handleDownload} disabled={downloading} size="lg">
              <Download className="w-4 h-4 mr-2" />
              {downloading ? 'Generating PDF...' : 'Download PDF'}
            </Button>
            <Button variant="outline" onClick={handleShare} size="lg">
              <Share2 className="w-4 h-4 mr-2" />
              Share Certificate
            </Button>
          </div>

          {/* Course Breakdown */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Course Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Assignments</h3>
                  {certificate.breakdown.assignments.length > 0 ? (
                    <div className="space-y-2">
                      {certificate.breakdown.assignments.map((assignment, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{assignment.title}</span>
                          <span className="font-medium">{assignment.gradePercent}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No assignments completed</p>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Quizzes</h3>
                  {certificate.breakdown.quishi.length > 0 ? (
                    <div className="space-y-2">
                      {certificate.breakdown.quizzes.map((quiz, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{quiz.title}</span>
                          <span className="font-medium">{quiz.gradePercent}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No quizzes completed</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
