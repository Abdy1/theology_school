import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Award, Video, Play, ChevronLeft, ChevronRight, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Send, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import { useState } from 'react';

const Index = () => {
  const { t } = useTranslation();
  const { user, isLoading, isStudent, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [activeValuesTab, setActiveValuesTab] = useState('Vision');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      quote: "Dothan Ministry has transformed my understanding of Scripture and deepened my faith. The courses are comprehensive and the instructors are truly dedicated to helping students grow.",
      author: "Sarah Johnson",
      role: "Bachelor of Theology Student",
      location: "Kenya",
      avatar: "SJ",
      rating: 5
    },
    {
      id: 2,
      quote: "The flexibility of online learning combined with quality theological education has been a blessing. I can study while serving in my local church.",
      author: "Michael Chen",
      role: "Master of Divinity Student",
      location: "Singapore",
      avatar: "MC",
      rating: 5
    },
    {
      id: 3,
      quote: "The biblical counseling program has equipped me with practical skills to help others in my community. The training is both academically sound and spiritually enriching.",
      author: "Esther Williams",
      role: "Christian Counseling Diploma",
      location: "Nigeria",
      avatar: "EW",
      rating: 4
    },
    {
      id: 4,
      quote: "As a church leader, the resources and training from Dothan have been invaluable. The curriculum is well-structured and applicable to real ministry challenges.",
      author: "David Martinez",
      role: "Pastor & Student",
      location: "Mexico",
      avatar: "DM",
      rating: 5
    },
    {
      id: 5,
      quote: "The certificate program gave me the foundational knowledge I needed to teach Sunday school more effectively. I highly recommend it to anyone wanting to serve better.",
      author: "Grace Kim",
      role: "Biblical Studies Certificate",
      location: "South Korea",
      avatar: "GK",
      rating: 4
    },
    {
      id: 6,
      quote: "Dothan Ministry's commitment to making theological education accessible is remarkable. The quality of education rivals any traditional seminary.",
      author: "James Thompson",
      role: "Online Degree Student",
      location: "United Kingdom",
      avatar: "JT",
      rating: 5
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  // Redirect logged-in users to their dashboard
  if (!isLoading && user) {
    if (isStudent) {
      navigate('/student');
    } else if (isTeacher) {
      navigate('/instructor');
    } else if (isAdmin) {
      navigate('/admin');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white shadow-inner">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row min-h-[400px] overflow-hidden shadow-2xl">
            {/* Left Side - Main Content */}
            <div className="flex-1 text-center lg:text-left py-12 px-6 lg:px-12 relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 shadow-2xl">
              <div className="relative z-10">
                <div className="inline-block mb-6">
                  <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white uppercase tracking-wider border border-white/10 shadow-lg transition-all duration-300 hover:bg-white/30 hover:border-white/20 hover:scale-105 hover:shadow-2xl">
                    Welcome to Dothan Ministry
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-serif mb-4 md:mb-6 tracking-tight text-white leading-tight drop-shadow-lg">
                  {t('index:strengtheningChurch')}
                </h1>
                <p className="text-base md:text-lg lg:text-xl mb-6 md:mb-8 max-w-2xl lg:max-w-3xl text-white/95 font-serif leading-relaxed lg:mx-0 mx-auto font-light">
                  {t('index:equipYourself')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                  <Link to="/signup">
                    <Button size="lg" variant="secondary" className="px-8 py-4 text-base font-semibold bg-[#FCAF17] text-white hover:bg-yellow-600 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl border border-white/20">
                      <Play className="mr-2 h-5 w-5" />
                      {t('index:startLearningToday')}
                    </Button>
                  </Link>
                  <Link to="/courses">
                    <Button size="lg" className="px-8 py-4 text-base font-semibold bg-[#FCAF17] text-white hover:bg-yellow-600 hover:text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl">
                      <BookOpen className="mr-2 h-5 w-5" />
                      {t('index:browseCourses')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Right Side - Features */}
            <div className="flex-1 py-12 px-6 lg:px-12 relative bg-gray-50">
              <div className="relative z-10">
                {/* Why Choose Dothan Features */}
                <div className="w-full space-y-3">
                  <div className="inline-block mb-6">
                    <span className="px-4 py-2 bg-[#FCAF17]/20 backdrop-blur-sm rounded-full text-sm font-semibold text-[#FCAF17] uppercase tracking-wider border border-[#FCAF17]/30 shadow-lg">
                      Why Choose Dothan?
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-serif mb-6 tracking-tight text-gray-800 leading-tight drop-shadow-md">
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FCAF17]/30 to-[#FCAF17]/10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 group-hover:scale-110 group-hover:from-[#FCAF17]/50 group-hover:to-[#FCAF17]/25 shadow-md">
                        <Video className="h-4 w-4 text-gray-700 transition-transform duration-300 group-hover:rotate-12" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-xs mb-0.5 transition-colors duration-300 group-hover:text-[#FCAF17]">{t('index:videoLessons')}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 transition-opacity duration-300 group-hover:text-gray-700">{t('index:videoDescription')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FCAF17]/30 to-[#FCAF17]/10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 group-hover:scale-110 group-hover:from-[#FCAF17]/50 group-hover:to-[#FCAF17]/25 shadow-md">
                        <BookOpen className="h-4 w-4 text-gray-700 transition-transform duration-300 group-hover:rotate-12" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-xs mb-0.5 transition-colors duration-300 group-hover:text-[#FCAF17]">{t('index:comprehensiveCurriculum')}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 transition-opacity duration-300 group-hover:text-gray-700">{t('index:curriculumDescription')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FCAF17]/30 to-[#FCAF17]/10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 group-hover:scale-110 group-hover:from-[#FCAF17]/50 group-hover:to-[#FCAF17]/25 shadow-md">
                        <Users className="h-4 w-4 text-gray-700 transition-transform duration-300 group-hover:rotate-12" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-xs mb-0.5 transition-colors duration-300 group-hover:text-[#FCAF17]">{t('index:learnAtYourPace')}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 transition-opacity duration-300 group-hover:text-gray-700">{t('index:paceDescription')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-gray-200 transition-all duration-300 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200 group">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#FCAF17]/30 to-[#FCAF17]/10 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0 group-hover:scale-110 group-hover:from-[#FCAF17]/50 group-hover:to-[#FCAF17]/25 shadow-md">
                        <Award className="h-4 w-4 text-gray-700 transition-transform duration-300 group-hover:rotate-12" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-xs mb-0.5 transition-colors duration-300 group-hover:text-[#FCAF17]">{t('index:certificates')}</h4>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 transition-opacity duration-300 group-hover:text-gray-700">{t('index:certificatesDescription')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Online Programs Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-white opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-primary/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-primary-foreground">
            <h2 className="text-3xl font-serif text-left text-primary-foreground mb-8 tracking-wide uppercase">
              Featured Online Programs
            </h2>
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-12 border-b border-primary-foreground/20">
            {['All', 'Online Degree', 'Online Diploma', 'Certificate Programs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium transition-all duration-300 border-b-2 ${
                  activeTab === tab
                    ? 'text-primary-foreground border-primary-foreground bg-primary-foreground/10'
                    : 'text-primary-foreground/70 border-transparent hover:text-primary-foreground hover:border-primary-foreground/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Course Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                id: 1,
                title: 'Bachelor of Theology',
                category: 'Online Degree',
                description: 'Comprehensive theological education covering biblical studies, church history, and practical ministry.',
                duration: '4 Years',
                enrolled: 245
              },
              {
                id: 2,
                title: 'Master of Divinity',
                category: 'Online Degree',
                description: 'Advanced theological training for pastoral leadership and biblical scholarship.',
                duration: '3 Years',
                enrolled: 189
              },
              {
                id: 3,
                title: 'Christian Counseling',
                category: 'Online Diploma',
                description: 'Professional training in biblical counseling and pastoral care methods.',
                duration: '2 Years',
                enrolled: 156
              },
              {
                id: 4,
                title: 'Biblical Studies',
                category: 'Certificate Programs',
                description: 'Foundational knowledge of Scripture interpretation and theological principles.',
                duration: '1 Year',
                enrolled: 312
              }
            ]
            .filter(course => activeTab === 'All' ? true : course.category === activeTab)
            .map((course) => (
              <Card key={course.id} className="group hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 transform hover:-translate-y-1 border border-primary/20 bg-white">
                <CardHeader className="p-0">
                  {/* Course Preview */}
                  <div className="relative h-36 bg-gradient-to-br from-primary/10 to-primary/5 rounded-t-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
                      <div className="w-12 h-12 bg-primary/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-primary/70 text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                      {course.category}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2 font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-xs leading-relaxed mb-4">
                    {course.description}
                  </CardDescription>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-muted-foreground">{course.duration}</span>
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 text-sm py-2">
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Explore More CTA */}
          <div className="flex gap-4 justify-start">
            <Button size="lg" variant="secondary" className="px-6 py-3 bg-white text-primary hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              Explore More
            </Button>
            <Button size="lg" className="px-6 py-3 bg-[#FCAF17] text-white hover:bg-[#FCAF17]/90 transition-all duration-300 transform hover:scale-105">
              Register Now
            </Button>
          </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-muted py-20 relative overflow-hidden">
        {/* Logo Background Overlay */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <img 
            src="/images/dothan logo.PNG" 
            alt="Dothan Logo Background" 
            className="w-96 h-96 object-contain"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Text Content - Left Side */}
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-3xl font-serif text-primary mb-6 tracking-wide text-left">About Dothan Ministries</h2>
                <p className="text-lg text-muted-foreground mb-4 text-justify leading-relaxed">
                  {t('index:aboutDothanPassage1')}
                </p>
                <p className="text-lg text-muted-foreground text-justify leading-relaxed">
                  {t('index:aboutDothanPassage2')}
                </p>
                
                {/* CTA Buttons */}
                <div className="flex gap-4 mt-6">
                  <Button size="lg" className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105">
                    Read More
                  </Button>
                  <a
                    href="https://www.globalstudentinc.com/dothan?fbclid=IwAR0N9DmYuSghoje4Q1IWJ8nqVoKRxlNCCR6VYVkPtp24oKdkHCs8wYF7wto"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="lg" variant="outline" className="px-8 py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-105">
                      Donate to Dothan
                    </Button>
                  </a>
                </div>
              </div>
              
              {/* Logo - Right Side */}
              <div className="flex-shrink-0">
                <img 
                  src="/images/dothan logo.PNG" 
                  alt="Dothan Logo" 
                  className="w-[500px] h-[500px] max-w-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision, Mission & Values Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-serif text-primary mb-8 tracking-wide text-center">Who We Are</h2>
            
            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-primary/20">
              {['Vision', 'Mission', 'Core Values'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveValuesTab(tab)}
                  className={`px-6 py-3 text-sm font-medium transition-all duration-300 border-b-2 ${
                    activeValuesTab === tab
                      ? 'text-primary border-primary bg-primary/10'
                      : 'text-primary/70 border-transparent hover:text-primary hover:border-primary/30'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mt-8">
              {activeValuesTab === 'Vision' && (
                <div className="bg-muted/50 rounded-lg p-8 shadow-lg border border-primary/20">
                  <h3 className="text-2xl font-semibold text-primary mb-4">Vision</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    To support the church in making disciples through education and training, helping believers know their faith, truth, and identity. By offering both short-term and long-term training programs, Dothan Ministry seeks to reach the church wherever it is found, equipping and strengthening believers for effective service.
                  </p>
                </div>
              )}

              {activeValuesTab === 'Mission' && (
                <div className="bg-muted/50 rounded-lg p-8 shadow-lg border border-primary/20">
                  <h3 className="text-2xl font-semibold text-primary mb-4">Mission</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    To build a community of believers who truly know their faith, truth, and identity. We accomplish this by preparing teaching modules, translating resources, training trainers, and making education and training accessible to churches everywhere.
                  </p>
                </div>
              )}

              {activeValuesTab === 'Core Values' && (
                <div className="bg-muted/50 rounded-lg p-8 shadow-lg border border-primary/20">
                  <h3 className="text-2xl font-semibold text-primary mb-4">Core Values</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-medium">•</span>
                        <span className="text-muted-foreground">Faithfulness</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-medium">•</span>
                        <span className="text-muted-foreground">Commitment to learning</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-medium">•</span>
                        <span className="text-muted-foreground">Speaking the truth in love</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-medium">•</span>
                        <span className="text-muted-foreground">Understanding and explaining identity rightly</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-medium">•</span>
                        <span className="text-muted-foreground">Beginning well and finishing faithfully</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-medium">•</span>
                        <span className="text-muted-foreground">Pursuit of knowledge above all else</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-medium">•</span>
                        <span className="text-muted-foreground">Dedication to teaching</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-medium">•</span>
                        <span className="text-muted-foreground">Demonstrating Christ in daily life</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-medium">•</span>
                        <span className="text-muted-foreground">Perseverance</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Digital Library Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-serif text-primary mb-16 tracking-wide text-center">{t('index:useOurDigitalLibrary')}</h2>
            
            {/* Book Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                {
                  id: 1,
                  title: 'Systematic Theology',
                  author: 'Wayne Grudem',
                  description: 'Comprehensive introduction to biblical doctrine, covering all major theological topics.',
                  category: 'Theology',
                  pages: 1290
                },
                {
                  id: 2,
                  title: 'Knowing God',
                  author: 'J.I. Packer',
                  description: 'A classic work exploring the nature and character of God and our relationship with Him.',
                  category: 'Spiritual Formation',
                  pages: 286
                },
                {
                  id: 3,
                  title: 'The Cost of Discipleship',
                  author: 'Dietrich Bonhoeffer',
                  description: 'A profound examination of the Sermon on the Mount and what it means to follow Christ.',
                  category: 'Christian Living',
                  pages: 320
                },
                {
                  id: 4,
                  title: 'Biblical Hermeneutics',
                  author: 'Milton Terry',
                  description: 'Essential guide to interpreting Scripture with historical and grammatical accuracy.',
                  category: 'Biblical Studies',
                  pages: 560
                },
                {
                  id: 5,
                  title: 'Church History in Plain Language',
                  author: 'Bruce Shelley',
                  description: 'An accessible overview of Christianity from its origins to the present day.',
                  category: 'Church History',
                  pages: 528
                },
                {
                  id: 6,
                  title: 'The Purpose Driven Life',
                  author: 'Rick Warren',
                  description: 'A 40-day spiritual journey to understand God\'s purpose for your life.',
                  category: 'Christian Living',
                  pages: 336
                },
                {
                  id: 7,
                  title: 'New Testament Commentary',
                  author: 'John Stott',
                  description: 'Comprehensive exposition of New Testament books with practical applications.',
                  category: 'Biblical Studies',
                  pages: 896
                },
                {
                  id: 8,
                  title: 'Christian Ethics',
                  author: 'Wayne Grudem',
                  description: 'Biblical principles for making moral decisions in contemporary society.',
                  category: 'Ethics',
                  pages: 792
                }
              ].map((book) => (
                <Card key={book.id} className="group hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1 border border-border/50 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="p-0">
                    {/* Book Cover */}
                    <div className="relative h-48 bg-gradient-to-br from-primary/20 to-primary/10 rounded-t-lg overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-20 bg-primary/30 rounded-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          <BookOpen className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 bg-primary/70 text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                        {book.category}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg mb-2 font-semibold text-primary group-hover:text-primary/80 transition-colors line-clamp-1">
                      {book.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mb-2 font-medium">{book.author}</p>
                    <CardDescription className="text-muted-foreground text-xs leading-relaxed mb-3 line-clamp-3">
                      {book.description}
                    </CardDescription>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">{book.pages} pages</span>
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 text-sm py-2">
                      Read Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center">
              <Link to="/library">
              <Button size="lg" variant="outline" className="px-8 py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-105">
                Browse All Books
              </Button>
            </Link>
              <Button size="lg" className="px-8 py-3 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105">
                Access Library
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-serif text-primary mb-16 tracking-wide text-center">{t('index:whatOurStudentsSay')}</h2>
            
            {/* Single Testimonial Display */}
            <div className="relative">
              <Card className="group hover:shadow-xl transition-all duration-500 border border-border/50 bg-white/80 backdrop-blur-sm p-8 md:p-12">
                <CardContent className="p-0">
                  {/* Quote Icon */}
                  <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-primary text-3xl font-serif">"</span>
                    </div>
                  </div>
                  
                  {/* Quote Text */}
                  <blockquote className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-8 italic text-center">
                    "{testimonials[currentTestimonial].quote}"
                  </blockquote>
                  
                  {/* Author Info */}
                  <div className="flex flex-col items-center gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">{testimonials[currentTestimonial].avatar}</span>
                    </div>
                    
                    {/* Author Details */}
                    <div className="text-center">
                      <p className="font-semibold text-primary text-lg">{testimonials[currentTestimonial].author}</p>
                      <p className="text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                      <p className="text-muted-foreground text-sm">{testimonials[currentTestimonial].location}</p>
                      
                      {/* Rating Stars */}
                      <div className="flex justify-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= testimonials[currentTestimonial].rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between mt-8">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentTestimonial((prev) => prev === 0 ? testimonials.length - 1 : prev - 1)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Dots Indicator */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentTestimonial
                          ? 'bg-primary w-8'
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" className="px-8 py-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-105">
                Read More Stories
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-serif text-primary mb-6 tracking-wide text-center">Contact Us</h2>
            <p className="text-base text-muted-foreground mb-8 text-center">
              Have questions? Send us a message and we'll respond soon.
            </p>
            
            <Card className="bg-white/80 backdrop-blur-sm border border-border/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your Name"
                      required
                      className="w-full px-3 py-2 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 bg-white/80 text-sm"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Your Email"
                      required
                      className="w-full px-3 py-2 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 bg-white/80 text-sm"
                    />
                  </div>
                  
                  <div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your Message"
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-border/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 bg-white/80 resize-none text-sm"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 py-2 text-sm"
                  >
                    <Send className="mr-2 h-3 w-3" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      
      <Footer />
    </div>
  );
};

export default Index;
