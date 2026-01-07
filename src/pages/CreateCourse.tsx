import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, X, Upload, Video, FileText, HelpCircle, ClipboardList } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

interface Module {
  id: string;
  title: string;
  videos: { id: string; url: string; title: string; type: 'youtube' | 'upload'; subtitleUrl?: string }[];
  materials: { id: string; title: string; url: string; fileType: string }[];
  questions: {
    id: string;
    questionText: string;
    options: string[];
    correctIndex: number;
  }[];
  assignment?: {
    title: string;
    description: string;
    instructions: string;
    passingPercent: number;
  } | null;
}

const CreateCourse = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('theology-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
  
  // Course basic info
  const [courseInfo, setCourseInfo] = useState({
    title: '',
    description: '',
    durationMinutes: '',
    level: '',
    price: ''
  });

  // Modules state
  const [modules, setModules] = useState<Module[]>([]);

  // Form states for adding items
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [newVideo, setNewVideo] = useState({ url: '', title: '', type: 'youtube' });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [newMaterial, setNewMaterial] = useState({ title: '', url: '', fileType: '' });
  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctIndex: 0
  });
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    instructions: '',
    passingPercent: 70,
  });

  const addModule = () => {
    if (!newModuleTitle.trim()) return;
    
    const newModule: Module = {
      id: Date.now().toString(),
      title: newModuleTitle,
      videos: [],
      materials: [],
      questions: [],
      assignment: null,
    };
    
    setModules([...modules, newModule]);
    setNewModuleTitle('');
  };

  const saveAssignment = () => {
    if (!selectedModuleId || !newAssignment.title.trim()) return;

    setModules(modules.map(module =>
      module.id === selectedModuleId
        ? {
            ...module,
            assignment: {
              title: newAssignment.title,
              description: newAssignment.description,
              instructions: newAssignment.instructions,
              passingPercent: newAssignment.passingPercent || 70,
            },
          }
        : module
    ));
  };

  const removeModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const addVideo = async () => {
    if (!selectedModuleId || !newVideo.title.trim()) {
      return;
    }
    
    let videoUrl = newVideo.url;
    let subtitleUrl = '';
    
    // Handle file upload
    if (newVideo.type === 'upload' && videoFile) {
      setUploadingVideo(true);
      
      try {
        // Upload video file
        const videoFormData = new FormData();
        videoFormData.append('video', videoFile);
        
        const videoResponse = await fetch(`${API_BASE_URL}/api/upload/video`, {
          method: 'POST',
          body: videoFormData
        });
        
        if (!videoResponse.ok) {
          const errorText = await videoResponse.text();
          throw new Error(`Video upload failed: ${videoResponse.status} ${errorText}`);
        }
        
        const videoResult = await videoResponse.json();
        videoUrl = videoResult.url;
        
        // Upload subtitle file if provided
        if (subtitleFile) {
          const subtitleFormData = new FormData();
          subtitleFormData.append('subtitle', subtitleFile);
          
          const subtitleResponse = await fetch(`${API_BASE_URL}/api/upload/subtitle`, {
            method: 'POST',
            body: subtitleFormData
          });
          
          if (subtitleResponse.ok) {
            const subtitleResult = await subtitleResponse.json();
            subtitleUrl = subtitleResult.url;
          } else {
            console.warn('Subtitle upload failed, but video was uploaded successfully');
          }
        }
        
      } catch (error) {
        console.error('Video upload error:', error);
        alert('Failed to upload video. Please try again.');
        setUploadingVideo(false);
        return;
      }
      setUploadingVideo(false);
    }
    
    // Validate URL for YouTube type
    if (newVideo.type === 'youtube' && !videoUrl.trim()) {
      alert('Please enter a YouTube URL');
      return;
    }
    
    setModules(modules.map(module => 
      module.id === selectedModuleId 
        ? {
            ...module,
            videos: [...module.videos, { 
              id: Date.now().toString(), 
              url: videoUrl, 
              title: newVideo.title,
              type: newVideo.type,
              subtitleUrl: subtitleUrl || undefined
            }]
          }
        : module
    ));
    
    setNewVideo({ url: '', title: '', type: 'youtube' });
    setVideoFile(null);
    setSubtitleFile(null);
  };

  const addMaterial = () => {
    if (!selectedModuleId || !newMaterial.title.trim() || !newMaterial.url.trim()) return;
    
    setModules(modules.map(module => 
      module.id === selectedModuleId 
        ? {
            ...module,
            materials: [...module.materials, { 
              id: Date.now().toString(), 
              title: newMaterial.title, 
              url: newMaterial.url, 
              fileType: newMaterial.fileType || 'pdf' 
            }]
          }
        : module
    ));
    
    setNewMaterial({ title: '', url: '', fileType: '' });
  };

  const addQuestion = () => {
    if (!selectedModuleId || !newQuestion.questionText.trim()) return;
    
    setModules(modules.map(module => 
      module.id === selectedModuleId 
        ? {
            ...module,
            questions: [...module.questions, { 
              id: Date.now().toString(), 
              questionText: newQuestion.questionText,
              options: [...newQuestion.options],
              correctIndex: newQuestion.correctIndex
            }]
          }
        : module
    ));
    
    setNewQuestion({
      questionText: '',
      options: ['', '', '', ''],
      correctIndex: 0
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/file`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setNewMaterial(prev => ({
          ...prev,
          url: result.url,
          title: prev.title || result.originalName,
          fileType: prev.fileType || 'pdf'
        }));
        alert('File uploaded successfully!');
      } else {
        const error = await response.json();
        alert('Upload failed: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!courseInfo.title || !courseInfo.description || modules.length === 0) {
      alert('Please fill in all required fields and add at least one module');
      return;
    }

    if (!user) {
      alert('User not found. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const courseData = {
        title: courseInfo.title,
        description: courseInfo.description,
        durationMinutes: parseInt(courseInfo.durationMinutes) || 60,
        level: courseInfo.level,
        price: parseFloat(courseInfo.price) || 0,
        status: 'PENDING',
        instructorId: user.id,
        modules: modules.map((module, index) => ({
          title: module.title,
          orderIndex: index,
          videoUrls: module.videos.map(v => v.url),
          materials: module.materials,
          questions: module.questions.map(q => ({
            ...q,
            points: q.points || 10 // Add default points for questions
          })),
          assignment: module.assignment ? {
            ...module.assignment,
            points: module.assignment.points || 10 // Add default points for assignment
          } : undefined,
        }))
      };

      const response = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      });

      if (response.ok) {
        alert('Course submitted for approval! It will appear in the courses page once approved by admin.');
        navigate('/instructor');
      } else {
        const error = await response.json();
        alert('Failed to create course: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedModule = modules.find(m => m.id === selectedModuleId);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary">Create New Course</h1>
          <p className="text-muted-foreground">Build your course with modules, videos, assignments, and quizzes</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="ml-2">Basic Info</span>
            </div>
            <div className="w-8 h-px bg-muted"></div>
            <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                2
              </div>
              <span className="ml-2">Modules & Content</span>
            </div>
            <div className="w-8 h-px bg-muted"></div>
            <div className={`flex items-center ${currentStep >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="ml-2">Review</span>
            </div>
          </div>
        </div>

        {/* Step 1: Basic Course Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter course title"
                    value={courseInfo.title}
                    onChange={(e) => setCourseInfo(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Level *</Label>
                  <Select value={courseInfo.level} onValueChange={(value) => setCourseInfo(prev => ({ ...prev, level: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                      <SelectItem value="DIPLOMA">Diploma</SelectItem>
                      <SelectItem value="DEGREE">Degree</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your course..."
                  value={courseInfo.description}
                  onChange={(e) => setCourseInfo(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="60"
                    value={courseInfo.durationMinutes}
                    onChange={(e) => setCourseInfo(prev => ({ ...prev, durationMinutes: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={courseInfo.price}
                    onChange={(e) => setCourseInfo(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={() => setCurrentStep(2)} disabled={!courseInfo.title || !courseInfo.description || !courseInfo.level}>
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Modules and Content */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Add Module */}
            <Card>
              <CardHeader>
                <CardTitle>Add Module</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Module title"
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                  />
                  <Button onClick={addModule} disabled={!newModuleTitle.trim()}>
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Modules List */}
            {modules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Modules ({modules.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modules.map((module, index) => (
                      <div key={module.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-semibold">Module {index + 1}: {module.title}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeModule(module.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <Badge variant="secondary">
                            <Video className="h-3 w-3 mr-1" />
                            {module.videos.length} Videos ({module.videos.filter(v => v.type === 'youtube').length} YouTube, {module.videos.filter(v => v.type === 'upload').length} Uploaded)
                          </Badge>
                          <Badge variant="secondary">
                            <FileText className="h-3 w-3 mr-1" />
                            {module.materials.length} Materials
                          </Badge>
                          <Badge variant="secondary">
                            <HelpCircle className="h-3 w-3 mr-1" />
                            {module.questions.length} Questions
                          </Badge>
                          <Badge variant={module.assignment ? 'default' : 'secondary'}>
                            <ClipboardList className="h-3 w-3 mr-1" />
                            {module.assignment ? 'Assignment set' : 'No assignment'}
                          </Badge>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedModuleId(module.id)}
                          className={selectedModuleId === module.id ? 'bg-primary text-primary-foreground' : ''}
                        >
                          {selectedModuleId === module.id ? 'Selected' : 'Select for Editing'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content Management */}
            {selectedModule && (
              <Card>
                <CardHeader>
                  <CardTitle>Manage Content: {selectedModule.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Add Video */}
                  <div>
                    <h4 className="font-medium mb-2">Add Video</h4>
                    
                    {/* Video Type Selection */}
                    <div className="space-y-2 mb-3">
                      <Label>Video Source</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={newVideo.type === 'youtube' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewVideo(prev => ({ ...prev, type: 'youtube' }))}
                        >
                          <Video className="h-4 w-4 mr-2" />
                          YouTube URL
                        </Button>
                        <Button
                          type="button"
                          variant={newVideo.type === 'upload' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewVideo(prev => ({ ...prev, type: 'upload' }))}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Video
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Input
                        placeholder="Video title"
                        value={newVideo.title}
                        onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                      />
                      
                      {newVideo.type === 'youtube' ? (
                        <Input
                          placeholder="YouTube URL (e.g., https://www.youtube.com/watch?v=...)"
                          value={newVideo.url}
                          onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                        />
                      ) : (
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="video/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setVideoFile(file);
                                setNewVideo(prev => ({ ...prev, url: file.name }));
                              } else {
                                setVideoFile(null);
                              }
                            }}
                          />
                          {videoFile && (
                            <div className="text-sm text-muted-foreground">
                              Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                            </div>
                          )}
                          
                          {/* Subtitle Upload */}
                          <div className="border-t pt-2">
                            <Label className="text-sm text-muted-foreground">Subtitle File (Optional)</Label>
                            <Input
                              type="file"
                              accept=".vtt"
                              placeholder="Upload subtitle file (.vtt)"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSubtitleFile(file);
                                } else {
                                  setSubtitleFile(null);
                                }
                              }}
                              className="mt-1"
                            />
                            {subtitleFile && (
                              <div className="text-sm text-muted-foreground">
                                Subtitle: {subtitleFile.name}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        onClick={addVideo} 
                        disabled={!newVideo.title.trim() || (newVideo.type === 'youtube' ? !newVideo.url.trim() : !videoFile) || uploadingVideo}
                        className="w-full"
                      >
                        {uploadingVideo ? (
                          <>
                            <Upload className="h-4 w-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Video
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Add Material */}
                  <div>
                    <h4 className="font-medium mb-2">Add Material</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                        <Input
                          placeholder="Material title"
                          value={newMaterial.title}
                          onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                        />
                        <Input
                          placeholder="File URL (or upload file below)"
                          value={newMaterial.url}
                          onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                        />
                        <Select value={newMaterial.fileType} onValueChange={(value) => setNewMaterial(prev => ({ ...prev, fileType: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="doc">Document</SelectItem>
                            <SelectItem value="link">Link</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button onClick={addMaterial} disabled={!newMaterial.title.trim() || !newMaterial.url.trim()}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* File Upload */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="mt-2">
                            <label htmlFor="file-upload" className="cursor-pointer">
                              <span className="mt-2 block text-sm font-medium text-gray-900">
                                Or upload a file
                              </span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                                onChange={handleFileUpload}
                              />
                            </label>
                            <p className="mt-1 text-xs text-gray-500">
                              PDF, Word, PowerPoint, text files and images up to 10MB
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Quiz Question */}
                  <div>
                    <h4 className="font-medium mb-2">Add Quiz Question</h4>
                    <div className="space-y-2">
                      <Input
                        placeholder="Question text"
                        value={newQuestion.questionText}
                        onChange={(e) => setNewQuestion(prev => ({ ...prev, questionText: e.target.value }))}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {newQuestion.options.map((option, index) => (
                          <Input
                            key={index}
                            placeholder={`Option ${index + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...newQuestion.options];
                              newOptions[index] = e.target.value;
                              setNewQuestion(prev => ({ ...prev, options: newOptions }));
                            }}
                          />
                        ))}
                      </div>
                      <Select value={newQuestion.correctIndex.toString()} onValueChange={(value) => setNewQuestion(prev => ({ ...prev, correctIndex: parseInt(value) }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select correct answer" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Option 1</SelectItem>
                          <SelectItem value="1">Option 2</SelectItem>
                          <SelectItem value="2">Option 3</SelectItem>
                          <SelectItem value="3">Option 4</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={addQuestion} disabled={!newQuestion.questionText.trim()}>
                        <PlusCircle className="h-4 w-4" /> Add Question
                      </Button>
                    </div>
                  </div>

                  {/* Assignment */}
                  <div>
                    <h4 className="font-medium mb-2">Module Assignment (optional)</h4>
                    <div className="space-y-2">
                      <Input
                        placeholder="Assignment title"
                        value={newAssignment.title}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                      />
                      <Textarea
                        placeholder="Short description (what is this assignment about?)"
                        value={newAssignment.description}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                        rows={2}
                      />
                      <Textarea
                        placeholder="Instructions for students (what they should submit, length, etc.)"
                        value={newAssignment.instructions}
                        onChange={(e) => setNewAssignment(prev => ({ ...prev, instructions: e.target.value }))}
                        rows={3}
                      />
                      <div className="flex items-center gap-2">
                        <Label htmlFor="passingPercent" className="whitespace-nowrap">
                          Passing score (%)
                        </Label>
                        <Input
                          id="passingPercent"
                          type="number"
                          className="w-24"
                          value={newAssignment.passingPercent}
                          onChange={(e) =>
                            setNewAssignment(prev => ({
                              ...prev,
                              passingPercent: parseInt(e.target.value || '70', 10),
                            }))
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={saveAssignment}
                          disabled={!newAssignment.title.trim()}
                        >
                          Save assignment for this module
                        </Button>
                        {selectedModule.assignment && (
                          <span className="text-xs text-muted-foreground">
                            Current: {selectedModule.assignment.title} ({selectedModule.assignment.passingPercent}% to pass)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Previous
              </Button>
              <Button onClick={() => setCurrentStep(3)} disabled={modules.length === 0}>
                Next Step
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{courseInfo.title}</h3>
                    <p className="text-muted-foreground">{courseInfo.description}</p>
                    <div className="flex gap-4 mt-2">
                      <Badge>{courseInfo.level}</Badge>
                      <Badge variant="secondary">{courseInfo.durationMinutes} min</Badge>
                      <Badge variant="secondary">${courseInfo.price}</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Modules ({modules.length})</h4>
                    <div className="space-y-2">
                      {modules.map((module, index) => (
                        <div key={module.id} className="border rounded p-3">
                          <h5 className="font-medium">Module {index + 1}: {module.title}</h5>
                          <div className="text-sm text-muted-foreground mt-1">
                            {module.videos.length} videos, {module.materials.length} materials, {module.questions.length} questions
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Previous
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit for Approval'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateCourse;


