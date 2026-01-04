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
import { Users, BookOpen, Settings, TrendingUp, UserPlus, CheckCircle, XCircle, Upload, FileText, Package } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<any>(null);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [showAddBook, setShowAddBook] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [teacherForm, setTeacherForm] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: ''
  });
  const [bookForm, setBookForm] = useState({
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
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploadingBook, setUploadingBook] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryResponse, pendingResponse, booksResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/admin/summary`),
          fetch(`${API_BASE_URL}/api/admin/courses/pending`),
          fetch(`${API_BASE_URL}/api/books`)
        ]);

        const summaryData = await summaryResponse.json();
        const pendingData = await pendingResponse.json();
        const booksData = await booksResponse.json();

        setSummary(summaryData);
        setPendingCourses(pendingData);
        setBooks(booksData);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleApproveCourse = async (courseId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}/approve`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        setPendingCourses(prev => prev.filter(course => course.id !== courseId));
        setSummary(prev => ({
          ...prev,
          courses: {
            ...prev.courses,
            pending: prev.courses.pending - 1,
            active: prev.courses.active + 1
          }
        }));
      }
    } catch (error) {
      console.error('Failed to approve course:', error);
    }
  };

  const handleRejectCourse = async (courseId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/courses/${courseId}/reject`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        setPendingCourses(prev => prev.filter(course => course.id !== courseId));
        setSummary(prev => ({
          ...prev,
          courses: {
            ...prev.courses,
            pending: prev.courses.pending - 1
          }
        }));
      }
    } catch (error) {
      console.error('Failed to reject course:', error);
    }
  };

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teacherForm)
      });
      
      if (response.ok) {
        setShowAddTeacher(false);
        setTeacherForm({ name: '', email: '', password: '', phoneNumber: '' });
        setSummary(prev => ({
          ...prev,
          users: {
            ...prev.users,
            teachers: prev.users.teachers + 1
          }
        }));
      }
    } catch (error) {
      console.error('Failed to add teacher:', error);
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
        uploaded_by: 1, // Admin user ID (you can get this from auth context)
        // Convert empty strings to null for numeric fields
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
        setShowAddBook(false);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary">{t('dashboard:adminDashboard')}</h1>
          <p className="text-muted-foreground">{t('dashboard:manageSystemAndUsers')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:totalUsers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.users.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard:studentsAndTeachers', { students: summary?.users.students || 0, teachers: summary?.users.teachers || 0 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:totalCourses')}</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.courses.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard:activeAndPending', { active: summary?.courses.active || 0, pending: summary?.courses.pending || 0 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:totalEnrollments')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.enrollments.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard:completed', { completed: summary?.enrollments.completed || 0 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:avgProgress')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.enrollments.average_progress || 0}%</div>
              <p className="text-xs text-muted-foreground">{t('dashboard:acrossAllEnrollments')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Dialog open={showAddTeacher} onOpenChange={setShowAddTeacher}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                {t('dashboard:addTeacher')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teacher-name">Name</Label>
                  <Input
                    id="teacher-name"
                    placeholder="Teacher Name"
                    value={teacherForm.name}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email</Label>
                  <Input
                    id="teacher-email"
                    type="email"
                    placeholder="teacher@example.com"
                    value={teacherForm.email}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password</Label>
                  <Input
                    id="teacher-password"
                    type="password"
                    placeholder="Password"
                    value={teacherForm.password}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-phone">Phone Number</Label>
                  <Input
                    id="teacher-phone"
                    placeholder="+1234567890"
                    value={teacherForm.phoneNumber}
                    onChange={(e) => setTeacherForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    Create Teacher
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddTeacher(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddBook} onOpenChange={setShowAddBook}>
                <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                {t('dashboard:uploadBook')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload New Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddBook} className="space-y-4">
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
                    <Label htmlFor="buy-price">Buy Price ($)</Label>
                    <Input
                      id="buy-price"
                      type="number"
                      placeholder="0.00"
                      value={bookForm.buy_price}
                      onChange={(e) => setBookForm(prev => ({ ...prev, buy_price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rent-24h">Rent 24h ($)</Label>
                    <Input
                      id="rent-24h"
                      type="number"
                      placeholder="0.00"
                      value={bookForm.rent_24h_price}
                      onChange={(e) => setBookForm(prev => ({ ...prev, rent_24h_price: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rent-7d">Rent 7 days ($)</Label>
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
                      <Label htmlFor="shipping-price">Shipping Price ($)</Label>
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
                  <Label htmlFor="book-file">PDF File *</Label>
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
                    required
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
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        {t('dashboard:uploadBook')}
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddBook(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pending Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">{t('dashboard:pendingCoursesWithCount', { count: pendingCourses.length })}</h2>
          
          {pendingCourses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">{t('dashboard:noPendingCourses')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingCourses.map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{course.title}</CardTitle>
                        <p className="text-muted-foreground">{course.description}</p>
                      </div>
                      <Badge variant="secondary">{t('dashboard:pending')}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        <span>{course.level} • {course.durationMinutes} min • ${course.price}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex items-center gap-1"
                          onClick={() => handleRejectCourse(course.id)}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex items-center gap-1"
                          onClick={() => handleApproveCourse(course.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Books Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-primary mb-4">Uploaded Books ({books.length})</h2>
          
          {books.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('dashboard:noBooksUploaded')}</p>
                <p className="text-sm text-muted-foreground">{t('dashboard:clickUploadBook')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {books.map((book) => (
                <Card key={book.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                      </div>
                      <Badge variant={book.book_type === 'digital' ? 'default' : 'secondary'}>
                        {book.book_type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {book.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">{book.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-1">
                        {book.category && <Badge variant="outline" className="text-xs">{book.category}</Badge>}
                        {book.isbn && <Badge variant="outline" className="text-xs">ISBN: {book.isbn}</Badge>}
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          {book.buy_price && (
                            <span className="font-semibold">Buy: ${book.buy_price}</span>
                          )}
                          {(book.rent_24h_price || book.rent_7d_price) && (
                            <div className="text-xs text-muted-foreground">
                              {book.rent_24h_price && <span>Rent 24h: ${book.rent_24h_price}</span>}
                              {book.rent_7d_price && <span> • 7d: ${book.rent_7d_price}</span>}
                            </div>
                          )}
                        </div>
                        {book.stock_quantity !== undefined && book.stock_quantity > 0 && (
                          <Badge variant="outline" className="text-xs">
                            Stock: {book.stock_quantity}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
