import { Link } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Award, Video } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Deepen Your Faith Through Education
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Join thousands of students worldwide in their journey to understand theology through comprehensive online courses.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="text-lg">
                Start Learning Today
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="text-lg bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-primary mb-12">
            Why Choose TheologySchool?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Video className="h-12 w-12 mb-4 text-accent" />
                <CardTitle>Video Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  High-quality video content from renowned theological scholars and educators.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-12 w-12 mb-4 text-accent" />
                <CardTitle>Comprehensive Curriculum</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  From biblical studies to systematic theology, covering all essential topics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 mb-4 text-accent" />
                <CardTitle>Learn at Your Pace</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Study when it suits you with lifetime access to all course materials.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-12 w-12 mb-4 text-accent" />
                <CardTitle>Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Earn certificates upon completion to showcase your theological education.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-primary mb-6">About TheologySchool</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Founded with a mission to make quality theological education accessible to everyone, 
              TheologySchool brings together expert instructors and cutting-edge online learning 
              technology to create an unparalleled educational experience.
            </p>
            <p className="text-lg text-muted-foreground">
              Whether you're a seminary student, church leader, or simply curious about theology, 
              our courses are designed to deepen your understanding and strengthen your faith.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-primary mb-6">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of learners and start exploring the depths of theological knowledge today.
          </p>
          <Link to="/signup">
            <Button size="lg" className="text-lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
