import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Award, BookOpen, Target, ChevronRight } from 'lucide-react';

const AboutUs = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('history');

  const sections = [
    { id: 'history', title: 'Who We Are', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'mission', title: 'Our Mission', icon: <Target className="h-4 w-4" /> },
    { id: 'vision', title: 'Our Vision', icon: <Award className="h-4 w-4" /> },
    { id: 'values', title: 'Our Values', icon: <Users className="h-4 w-4" /> },
    { id: 'team', title: 'Leadership Team', icon: <Users className="h-4 w-4" /> }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground py-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-2xl md:text-4xl font-serif mb-3 tracking-wide">
            About Dothan Ministry
          </h1>
          <p className="text-sm md:text-base mb-6 max-w-xl mx-auto opacity-90 text-white font-light leading-relaxed">
            Learn more about Dothan Ministry and our commitment to quality theological education.
          </p>
        </div>
      </section>

      {/* Blog-style Content with Sidebar */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar Outline */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground shadow-md'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {section.icon}
                      <span className="text-sm font-medium">{section.title}</span>
                      <ChevronRight className={`h-3 w-3 ml-auto transition-transform ${
                        activeSection === section.id ? 'rotate-90' : ''
                      }`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-12">
                {/* Who We Are Section */}
                <article id="history" className="scroll-mt-24">
                  <Card className="border border-border/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-primary">
                          Who We Are
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          [Your content here - Tell me about Dothan Ministry's identity, background, and story]
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          [Your content here - Share about your organization's journey and purpose]
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </article>

                {/* Mission Section */}
                <article id="mission" className="scroll-mt-24">
                  <Card className="border border-border/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                          <Target className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-primary">
                          Our Mission
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          To support the church in making disciples through education and training, helping believers know their faith, truth, and identity. We are committed to providing quality theological education that equips leaders and ministers to strengthen their communities and make disciples who are grounded in the Word of God.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          Through specialized training in church leadership and discipleship, we empower individuals to serve with purpose and excellence in their local contexts.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </article>

                {/* Vision Section */}
                <article id="vision" className="scroll-mt-24">
                  <Card className="border border-border/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-primary">
                          Our Vision
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          To build a community of believers who truly know their faith, truth, and identity through quality education and training. We envision a global network of equipped leaders who are transforming their communities through sound biblical teaching and practical ministry application.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          Our vision extends beyond individual growth to collective impact, creating a ripple effect of discipleship that strengthens churches worldwide.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </article>

                {/* Values Section */}
                <article id="values" className="scroll-mt-24">
                  <Card className="border border-border/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-primary">
                          Our Values
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-lg max-w-none">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Faithfulness</h4>
                            <p className="text-muted-foreground leading-relaxed">
                              Committed to biblical truth and faithful teaching of God's Word in all our programs and interactions.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Excellence</h4>
                            <p className="text-muted-foreground leading-relaxed">
                              Pursuing academic and spiritual excellence in every aspect of our educational offerings.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Community</h4>
                            <p className="text-muted-foreground leading-relaxed">
                              Building relationships and fostering a supportive learning environment for all students.
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">Service</h4>
                            <p className="text-muted-foreground leading-relaxed">
                              Equipping believers to serve others with humility, love, and biblical wisdom.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </article>

                {/* History Section */}
                <article id="history" className="scroll-mt-24">
                  <Card className="border border-border/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                          <BookOpen className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-primary">
                          Who We Are
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          [Your content here - Tell me about Dothan Ministry's identity, background, and story]
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          [Your content here - Share about your organization's journey and purpose]
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </article>

                {/* Team Section */}
                <article id="team" className="scroll-mt-24">
                  <Card className="border border-border/50 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/15 to-primary/5 rounded-xl flex items-center justify-center shadow-lg border border-primary/20">
                          <Users className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-semibold text-primary">
                          Leadership Team
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="prose prose-lg max-w-none">
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          Our leadership team consists of experienced theologians, educators, and ministry practitioners who bring decades of combined experience in theological education and church leadership. Each team member is committed to our mission of equipping believers for effective ministry.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                          Together, we provide guidance, oversight, and strategic direction to ensure that Dothan Ministry continues to fulfill its calling with integrity and excellence.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutUs;
