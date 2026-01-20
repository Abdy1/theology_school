import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { BookOpen, Award, Users, GraduationCap } from 'lucide-react';

export const Programs = () => {
  const { t } = useTranslation();

  const degreePrograms = [
    'Youth Ministry',
    'Child Development',
    'Academic Theology',
    'Christian Counseling',
    'Christian Leadership',
    'Church Planting',
    'Mission Studies'
  ];

  const diplomaPrograms = [
    'Church Planting',
    'Christian Journalism',
    'Christian Counseling Ministry',
    'Youth and Children\'s Ministry',
    'Women\'s Ministry'
  ];

  const certificatePrograms = [
    'Church Planting',
    'Christian Journalism',
    'Christian Counseling Ministry',
    'Youth, Women, and Children\'s Ministry',
    'Christian Leadership'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full mb-6">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Academic Programs</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Biblical Studies Programs
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We offer comprehensive Degree, Diploma, and Certificate programs in various fields of Biblical education. 
              Our goal is to equip students with knowledge, skills, and spiritual maturity to serve effectively in ministry and beyond.
            </p>
          </div>
        </div>
      </div>

      {/* Programs Content */}
      <div className="container mx-auto px-4 py-16">
        
        {/* Degree Programs */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Degree Programs</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Degree Programs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive undergraduate and graduate programs designed for deep theological education and ministry preparation.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {degreePrograms.map((program) => (
              <Card key={program} className="p-6 hover:shadow-lg transition-shadow border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{program}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  In-depth study and practical training in {program.toLowerCase()} for effective ministry leadership.
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Diploma Programs */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Diploma Programs</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Diploma Programs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Focused programs providing specialized training for specific ministry areas and practical skills development.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diplomaPrograms.map((program) => (
              <Card key={program} className="p-6 hover:shadow-lg transition-shadow border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{program}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Specialized training in {program.toLowerCase()} with hands-on ministry experience and practical application.
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Certificate Programs */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Certificate Programs</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Certificate Programs</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Short-term intensive programs designed for specific ministry skills and continuing education.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificatePrograms.map((program) => (
              <Card key={program} className="p-6 hover:shadow-lg transition-shadow border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{program}</h3>
                </div>
                <p className="text-muted-foreground text-sm">
                  Intensive training in {program.toLowerCase()} for immediate ministry application and skill enhancement.
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center py-12 bg-primary/5 rounded-2xl">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of learners and discover how our Biblical Studies programs can equip you for effective ministry service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <button className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                Apply Now
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-8 py-3 bg-background border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium">
                Learn More
              </button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
};
