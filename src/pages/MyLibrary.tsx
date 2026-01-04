import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, Clock, Star, ArrowLeft, Calendar } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

// Helper function to get full image URL
const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
};

interface UserBook {
  id: number;
  title: string;
  author: string;
  description?: string;
  category?: string;
  book_type: 'digital' | 'physical' | 'both';
  cover_image?: string;
  isbn?: string;
  buy_price: number;
  rent_24h_price: number;
  rent_7d_price: number;
  access_type: 'purchased' | 'rented' | 'free';
  expires_at?: string;
  purchase_price: number;
  access_granted_at: string;
}

const MyLibrary = () => {
  const navigate = useNavigate();
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user from localStorage
        const userData = localStorage.getItem('theology-user');
        if (!userData) {
          navigate('/login');
          return;
        }
        
        const userInfo = JSON.parse(userData);
        setUser(userInfo);

        // Fetch user's books
        const response = await fetch(`${API_BASE_URL}/api/books/my-books/${userInfo.id}`);
        if (response.ok) {
          const booksData = await response.json();
          setUserBooks(booksData);
        }
      } catch (error) {
        console.error('Failed to fetch user books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleReadBook = (bookId: number) => {
    navigate(`/library/book/${bookId}/read`);
  };

  const handleViewDetails = (bookId: number) => {
    navigate(`/library/book/${bookId}`);
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return 'Less than 1 hour remaining';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your library...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/library')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
          
          <h1 className="text-4xl font-bold text-primary mb-2">My Library</h1>
          <p className="text-muted-foreground">
            Your purchased and rented books
          </p>
        </div>

        {userBooks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your library is empty</h3>
              <p className="text-muted-foreground mb-4">
                Start browsing our collection and add books to your library.
              </p>
              <Button onClick={() => navigate('/library')}>
                Browse Library
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{userBooks.length}</div>
                  <p className="text-sm text-muted-foreground">Total Books</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {userBooks.filter(book => book.access_type === 'purchased').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Purchased</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {userBooks.filter(book => book.access_type === 'rented').length}
                  </div>
                  <p className="text-sm text-muted-foreground">Rented</p>
                </CardContent>
              </Card>
            </div>

            {/* Books Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userBooks.map((book) => {
                const expired = book.expires_at ? isExpired(book.expires_at) : false;
                const timeRemaining = book.expires_at ? getTimeRemaining(book.expires_at) : null;
                
                return (
                  <Card key={book.id} className="group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="aspect-[3/4] bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
                        {book.cover_image ? (
                          <img 
                            src={getImageUrl(book.cover_image)}
                            alt={book.title}
                            className="w-full h-full object-cover rounded-md"
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              width: 'auto',
                              height: 'auto'
                            }}
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                              }
                            }}
                          />
                        ) : (
                          <BookOpen className="h-12 w-12 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <CardTitle className="text-lg line-clamp-2">
                          {book.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {book.category && (
                          <Badge variant="outline" className="text-xs">
                            {book.category}
                          </Badge>
                        )}
                        <Badge 
                          variant={book.access_type === 'purchased' ? 'default' : 'secondary'} 
                          className="text-xs"
                        >
                          {book.access_type === 'purchased' ? 'Owned' : 'Rented'}
                        </Badge>
                        {expired && (
                          <Badge variant="destructive" className="text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        {book.description && (
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {book.description}
                          </p>
                        )}
                        
                        {/* Rental Info */}
                        {book.access_type === 'rented' && book.expires_at && (
                          <div className={`text-sm p-2 rounded ${
                            expired 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">
                                {expired ? 'Expired' : timeRemaining}
                              </span>
                            </div>
                            {!expired && (
                              <p className="text-xs mt-1">
                                Expires: {new Date(book.expires_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Purchase Info */}
                        <div className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            <span>Access granted: {new Date(book.access_granted_at).toLocaleDateString()}</span>
                          </div>
                          {book.purchase_price > 0 && (
                            <div>Purchase price: ${book.purchase_price}</div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2">
                          {book.access_type === 'purchased' || (book.access_type === 'rented' && !expired) ? (
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleReadBook(book.id)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Read
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleViewDetails(book.id)}
                            >
                              Renew
                            </Button>
                          )}
                          
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewDetails(book.id)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLibrary;
