import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = 'http://localhost:8081';

type Question = {
  id: number;
  questionText: string;
  options: string[];
  correctIndex: number;
};

const PASSING_PERCENT = 70;

const CourseQuiz = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { courseId, moduleIndex } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const moduleIdx = useMemo(() => Number(moduleIndex), [moduleIndex]);
  const moduleData = useMemo(() => course?.modules?.[moduleIdx], [course, moduleIdx]);
  const questions: Question[] = moduleData?.questions || [];

  const totalAnswered = useMemo(
    () => Object.values(answers).filter((v) => v !== null && v !== undefined).length,
    [answers],
  );

  const score = useMemo(() => {
    if (!submitted) return 0;
    const correct = questions.reduce((acc, q) => {
      const userAns = answers[q.id];
      return acc + (userAns === q.correctIndex ? 1 : 0);
    }, 0);
    return questions.length ? Math.round((correct / questions.length) * 100) : 0;
  }, [submitted, questions, answers]);

  const passed = submitted && score >= PASSING_PERCENT;

  const handleSelect = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (questions.length === 0) {
      toast({
        title: 'No questions available',
        description: 'This module has no quiz.',
      });
      return;
    }

    if (totalAnswered < questions.length) {
      toast({
        title: 'Answer all questions',
        description: 'Please answer all questions before submitting.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert answers to the format expected by API
      const apiAnswers: Record<number, string> = {};
      questions.forEach(q => {
        apiAnswers[q.id] = (answers[q.id] ?? 0).toString();
      });

      const resp = await fetch(`${API_BASE_URL}/api/quiz/${questions[0].id}/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: Number(user.id),
          courseId: Number(courseId),
          moduleId: Number(moduleData.id),
          answers: apiAnswers,
        }),
      });

      if (!resp.ok) {
        throw new Error('Quiz submit failed');
      }

      const result = await resp.json();
      
      setSubmitted(true);
      
      toast({
        title: result.passed ? 'Quiz passed!' : 'Quiz not passed',
        description: `Score: ${result.percentage}% (${result.correctAnswers}/${result.totalQuestions})`,
        variant: result.passed ? 'default' : 'destructive',
      });

      // Navigate back after a delay
      setTimeout(() => {
        navigate(`/courses/${courseId}/learn`);
      }, 2000);
      
    } catch (error) {
      console.error('Submit quiz error', error);
      toast({
        title: 'Could not submit quiz',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Breadcrumb />
        <div className="container mx-auto px-4 py-8">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (!course || !moduleData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Breadcrumb />
        <div className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Module not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(`/courses/${courseId}/learn`)}>
            Back to learning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Breadcrumb />
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Quiz for</p>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <CardDescription>Module {moduleIdx + 1}: {moduleData.title}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{questions.length} question(s)</Badge>
            <Badge variant={passed ? 'default' : 'outline'}>
              {submitted ? `Score: ${score}%` : 'Not submitted'}
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Module Assessment</CardTitle>
            <CardDescription>
              Answer all questions. Passing requires {PASSING_PERCENT}% or higher.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.length === 0 && (
              <p className="text-muted-foreground">No questions for this module.</p>
            )}
            {questions.map((q, idx) => (
              <div key={q.id ?? idx} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">Q{idx + 1}. {q.questionText}</p>
                    <p className="text-xs text-muted-foreground">Choose one option</p>
                  </div>
                  {submitted && (
                    <Badge variant={answers[q.id] === q.correctIndex ? 'default' : 'destructive'}>
                      {answers[q.id] === q.correctIndex ? 'Correct' : 'Incorrect'}
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  {q.options?.map((opt, optIndex) => {
                    const isSelected = answers[q.id] === optIndex;
                    const isCorrect = submitted && q.correctIndex === optIndex;
                    const isWrong = submitted && isSelected && q.correctIndex !== optIndex;
                    return (
                      <button
                        key={optIndex}
                        className={`w-full text-left rounded-md border px-3 py-2 transition ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-muted'
                        } ${isCorrect ? 'border-green-600' : ''} ${isWrong ? 'border-destructive bg-destructive/5' : ''}`}
                        onClick={() => handleSelect(q.id ?? idx, optIndex)}
                        disabled={submitted}
                      >
                        <span className="font-medium">{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSubmit} disabled={questions.length === 0 || totalAnswered < questions.length}>
                Submit quiz
              </Button>
              <Button variant="outline" onClick={() => navigate(`/courses/${courseId}/learn`)}>
                Back to learning
              </Button>
              {moduleIdx < (course.modules?.length || 0) - 1 && (
                <Button
                  variant="secondary"
                  disabled={!passed}
                  onClick={() => navigate(`/courses/${courseId}/modules/${moduleIdx + 1}/quiz`)}
                >
                  Next module quiz
                </Button>
              )}
            </div>
            {submitted && !passed && (
              <p className="text-sm text-muted-foreground">
                You need at least {PASSING_PERCENT}% to proceed. Review the content and try again.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              All questions must be answered before submitting.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CourseQuiz;



