import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2, BookOpen, Upload, FileText, Package, X } from 'lucide-react';

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
  buy_price?: number;
  rent_24h_price?: number;
  rent_7d_price?: number;
  stock_quantity?: number;
  shipping_price?: number;
  file_url?: string;
  status: string;
  created_at: string;
}

const LibraryManagement = () => {
  const { t } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  
  // Form states
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    book_type: 'digital' as 'digital' | 'physical' | 'both',
    isbn: '',
    buy_price: '',
    rent_24h_price: '',
    rent_7d_price: '',
    stock_quantity: '',
    shipping_price: ''
  });
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingBook, setUploadingBook] = useState(false);

  useEffect(() => {
    fetchBooks();
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

    setFilteredBooks(filtered);
  }, [books, searchTerm, selectedCategory, selectedType]);

  const fetchBooks = async () => {
    try {
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

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookFile) {
      alert('Please select a PDF file');
      return;
    }

    setUploadingBook(true);
    
    try {
      // Upload PDF file
      const pdfFormData = new FormData();
      pdfFormData.append('file', bookFile);
      
      const pdfResponse = await fetch(`${API_BASE_URL}/api/upload/file`, {
        method: 'POST',
        body: pdfFormData
      });
      
      if (!pdfResponse.ok) {
        throw new Error('Failed to upload PDF');
      }
      
      const pdfResult = await pdfResponse.json();
      const fileUrl = pdfResult.url;
      
      // Upload cover image if provided
      let coverImageUrl = '';
      if (coverFile) {
        const coverFormData = new FormData();
        coverFormData.append('file', coverFile);
        
        const coverResponse = await fetch(`${API_BASE_URL}/api/upload/file`, {
          method: 'POST',
          body: coverFormData
        });
        
        if (coverResponse.ok) {
          const coverResult = await coverResponse.json();
          coverImageUrl = coverResult.url;
        }
      }
      
      // Create book record
      const bookData = {
        ...bookForm,
        file_url: fileUrl,
        cover_image: coverImageUrl,
        uploaded_by: 1, // Admin user ID
        buy_price: bookForm.buy_price || null,
        rent_24h_price: bookForm.rent_24h_price || null,
        rent_7d_price: bookForm.rent_7d_price || null,
        stock_quantity: bookForm.stock_quantity || null,
        shipping_price: bookForm.shipping_price || null
      };
      
      const bookResponse = await fetch(`${API_BASE_URL}/api/books`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
      
      if (bookResponse.ok) {
        const newBook = await bookResponse.json();
        setBooks(prev => [newBook, ...prev]);
        setShowAddDialog(false);
        resetForm();
        alert('Book uploaded successfully!');
      } else {
        throw new Error('Failed to create book record');
      }
    } catch (error) {
      console.error('Failed to add book:', error);
      alert('Failed to upload book. Please try again.');
    } finally {
      setUploadingBook(false);
    }
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingBook) return;

    setUploadingBook(true);
    
    try {
      let fileUrl = editingBook.file_url;
      let coverImageUrl = editingBook.cover_image;
      
      // Upload new PDF file if provided
      if (bookFile) {
        const pdfFormData = new FormData();
        pdfFormData.append('file', bookFile);
        
        const pdfResponse = await fetch(`${API_BASE_URL}/api/upload/file`, {
          method: 'POST',
          body: pdfFormData
        });
        
        if (pdfResponse.ok) {
          const pdfResult = await pdfResponse.json();
          fileUrl = pdfResult.url;
        }
      }
      
      // Upload new cover image if provided
      if (coverFile) {
        const coverFormData = new FormData();
        coverFormData.append('file', coverFile);
        
        const coverResponse = await fetch(`${API_BASE_URL}/api/upload/file`, {
          method: 'POST',
          body: coverFormData
        });
        
        if (coverResponse.ok) {
          const coverResult = await coverResponse.json();
          coverImageUrl = coverResult.url;
        }
      }
      
      // Update book record
      const bookData = {
        ...bookForm,
        file_url: fileUrl,
        cover_image: coverImageUrl,
        buy_price: bookForm.buy_price || null,
        rent_24h_price: bookForm.rent_24h_price || null,
        rent_7d_price: bookForm.rent_7d_price || null,
        stock_quantity: bookForm.stock_quantity || null,
        shipping_price: bookForm.shipping_price || null
      };
      
      const bookResponse = await fetch(`${API_BASE_URL}/api/books/${editingBook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
      
      if (bookResponse.ok) {
        const updatedBook = await bookResponse.json();
        setBooks(prev => prev.map(book => book.id === editingBook.id ? updatedBook : book));
        setShowEditDialog(false);
        resetForm();
        setEditingBook(null);
        alert('Book updated successfully!');
      } else {
        throw new Error('Failed to update book');
      }
    } catch (error) {
      console.error('Failed to update book:', error);
      alert('Failed to update book. Please try again.');
    } finally {
      setUploadingBook(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${bookId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setBooks(prev => prev.filter(book => book.id !== bookId));
        alert('Book deleted successfully!');
      } else {
        throw new Error('Failed to delete book');
      }
    } catch (error) {
      console.error('Failed to delete book:', error);
      alert('Failed to delete book. Please try again.');
    }
  };

  const openEditDialog = (book: Book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      description: book.description || '',
      category: book.category || '',
      book_type: book.book_type,
      isbn: book.isbn || '',
      buy_price: book.buy_price?.toString() || '',
      rent_24h_price: book.rent_24h_price?.toString() || '',
      rent_7d_price: book.rent_7d_price?.toString() || '',
      stock_quantity: book.stock_quantity?.toString() || '',
      shipping_price: book.shipping_price?.toString() || ''
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setBookForm({
      title: '',
      author: '',
      description: '',
      category: '',
      book_type: 'digital',
      isbn: '',
      buy_price: '',
      rent_24h_price: '',
      rent_7d_price: '',
      stock_quantity: '',
      shipping_price: ''
    });
    setBookFile(null);
    setCoverFile(null);
  };

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(books.map(book => book.category).filter(Boolean)))];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading library management...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Library Management</h1>
          <p className="text-muted-foreground">
            Manage books in the digital library - add, edit, and delete books
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

            <div className="text-sm text-muted-foreground self-center">
              {filteredBooks.length} books found
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddBook} className="space-y-4">
                  <BookForm 
                    bookForm={bookForm}
                    setBookForm={setBookForm}
                    bookFile={bookFile}
                    setBookFile={setBookFile}
                    coverFile={coverFile}
                    setCoverFile={setCoverFile}
                    uploadingBook={uploadingBook}
                    isEdit={false}
                  />
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No books found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters, or add a new book to the library.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-[3/4] bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
                    {book.cover_image ? (
                      <img 
                        src={book.cover_image.startsWith('http') ? book.cover_image : `${API_BASE_URL}${book.cover_image}`}
                        alt={book.title}
                        className="w-full h-full object-cover rounded-md"
                        loading="lazy"
                      />
                    ) : (
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">by {book.author}</p>
                  </div>
                </CardHeader>
                <CardContent>
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

                    <div className="flex justify-between items-center text-sm">
                      <div>
                        {book.buy_price && (
                          <span className="font-semibold">Buy: Br {book.buy_price}</span>
                        )}
                        {(book.rent_24h_price || book.rent_7d_price) && (
                          <div className="text-xs text-muted-foreground">
                            {book.rent_24h_price && <span>Rent 24h: Br {book.rent_24h_price}</span>}
                            {book.rent_7d_price && <span> • 7d: Br {book.rent_7d_price}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => window.open(book.file_url, '_blank')}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => openEditDialog(book)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{book.title}" by {book.author}. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteBook(book.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Book</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditBook} className="space-y-4">
              <BookForm 
                bookForm={bookForm}
                setBookForm={setBookForm}
                bookFile={bookFile}
                setBookFile={setBookFile}
                coverFile={coverFile}
                setCoverFile={setCoverFile}
                uploadingBook={uploadingBook}
                isEdit={true}
              />
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Book Form Component
const BookForm = ({ 
  bookForm, 
  setBookForm, 
  bookFile, 
  setBookFile, 
  coverFile, 
  setCoverFile, 
  uploadingBook, 
  isEdit 
}: {
  bookForm: any;
  setBookForm: any;
  bookFile: File | null;
  setBookFile: any;
  coverFile: File | null;
  setCoverFile: any;
  uploadingBook: boolean;
  isEdit: boolean;
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="book-title">Title *</Label>
          <Input
            id="book-title"
            placeholder="Book Title"
            value={bookForm.title}
            onChange={(e) => setBookForm(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="book-author">Author *</Label>
          <Input
            id="book-author"
            placeholder="Author Name"
            value={bookForm.author}
            onChange={(e) => setBookForm(prev => ({ ...prev, author: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="book-description">Description</Label>
        <Textarea
          id="book-description"
          placeholder="Book description..."
          value={bookForm.description}
          onChange={(e) => setBookForm(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="book-category">Category</Label>
          <Input
            id="book-category"
            placeholder="e.g., Theology"
            value={bookForm.category}
            onChange={(e) => setBookForm(prev => ({ ...prev, category: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="book-isbn">ISBN</Label>
          <Input
            id="book-isbn"
            placeholder="ISBN number"
            value={bookForm.isbn}
            onChange={(e) => setBookForm(prev => ({ ...prev, isbn: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="book-type">Type</Label>
          <Select value={bookForm.book_type} onValueChange={(value) => setBookForm(prev => ({ ...prev, book_type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="digital">Digital</SelectItem>
              <SelectItem value="physical">Physical</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="buy-price">Buy Price (Br)</Label>
          <Input
            id="buy-price"
            type="number"
            placeholder="0.00"
            value={bookForm.buy_price}
            onChange={(e) => setBookForm(prev => ({ ...prev, buy_price: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rent-24h">Rent 24h (Br)</Label>
          <Input
            id="rent-24h"
            type="number"
            placeholder="0.00"
            value={bookForm.rent_24h_price}
            onChange={(e) => setBookForm(prev => ({ ...prev, rent_24h_price: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rent-7d">Rent 7 days (Br)</Label>
          <Input
            id="rent-7d"
            type="number"
            placeholder="0.00"
            value={bookForm.rent_7d_price}
            onChange={(e) => setBookForm(prev => ({ ...prev, rent_7d_price: e.target.value }))}
          />
        </div>
      </div>

      {(bookForm.book_type === 'physical' || bookForm.book_type === 'both') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock-quantity">Stock Quantity</Label>
            <Input
              id="stock-quantity"
              type="number"
              placeholder="0"
              value={bookForm.stock_quantity}
              onChange={(e) => setBookForm(prev => ({ ...prev, stock_quantity: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shipping-price">Shipping Price (Br)</Label>
            <Input
              id="shipping-price"
              type="number"
              placeholder="0.00"
              value={bookForm.shipping_price}
              onChange={(e) => setBookForm(prev => ({ ...prev, shipping_price: e.target.value }))}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="book-file">PDF File {!isEdit && '*'}</Label>
        <Input
          id="book-file"
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setBookFile(file);
            }
          }}
          required={!isEdit}
        />
        {bookFile && (
          <p className="text-sm text-muted-foreground">
            Selected: {bookFile.name} ({(bookFile.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cover-file">Cover Image (Optional)</Label>
        <Input
          id="cover-file"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setCoverFile(file);
            }
          }}
        />
        {coverFile && (
          <p className="text-sm text-muted-foreground">
            Cover: {coverFile.name}
          </p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1" disabled={uploadingBook}>
          {uploadingBook ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              {isEdit ? 'Updating...' : 'Uploading...'}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Book' : 'Upload Book'}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => {
          if (isEdit) {
            setShowEditDialog(false);
            setEditingBook(null);
            resetForm();
          } else {
            setShowAddDialog(false);
            resetForm();
          }
        }} className="flex-1">
          Cancel
        </Button>
      </div>
    </>
  );
};

export default LibraryManagement;
