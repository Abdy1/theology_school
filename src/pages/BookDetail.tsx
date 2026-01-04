import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Package, DollarSign, Clock, User, ArrowLeft, Star, Calendar, FileText } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

// Helper function to get full image URL
const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  return imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`;
};

interface Book {
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
  stock_quantity?: number;
  shipping_price?: number;
  status: string;
  created_at: string;
}

const BookDetail = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);

  // Debug: Log the params
  console.log('BookDetail - useParams result:', useParams());
  console.log('BookDetail - bookId from params:', bookId);

  useEffect(() => {
    const fetchData = async () => {
      console.log('useEffect running, bookId:', bookId);
      
      if (!bookId) {
        console.error('No book ID provided');
        // Don't navigate automatically, let user see the error
        setLoading(false);
        return;
      }

      console.log('Fetching book details for ID:', bookId);
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.error('Request timeout');
        setLoading(false); // Don't navigate, just stop loading
        alert('Request timed out. Please try refreshing the page.');
      }, 10000); // 10 second timeout
      
      try {
        // Get user from localStorage
        const userData = localStorage.getItem('theology-user');
        if (userData) {
          setUser(JSON.parse(userData));
        }

        // Fetch book details first
        console.log('Making request to:', `${API_BASE_URL}/api/books/${bookId}`);
        const bookResponse = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors'
        });
        
        clearTimeout(timeout); // Clear timeout on success
        console.log('Book response status:', bookResponse.status);
        
        if (!bookResponse.ok) {
          const errorText = await bookResponse.text();
          console.error('Book fetch error:', errorText);
          throw new Error(`Book not found: ${errorText}`);
        }
        
        const bookData = await bookResponse.json();
        console.log('Book data received:', bookData);
        setBook(bookData);

        // Then check access if user is logged in (non-blocking)
        if (userData) {
          const userId = JSON.parse(userData).id;
          try {
            const accessResponse = await fetch(`${API_BASE_URL}/api/books/my-books/${userId}`);
            if (accessResponse.ok) {
              const userBooks = await accessResponse.json();
              const hasBookAccess = userBooks.some((userBook: any) => userBook.id === parseInt(bookId));
              setHasAccess(hasBookAccess);
            }
          } catch (accessError) {
            console.warn('Failed to check user access:', accessError);
            // Continue without access check - don't block the page
          }
        }
      } catch (error) {
        clearTimeout(timeout); // Clear timeout on error
        console.error('Failed to fetch book:', error);
        setLoading(false); // Stop loading but don't navigate
        // Show error but don't redirect - let user see what happened
        alert(`Failed to load book: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bookId, navigate]);

  const handleMockPurchase = async (type: 'buy' | 'rent', duration?: number) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${bookId}/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          access_type: type === 'buy' ? 'purchased' : 'rented',
          rental_duration_hours: duration
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${type === 'buy' ? 'Purchase' : 'Rental'} successful!`);
        setHasAccess(true);
        // Refresh user data
        const userData = localStorage.getItem('theology-user');
        if (userData) {
          const userId = JSON.parse(userData).id;
          const accessResponse = await fetch(`${API_BASE_URL}/api/books/my-books/${userId}`);
          if (accessResponse.ok) {
            const userBooks = await accessResponse.json();
            const hasBookAccess = userBooks.some((userBook: any) => userBook.id === parseInt(bookId));
            setHasAccess(hasBookAccess);
          }
        }
      } else {
        const error = await response.json();
        alert(error.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  const handleReadBook = () => {
    if (hasAccess && book) {
      navigate(`/library/book/${bookId}/read`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading book details...</div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Book not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/library')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Library
        </Button>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Book Cover and Basic Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="aspect-[3/4] bg-muted rounded-lg mb-6 flex items-center justify-center overflow-hidden">
                  {book.cover_image ? (
                    <img 
                      src={getImageUrl(book.cover_image)}
                      alt={book.title}
                      className="w-full h-full object-cover rounded-lg"
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
                          parent.innerHTML = '<svg class="h-16 w-16 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                        }
                      }}
                    />
                  ) : (
                    <BookOpen className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">{book.title}</h1>
                    <p className="text-lg text-muted-foreground">by {book.author}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {book.category && (
                      <Badge variant="outline">{book.category}</Badge>
                    )}
                    <Badge variant={book.book_type === 'digital' ? 'default' : 'secondary'}>
                      {book.book_type}
                    </Badge>
                  </div>

                  {book.isbn && (
                    <div className="text-sm">
                      <span className="font-medium">ISBN:</span> {book.isbn}
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Added {new Date(book.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Book Details and Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {book.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {book.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Pricing and Purchase Options */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasAccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <Star className="h-5 w-5" />
                      <span className="font-medium">You have access to this book!</span>
                    </div>
                    <Button className="mt-3 w-full" onClick={handleReadBook}>
                      <FileText className="h-4 w-4 mr-2" />
                      Read Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Buy Option */}
                    {book.buy_price > 0 && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="font-medium">Permanent Access</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            ${book.buy_price}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Buy once, own forever. Access on any device.
                        </p>
                        <Button 
                          className="w-full"
                          onClick={() => handleMockPurchase('buy')}
                        >
                          Buy Now - ${book.buy_price}
                        </Button>
                      </div>
                    )}

                    {/* Rental Options */}
                    {(book.rent_24h_price > 0 || book.rent_7d_price > 0) && (
                      <div className="space-y-3">
                        <h4 className="font-medium">Rental Options</h4>
                        
                        {book.rent_24h_price > 0 && (
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">24 Hours</span>
                              </div>
                              <span className="text-xl font-bold text-blue-600">
                                ${book.rent_24h_price}
                              </span>
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleMockPurchase('rent', 24)}
                            >
                              Rent for 24h - ${book.rent_24h_price}
                            </Button>
                          </div>
                        )}

                        {book.rent_7d_price > 0 && (
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">7 Days</span>
                              </div>
                              <span className="text-xl font-bold text-blue-600">
                                ${book.rent_7d_price}
                              </span>
                            </div>
                            <Button 
                              variant="outline" 
                              className="w-full"
                              onClick={() => handleMockPurchase('rent', 168)}
                            >
                              Rent for 7 days - ${book.rent_7d_price}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Physical Book Info */}
                    {(book.book_type === 'physical' || book.book_type === 'both') && (
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-5 w-5 text-orange-600" />
                          <span className="font-medium">Physical Book</span>
                        </div>
                        {book.stock_quantity !== undefined && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {book.stock_quantity > 0 ? (
                              <span className="text-green-600">In Stock ({book.stock_quantity} available)</span>
                            ) : (
                              <span className="text-red-600">Out of Stock</span>
                            )}
                          </p>
                        )}
                        {book.shipping_price && book.shipping_price > 0 && (
                          <p className="text-sm text-muted-foreground">
                            Shipping: ${book.shipping_price}
                          </p>
                        )}
                        <Button 
                          variant="outline" 
                          className="w-full mt-2"
                          disabled={book.stock_quantity === 0}
                        >
                          Order Physical Copy
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {!user && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-800 mb-3">
                      <User className="h-5 w-5" />
                      <span className="font-medium">Login required to purchase</span>
                    </div>
                    <Button className="w-full" onClick={() => navigate('/login')}>
                      Login to Purchase
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Book Information */}
            <Card>
              <CardHeader>
                <CardTitle>Book Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 text-sm">
                  {book.category && (
                    <div className="flex justify-between">
                      <span className="font-medium">Category:</span>
                      <span>{book.category}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{book.book_type}</span>
                  </div>
                  {book.isbn && (
                    <div className="flex justify-between">
                      <span className="font-medium">ISBN:</span>
                      <span>{book.isbn}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Added:</span>
                    <span>{new Date(book.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
