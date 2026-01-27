import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, ArrowLeft, Home, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'https://dothanministries.org';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactionStatus, setTransactionStatus] = useState<any>(null);
  const { toast } = useToast();

  const tx_ref = searchParams.get('tx_ref');
  const mode = searchParams.get('mode');

  useEffect(() => {
    if (!tx_ref) return;

    let pollInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    let pollCount = 0;
    const maxPolls = 20; // Poll for maximum 2 minutes (20 * 6 seconds)

    const checkPaymentStatus = async () => {
      pollCount++;
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/payment/status/${tx_ref}`);
        if (response.ok) {
          const data = await response.json();
          setTransactionStatus(data.transaction);
          
          if (data.transaction.status === 'success') {
            toast({
              title: 'Payment Successful!',
              description: 'You have been enrolled in the course.',
            });
            // Stop polling on success
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
            setLoading(false);
          } else if (data.transaction.status === 'failed') {
            toast({
              title: 'Payment Failed',
              description: 'Your payment could not be processed.',
              variant: 'destructive',
            });
            // Stop polling on failure
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
            setLoading(false);
          }
          // Continue polling if status is still 'pending'
        } else {
          console.error('Status check failed:', response.status);
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
      }
    };

    // Start polling immediately
    checkPaymentStatus();
    
    // Then poll every 3 seconds
    pollInterval = setInterval(checkPaymentStatus, 3000);
    
    // Set a timeout to stop polling after max attempts
    timeoutId = setTimeout(() => {
      clearInterval(pollInterval);
      setLoading(false);
      if (!transactionStatus || transactionStatus.status === 'pending') {
        toast({
          title: 'Payment Timeout',
          description: 'Payment verification is taking longer than expected. Please check your email or contact support.',
          variant: 'destructive',
        });
        // Set status to failed after timeout
        setTransactionStatus({ status: 'failed', tx_ref });
      }
    }, maxPolls * 3000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeoutId);
    };
  }, [tx_ref]);

  const getStatusIcon = () => {
    if (!transactionStatus) return null;
    switch (transactionStatus.status) {
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'pending':
        return <div className="h-12 w-12 text-yellow-500 animate-spin">⏳</div>;
      case 'failed':
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    if (!transactionStatus) return 'Checking...';
    switch (transactionStatus.status) {
      case 'success':
        return 'Payment Successful';
      case 'pending':
        return 'Payment Processing';
      case 'failed':
        return 'Payment Failed';
      default:
        return 'Checking...';
    }
  };

  const getStatusColor = () => {
    if (!transactionStatus) return 'text-gray-500';
    switch (transactionStatus.status) {
      case 'success':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {mode === 'test' ? 'Test Payment' : 'Payment Status'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {loading ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 border-t-transparent border-t-blue-600"></div>
                <p className="text-lg font-medium">Checking payment status...</p>
              </div>
            ) : transactionStatus ? (
              <div className="flex flex-col items-center space-y-4">
                {getStatusIcon()}
                <h2 className={`text-2xl font-bold ${getStatusColor()}`}>
                  {getStatusText()}
                </h2>
                <p className="text-gray-600 mt-2">
                  Transaction ID: <span className="font-mono">{tx_ref}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Status: <span className="font-medium">{transactionStatus.status}</span>
                </p>
                {transactionStatus.status === 'success' && (
                  <div className="mt-6 space-y-3">
                    <Button 
                      onClick={() => navigate(`/courses/${transactionStatus.course_id}/learn`)}
                      className="w-full"
                      size="lg"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      Learn Now
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`https://chapa.link/payment-receipt/${transactionStatus.reference || tx_ref}`, '_blank')}
                      className="w-full"
                      size="lg"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      View Receipt
                    </Button>
                    <Button 
                      variant="secondary"
                      onClick={() => navigate('/courses')}
                      className="w-full"
                      size="lg"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      Browse More Courses
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-red-600">No transaction found</p>
                <Button onClick={() => navigate('/courses')} className="mt-4">
                  Back to Courses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
