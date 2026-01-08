import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, Edit, Trash2, PlusCircle, Video, FileText, BookOpen, Save, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

interface Course {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  level: string;
  price: number;
  status: string;
  modules: any[];
}

interface Module {
  id: number;
  title: string;
  description: string;
  order: number;
  videos: Video[];
  assignments: Assignment[];
}

interface Video {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
}

interface Assignment {
  id: number;
  title: string;
  description: string;
  passingPercent: number;
  order: number;
}

const CourseManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    level: 'BEGINNER',
    durationMinutes: 60,
    price: 0
  });

  useEffect(() => {
    // Try to get course data from sessionStorage first (from dashboard)
    const storedCourse = sessionStorage.getItem('selectedCourse');
    if (storedCourse) {
      const parsedCourse = JSON.parse(storedCourse);
      setCourse(parsedCourse);
      setEditFormData({
        title: parsedCourse.title,
        description: parsedCourse.description,
        level: parsedCourse.level,
        durationMinutes: parsedCourse.durationMinutes,
        price: parsedCourse.price
      });
      sessionStorage.removeItem('selectedCourse'); // Clean up
    } else {
      // Fallback: fetch from API if not in sessionStorage
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
        setEditFormData({
          title: courseData.title,
          description: courseData.description,
          level: courseData.level,
          durationMinutes: courseData.durationMinutes,
          price: courseData.price
        });
      }
    } catch (error) {
      console.error('Failed to fetch course:', error);
    }
  };

  const handleSaveCourse = async () => {
    if (!course) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${course.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        const updatedCourse = await response.json();
        setCourse(updatedCourse);
        setEditMode(false);
        alert('Course updated successfully!');
      }
    } catch (error) {
      console.error('Failed to update course:', error);
      alert('Failed to update course. Please try again.');
    }
  };

  const handleDeleteCourse = async () => {
    if (!course) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${course.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        navigate('/instructor');
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/instructor')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Course Management</h1>
            <p className="text-muted-foreground">{course.title}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={() => {
                if (editMode) {
                  handleSaveCourse();
                } else {
                  setEditMode(true);
                }
              }}
            >
              {editMode ? (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Course
                </>
              )}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Course Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {editMode ? (
              <>
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Level</Label>
                    <Select value={editFormData.level} onValueChange={(value) => setEditFormData(prev => ({ ...prev, level: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BEGINNER">Beginner</SelectItem>
                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                        <SelectItem value="ADVANCED">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={editFormData.durationMinutes}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="price">Price (Br)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={editFormData.price}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-xl font-semibold">{course.title}</h3>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Level</Label>
                    <p className="font-medium">{course.level}</p>
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <p className="font-medium">{course.durationMinutes} minutes</p>
                  </div>
                  <div>
                    <Label>Price</Label>
                    <p className="font-medium">Br {course.price}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge variant={
                      course.status === 'APPROVED' ? 'default' :
                      course.status === 'REJECTED' ? 'destructive' : 'secondary'
                    }>
                      {course.status}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Modules Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Course Content ({course.modules?.length || 0} modules)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {course.modules && course.modules.length > 0 ? (
              <div className="space-y-6">
                {course.modules.map((module: Module) => (
                  <div key={module.id} className="border rounded-lg p-4 space-y-4">
                    {/* Module Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">Module {module.order}: {module.title}</h4>
                        <p className="text-muted-foreground">{module.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="mr-1 h-3 w-3" />
                          Edit Module
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    {/* Videos Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4 text-blue-600" />
                        <h5 className="font-medium">Videos ({module.videos?.length || 0})</h5>
                      </div>
                      {module.videos && module.videos.length > 0 ? (
                        <div className="space-y-2">
                          {module.videos.map((video: Video) => (
                            <div key={video.id} className="bg-blue-50 border border-blue-200 rounded p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{video.title}</p>
                                  <p className="text-xs text-muted-foreground">{video.description}</p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-blue-600">Duration: {video.duration} min</span>
                                    <span className="text-xs text-blue-600">Order: {video.order}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground ml-6">No videos in this module</p>
                      )}
                    </div>

                    {/* Assignments Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-600" />
                        <h5 className="font-medium">Assignments ({module.assignments?.length || 0})</h5>
                      </div>
                      {module.assignments && module.assignments.length > 0 ? (
                        <div className="space-y-2">
                          {module.assignments.map((assignment: Assignment) => (
                            <div key={assignment.id} className="bg-green-50 border border-green-200 rounded p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{assignment.title}</p>
                                  <p className="text-xs text-muted-foreground">{assignment.description}</p>
                                  <div className="flex items-center gap-4 mt-1">
                                    <span className="text-xs text-green-600">Passing: {assignment.passingPercent}%</span>
                                    <span className="text-xs text-green-600">Order: {assignment.order}</span>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline">
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground ml-6">No assignments in this module</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No modules created yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start by creating your first module with videos and assignments</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">Are you sure you want to delete this course?</p>
                <p className="text-red-600 text-sm mt-2">This action cannot be undone and will permanently remove:</p>
                <ul className="text-red-600 text-sm mt-2 list-disc list-inside">
                  <li>Course content and materials</li>
                  <li>All modules and videos</li>
                  <li>Student enrollments and progress</li>
                  <li>Assignment submissions</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold">Course to be deleted:</p>
                <p className="text-red-600">{course.title}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCourse}>
                Delete Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CourseManagement;
