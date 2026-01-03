import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, Trash2, Video, FileText, HelpCircle, ClipboardList } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8081';

interface Module {
  title: string;
  orderIndex: number;
  videoUrls: string[];
  materials: { title: string; url: string; fileType: string }[];
  questions: { questionText: string; options: string[]; correctIndex: number; points: number }[];
  assignment?: {
    title: string;
    description: string;
    instructions: string;
    passingPercent: number;
    points: number;
  };
}

interface Course {
  id: number;
  title: string;
  description: string;
  durationMinutes: number;
  level: string;
  price: number;
  status: string;
  modules: Module[];
}

const EditCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Get current user from localStorage
    const userData = localStorage.getItem('theology-user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    durationMinutes: 0,
    level: 'BEGINNER',
    price: 0,
    status: 'PENDING',
    modules: [] as Module[]
  });

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        const resp = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
        if (!resp.ok) {
          throw new Error('Failed to load course');
        }
        const data = await resp.json();
        setCourse(data);
        setFormData({
          title: data.title,
          description: data.description,
          durationMinutes: data.durationMinutes,
          level: data.level,
          price: data.price,
          status: data.status,
          modules: data.modules || []
        });
      } catch (error) {
        console.error('Failed to fetch course', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, {
        title: '',
        orderIndex: prev.modules.length,
        videoUrls: [''],
        materials: [],
        questions: [],
        assignment: {
          title: '',
          description: '',
          instructions: '',
          passingPercent: 70,
          points: 10
        }
      }]
    }));
  };

  const updateModule = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.map((module, i) => 
        i === index ? { ...module, [field]: value } : module
      )
    }));
  };

  const removeModule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index)
    }));
  };

  const addVideoUrl = (moduleIndex: number) => {
    const modules = [...formData.modules];
    modules[moduleIndex].videoUrls.push('');
    setFormData(prev => ({ ...prev, modules }));
  };

  const updateVideoUrl = (moduleIndex: number, videoIndex: number, value: string) => {
    const modules = [...formData.modules];
    modules[moduleIndex].videoUrls[videoIndex] = value;
    setFormData(prev => ({ ...prev, modules }));
  };

  const removeVideoUrl = (moduleIndex: number, videoIndex: number) => {
    const modules = [...formData.modules];
    modules[moduleIndex].videoUrls.splice(videoIndex, 1);
    setFormData(prev => ({ ...prev, modules }));
  };

  const addQuestion = (moduleIndex: number) => {
    const modules = [...formData.modules];
    modules[moduleIndex].questions.push({
      questionText: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      points: 10
    });
    setFormData(prev => ({ ...prev, modules }));
  };

  const updateQuestion = (moduleIndex: number, questionIndex: number, field: string, value: any) => {
    const modules = [...formData.modules];
    modules[moduleIndex].questions[questionIndex] = {
      ...modules[moduleIndex].questions[questionIndex],
      [field]: value
    };
    setFormData(prev => ({ ...prev, modules }));
  };

  const removeQuestion = (moduleIndex: number, questionIndex: number) => {
    const modules = [...formData.modules];
    modules[moduleIndex].questions.splice(questionIndex, 1);
    setFormData(prev => ({ ...prev, modules }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !user) return;

    setSaving(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/courses/${courseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          instructorId: user.id
        })
      });

      if (!resp.ok) {
        throw new Error('Failed to update course');
      }

      navigate('/instructor');
    } catch (error) {
      console.error('Failed to update course', error);
      alert('Failed to update course. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>Course not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/instructor')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Edit Course</h1>
          <p className="text-muted-foreground">Update your course content and settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Course Info */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}>
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
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Course Modules</h2>
              <Button type="button" onClick={addModule}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>

            {formData.modules.map((module, moduleIndex) => (
              <Card key={moduleIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Module {moduleIndex + 1}</CardTitle>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeModule(moduleIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Module Title</Label>
                    <Input
                      value={module.title}
                      onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                      placeholder="Enter module title"
                      required
                    />
                  </div>

                  {/* Videos */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Videos
                      </Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addVideoUrl(moduleIndex)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {module.videoUrls.map((url, videoIndex) => (
                      <div key={videoIndex} className="flex gap-2 mb-2">
                        <Input
                          value={url}
                          onChange={(e) => updateVideoUrl(moduleIndex, videoIndex, e.target.value)}
                          placeholder="YouTube video URL"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeVideoUrl(moduleIndex, videoIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Quiz Questions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4" />
                        Quiz Questions
                      </Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => addQuestion(moduleIndex)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {module.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="border rounded-md p-4 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <Label>Question {questionIndex + 1}</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeQuestion(moduleIndex, questionIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <Input
                            value={question.questionText}
                            onChange={(e) => updateQuestion(moduleIndex, questionIndex, 'questionText', e.target.value)}
                            placeholder="Enter question text"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            {question.options.map((option, optionIndex) => (
                              <Input
                                key={optionIndex}
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options];
                                  newOptions[optionIndex] = e.target.value;
                                  updateQuestion(moduleIndex, questionIndex, 'options', newOptions);
                                }}
                                placeholder={`Option ${optionIndex + 1}`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <Label>Correct Answer</Label>
                              <Select
                                value={question.correctIndex.toString()}
                                onValueChange={(value) => updateQuestion(moduleIndex, questionIndex, 'correctIndex', Number(value))}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="0">Option 1</SelectItem>
                                  <SelectItem value="1">Option 2</SelectItem>
                                  <SelectItem value="2">Option 3</SelectItem>
                                  <SelectItem value="3">Option 4</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Points</Label>
                              <Input
                                type="number"
                                value={question.points}
                                onChange={(e) => updateQuestion(moduleIndex, questionIndex, 'points', Number(e.target.value))}
                                className="w-20"
                                min="1"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Assignment */}
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <ClipboardList className="h-4 w-4" />
                      Assignment
                    </Label>
                    <div className="border rounded-md p-4 space-y-2">
                      <Input
                        value={module.assignment?.title || ''}
                        onChange={(e) => updateModule(moduleIndex, 'assignment', {
                          ...module.assignment,
                          title: e.target.value,
                          description: module.assignment?.description || '',
                          instructions: module.assignment?.instructions || '',
                          passingPercent: module.assignment?.passingPercent || 70,
                          points: module.assignment?.points || 10
                        })}
                        placeholder="Assignment title"
                      />
                      <Textarea
                        value={module.assignment?.description || ''}
                        onChange={(e) => updateModule(moduleIndex, 'assignment', {
                          ...module.assignment!,
                          description: e.target.value
                        })}
                        placeholder="Assignment description"
                        rows={2}
                      />
                      <Textarea
                        value={module.assignment?.instructions || ''}
                        onChange={(e) => updateModule(moduleIndex, 'assignment', {
                          ...module.assignment!,
                          instructions: e.target.value
                        })}
                        placeholder="Assignment instructions"
                        rows={3}
                      />
                      <div className="flex items-center gap-4">
                        <div>
                          <Label>Passing Grade (%)</Label>
                          <Input
                            type="number"
                            value={module.assignment?.passingPercent || 70}
                            onChange={(e) => updateModule(moduleIndex, 'assignment', {
                              ...module.assignment!,
                              passingPercent: Number(e.target.value)
                            })}
                            className="w-24"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div>
                          <Label>Points</Label>
                          <Input
                            type="number"
                            value={module.assignment?.points || 10}
                            onChange={(e) => updateModule(moduleIndex, 'assignment', {
                              ...module.assignment!,
                              points: Number(e.target.value)
                            })}
                            className="w-20"
                            min="1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/instructor')}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Update Course'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCourse;
