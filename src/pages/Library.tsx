import { useEffect, useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, BookOpen, Package, DollarSign, Clock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://dothanministries.org';

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

const Library = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get user from localStorage
        const userData = localStorage.getItem('theology-user');
        if (userData) {
          setUser(JSON.parse(userData));
        }

        // Fetch books
        const response = await fetch(`${API_BASE_URL}/api/books`);
        const booksData = await response.json();
        setBooks(booksData);
        setFilteredBooks(booksData);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = books;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(book => book.category === selectedCategory);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(book => book.book_type === selectedType);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.buy_price || 0) - (b.buy_price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.buy_price || 0) - (a.buy_price || 0));
        break;
    }

    setFilteredBooks(filtered);
  }, [books, searchTerm, selectedCategory, selectedType, sortBy]);

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(books.map(book => book.category).filter(Boolean)))];

  const handleBookClick = (bookId: number) => {
    navigate(`/library/book/${bookId}`);
  };

  const handleMockPurchase = async (bookId: number, type: 'buy' | 'rent', duration?: number) => {
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
        // Navigate to library or book detail
        navigate('/my-library');
      } else {
        const error = await response.json();
        alert(error.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading library...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Breadcrumb />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Digital Library</h1>
          <p className="text-muted-foreground">
            Browse our collection of theological books and resources
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-card rounded-lg p-6 mb-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search books, authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
                <SelectItem value="physical">Physical</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">Title (A-Z)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground self-center">
              {filteredBooks.length} books found
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader onClick={() => handleBookClick(book.id)}>
                  <div className="aspect-[3/4] bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
                    {book.cover_image ? (
                      <img 
                        src={book.cover_image.startsWith('http') ? book.cover_image : `${API_BASE_URL}${book.cover_image}`}
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
                          // Fallback to default icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallbackIcon = document.createElement('div');
                            fallbackIcon.innerHTML = '<svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>';
                            parent.appendChild(fallbackIcon);
                          }
                        }}
                      />
                    ) : (
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                      {book.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">by {book.author}</p>
                  </div>
                </CardHeader>
                <CardContent onClick={() => handleBookClick(book.id)}>
                  <div className="space-y-3">
                    {book.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {book.description}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-1">
                      {book.category && (
                        <Badge variant="outline" className="text-xs">
                          {book.category}
                        </Badge>
                      )}
                      <Badge variant={book.book_type === 'digital' ? 'default' : 'secondary'} className="text-xs">
                        {book.book_type}
                      </Badge>
                      {book.stock_quantity !== undefined && book.stock_quantity > 0 && (
                        <Badge variant="outline" className="text-xs">
                          Stock: {book.stock_quantity}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      {book.buy_price > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            Buy: ${book.buy_price}
                          </span>
                        </div>
                      )}
                      
                      {(book.rent_24h_price > 0 || book.rent_7d_price > 0) && (
                        <div className="space-y-1">
                          {book.rent_24h_price > 0 && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-600">
                                Rent 24h: ${book.rent_24h_price}
                              </span>
                            </div>
                          )}
                          {book.rent_7d_price > 0 && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-600" />
                              <span className="text-sm text-blue-600">
                                Rent 7d: ${book.rent_7d_price}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleBookClick(book.id)}
                      >
                        View Details
                      </Button>
                      
                      {book.buy_price > 0 && (
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={() => handleMockPurchase(book.id, 'buy')}
                        >
                          Buy
                        </Button>
                      )}
                      
                      {book.rent_24h_price > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleMockPurchase(book.id, 'rent', 24)}
                        >
                          Rent
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
