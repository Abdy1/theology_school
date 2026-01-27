import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { ArrowLeft, Shield, Eye } from 'lucide-react';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Configure PDF.js worker with static URL
import { GlobalWorkerOptions } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

const API_BASE_URL = 'https://dothanministries.org';

interface Book {
  id: number;
  title: string;
  author: string;
  file_url: string;
}

const BookReader = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [watermarkPosition, setWatermarkPosition] = useState({ x: 20, y: 20 });
  const [pdfError, setPdfError] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Create default layout plugin with disabled download/print
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    toolbarPlugin: {
      downloadPlugin: {
        enabled: false
      },
      printPlugin: {
        enabled: false
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!bookId) {
        navigate('/library');
        return;
      }

      try {
        // Get user from localStorage
        const userData = localStorage.getItem('theology-user');
        if (!userData) {
          navigate('/login');
          return;
        }
        
        const userInfo = JSON.parse(userData);
        setUser(userInfo);

        // Check if user has access to this book
        const accessResponse = await fetch(`${API_BASE_URL}/api/books/my-books/${userInfo.id}`);
        if (accessResponse.ok) {
          const userBooks = await accessResponse.json();
          const hasBookAccess = userBooks.some((userBook: any) => userBook.id === parseInt(bookId));
          setHasAccess(hasBookAccess);

          if (!hasBookAccess) {
            alert('You do not have access to this book');
            navigate('/library');
            return;
          }
        } else {
          navigate('/library');
          return;
        }

        // Get book details
        const bookResponse = await fetch(`${API_BASE_URL}/api/books/${bookId}`);
        if (bookResponse.ok) {
          const bookData = await bookResponse.json();
          setBook(bookData);
          
          // Get secure PDF URL
          const pdfResponse = await fetch(`${API_BASE_URL}/api/books/${bookId}/view?user_id=${userInfo.id}`);
          if (pdfResponse.ok) {
            const pdfData = await pdfResponse.json();
            console.log('PDF URL received:', pdfData);
            // Ensure full URL for the PDF
            const fullPdfUrl = pdfData.fileUrl.startsWith('http') 
              ? pdfData.fileUrl 
              : `${API_BASE_URL}${pdfData.fileUrl}`;
            console.log('Full PDF URL:', fullPdfUrl);
            setPdfUrl(fullPdfUrl);
          } else {
            const errorText = await pdfResponse.text();
            console.error('Failed to get PDF URL:', pdfResponse.status, errorText);
            throw new Error(`Failed to get PDF URL: ${errorText}`);
          }
        }
      } catch (error) {
        console.error('Failed to load book:', error);
        alert('Failed to load book. Please try again.');
        navigate('/library');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId, navigate]);

  // Watermark position randomization
  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPosition({
        x: Math.random() * 60 + 20, // 20-80% width
        y: Math.random() * 60 + 20  // 20-80% height
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Security event handlers
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
      return false;
    };

    const blockContextMenu = (e: MouseEvent) => e.preventDefault();
    const blockKeyboard = (e: KeyboardEvent) => {
      if (
        e.ctrlKey && (e.key === 'p' || e.key === 's') || 
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
        return false;
      }
    };

    const blockPrint = (e: Event) => {
      e.preventDefault();
      window.print = () => {};
      return false;
    };

    const blockCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      return false;
    };

    const blockSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockKeyboard);
    window.addEventListener('beforeprint', blockPrint);
    document.addEventListener('copy', blockCopy);
    document.addEventListener('selectstart', blockSelectStart);

    // Add CSS for print protection
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        body:after {
          content: "Printing is disabled for protected content";
          visibility: visible;
          display: block;
          text-align: center;
          font-size: 24px;
          color: red;
          padding: 50px;
        }
      }
      
      .pdf-viewer-container {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
      
      .pdf-viewer-container * {
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeyboard);
      window.removeEventListener('beforeprint', blockPrint);
      document.removeEventListener('copy', blockCopy);
      document.removeEventListener('selectstart', blockSelectStart);
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Breadcrumb />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading book...</div>
        </div>
      </div>
    );
  }

  if (!book || !hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Breadcrumb />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Book not found or access denied</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Breadcrumb />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{book.title}</h1>
              <p className="text-muted-foreground">by {book.author}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Protected Content</span>
          </div>
        </div>

        {/* PDF Viewer Container */}
        <div 
          ref={containerRef}
          className="pdf-viewer-container relative bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
        >
          {/* Watermark Overlay */}
          <div 
            className="absolute pointer-events-none z-50 opacity-15"
            style={{
              left: `${watermarkPosition.x}%`,
              top: `${watermarkPosition.y}%`,
              fontSize: '14px',
              color: '#000',
              transform: 'rotate(-45deg)',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          >
            {user?.email} • {book.title} • {new Date().toLocaleString()}
          </div>

          {/* PDF Viewer */}
          {pdfUrl ? (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfUrl}
                plugins={[defaultLayoutPluginInstance]}
                // Security props
                onRender={() => {
                  // Additional security after render
                  const viewerElement = containerRef.current?.querySelector('[data-testid="core__viewer"]');
                  if (viewerElement) {
                    viewerElement.setAttribute('oncontextmenu', 'return false');
                    viewerElement.setAttribute('onselectstart', 'return false');
                    viewerElement.setAttribute('ondragstart', 'return false');
                  }
                }}
                // Error handling
                onError={(error) => {
                  console.error('PDF Viewer Error:', error);
                  setPdfError(`PDF Error: ${error.message || 'Unknown error'}`);
                }}
                // File loading error
                onDocumentLoad={(e) => {
                  console.log('PDF Document loaded successfully:', e);
                  setPdfError('');
                }}
              />
            </Worker>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Loading PDF...</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Debug: {pdfUrl ? 'URL received' : 'Waiting for URL...'}
                </p>
              </div>
            </div>
          )}

          {/* Error Display */}
          {pdfError && (
            <div className="absolute inset-0 bg-white flex items-center justify-center z-50">
              <div className="text-center p-8">
                <div className="text-red-600 mb-4">
                  <Shield className="h-12 w-12 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">PDF Loading Error</h3>
                </div>
                <p className="text-muted-foreground mb-4">{pdfError}</p>
                <div className="space-y-2 text-sm text-left bg-muted p-4 rounded">
                  <p><strong>Debug Info:</strong></p>
                  <p>Book ID: {bookId}</p>
                  <p>User ID: {user?.id}</p>
                  <p>PDF URL: {pdfUrl || 'Not set'}</p>
                  <p>Book Title: {book?.title}</p>
                  <p>File URL: {book?.file_url}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => window.location.reload()}>
                    Reload
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/my-library')}>
                    Back to Library
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>This content is protected. Download, printing, and copying are disabled.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReader;
