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
          <h2 className="text-3xl md:text-5xl font-bold mb-5">
            Strengthening the Church Through Knowledge & Faith
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            Equip yourself with the truth, identity, and faith necessary to serve with purpose. Dothan Ministry provides comprehensive training and resources to empower believers and leaders, nurturing a deeper understanding of Scripture and mission.
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
            Why Choose Dothan?
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
            <h2 className="text-4xl font-bold text-primary mb-6">About Dothan</h2>
            <p className="text-lg text-muted-foreground mb-6">
            Dothan Ministry is committed to helping believers know their faith, truth, and identity. Through specialized training in church leadership and discipleship, we equip leaders and ministers to strengthen their communities and make disciples who are grounded in the Word of God. Join us in spreading the gospel through education and practical ministry training for today’s church.
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
        <div className="container mx-auto px-4 text-center space-y-10">
          <div>
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

          <div className="max-w-2xl mx-auto rounded-2xl border border-accent/40 bg-gradient-to-r from-accent to-secondary text-accent-foreground shadow-lg shadow-accent/40 p-8">
            <h3 className="text-2xl font-semibold mb-3">Support Dothan Ministry</h3>
            <p className="mb-6 text-sm md:text-base opacity-90">
              Help us equip more believers, leaders, and churches around the world with solid biblical
              training and resources. Your generosity directly fuels ministry and theological education.
            </p>
            <a
              href="https://www.globalstudentinc.com/dothan?fbclid=IwAR0N9DmYuSghoje4Q1IWJ8nqVoKRxlNCCR6VYVkPtp24oKdkHCs8wYF7wto"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                size="lg"
                variant="secondary"
                className="text-lg font-semibold px-10 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Donate to Dothan
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
