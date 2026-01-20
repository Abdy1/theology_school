import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Play, Send, Users, BookOpen, Award, Book, Building } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FloatingNavigation } from '@/components/FloatingNavigation';
import { Footer } from '@/components/Footer';
import { Navigation } from '@/components/Navigation';


  const Index = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('All');
  const [activeValuesTab, setActiveValuesTab] = useState('About');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [currentBookIndex, setCurrentBookIndex] = useState(0);

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

  const nextBooks = () => {
    setCurrentBookIndex((prev) => (prev + 4) % 8);
  };

  const prevBooks = () => {
    setCurrentBookIndex((prev) => (prev - 4 + 8) % 8);
  };

  const getVisibleBooks = () => {
    const books = [
      {
        id: 1,
        title: 'Systematic Theology',
        author: 'Wayne Grudem',
        description: 'Comprehensive introduction to biblical doctrine, covering all major theological topics.',
        category: 'Theology',
        pages: 1290,
        icon: '📚'
      },
      {
        id: 2,
        title: 'Knowing God',
        author: 'J.I. Packer',
        description: 'A classic work exploring nature and character of God and our relationship with Him.',
        category: 'Spiritual Formation',
        pages: 286,
        icon: '🙏'
      },
      {
        id: 3,
        title: 'The Cost of Discipleship',
        author: 'Dietrich Bonhoeffer',
        description: 'A profound examination of Sermon on the Mount and what it means to follow Christ.',
        category: 'Christian Living',
        pages: 320,
        icon: '✝️'
      },
      {
        id: 4,
        title: 'Biblical Hermeneutics',
        author: 'Milton Terry',
        description: 'Essential guide to interpreting Scripture with historical and grammatical accuracy.',
        category: 'Biblical Studies',
        pages: 560,
        icon: '📜'
      },
      {
        id: 5,
        title: 'Church History in Plain Language',
        author: 'Bruce Shelley',
        description: 'An accessible overview of Christianity from its origins to present day.',
        category: 'Church History',
        pages: 528,
        icon: '🏛️'
      },
      {
        id: 6,
        title: 'The Purpose Driven Life',
        author: 'Rick Warren',
        description: 'A 40-day spiritual journey to understand God\'s purpose for your life.',
        category: 'Christian Living',
        pages: 336,
        icon: '🎯'
      },
      {
        id: 7,
        title: 'New Testament Commentary',
        author: 'John Stott',
        description: 'Comprehensive exposition of New Testament books with practical applications.',
        category: 'Biblical Studies',
        pages: 896,
        icon: '📜'
      },
      {
        id: 8,
        title: 'Christian Ethics',
        author: 'Wayne Grudem',
        description: 'Biblical principles for making moral decisions in contemporary society.',
        category: 'Ethics',
        pages: 792,
        icon: '⚖️'
      }
    ];
    
    // Get 4 books based on current page
    const visibleBooks = [];
    const startIndex = Math.floor(currentBookIndex / 4) * 4;
    for (let i = 0; i < 4; i++) {
      const index = startIndex + i;
      visibleBooks.push(books[index]);
    }
    return visibleBooks;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <FloatingNavigation />
      
      {/* Hero Section */}
      <section id="hero" className="relative bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row min-h-[500px]">
            {/* Left Side - Main Content */}
            <div className="flex-1 text-center lg:text-left py-16 px-6 lg:px-12 bg-primary text-white">
              <div className="mb-6">
                <span className="px-4 py-2 bg-white/20 rounded-full text-sm font-semibold uppercase tracking-wider">
                  Welcome to Dothan Ministry
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-6 tracking-tight">
                {t('index:strengtheningChurch')}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl lg:max-w-4xl font-serif leading-relaxed lg:mx-0 mx-auto font-light">
                {t('index:equipYourself')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                <Link to="/signup">
                  <Button size="lg" variant="secondary" className="px-8 py-4 text-base font-semibold bg-[#FCAF17] text-white hover:bg-yellow-600">
                    <Play className="mr-2 h-5 w-5" />
                    {t('index:startLearningToday')}
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" className="px-8 py-4 text-base font-semibold bg-white/20 text-white hover:bg-white/30">
                    <BookOpen className="mr-2 h-5 w-5" />
                    {t('index:browseCourses')}
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right Side - Features */}
            <div className="flex-1 py-16 px-6 lg:px-12 bg-gray-50">
              <div className="w-full space-y-4">
                <div className="mb-6">
                  <span className="px-4 py-2 bg-[#FCAF17]/20 rounded-full text-sm font-semibold text-[#FCAF17] uppercase tracking-wider">
                    Why Choose Dothan?
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-[#FCAF17]/30">
                    <div className="w-8 h-8 bg-[#FCAF17]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Play className="h-4 w-4 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm mb-1">{t('index:videoLessons')}</h4>
                      <p className="text-xs text-gray-600">{t('index:videoDescription')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-[#FCAF17]/30">
                    <div className="w-8 h-8 bg-[#FCAF17]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm mb-1">{t('index:comprehensiveCurriculum')}</h4>
                      <p className="text-xs text-gray-600">{t('index:curriculumDescription')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-[#FCAF17]/30">
                    <div className="w-8 h-8 bg-[#FCAF17]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="h-4 w-4 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm mb-1">{t('index:learnAtYourPace')}</h4>
                      <p className="text-xs text-gray-600">{t('index:paceDescription')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-[#FCAF17]/30">
                    <div className="w-8 h-8 bg-[#FCAF17]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="h-4 w-4 text-gray-700" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm mb-1">{t('index:certificates')}</h4>
                      <p className="text-xs text-gray-600">{t('index:certificatesDescription')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Online Programs Section */}
      <section id="programs" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Available Online Academic Programs</span>
            </div>
          </div>
          
          {/* Simple Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-gray-200">
            {['All', 'Online Degree', 'Online Diploma', 'Certificate Programs'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-primary'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Simple Course Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 mb-12">
            {[
              {
                id: 1,
                title: 'Bachelor of Theology',
                category: 'Online Degree',
                description: 'Comprehensive theological education covering biblical studies, church history, and practical ministry.',
                duration: '4 Years',
                enrolled: 245,
                level: 'Undergraduate',
                icon: '📖'
              },
              {
                id: 2,
                title: 'Master of Divinity',
                category: 'Online Degree',
                description: 'Advanced theological training for pastoral leadership and biblical scholarship.',
                duration: '3 Years',
                enrolled: 189,
                level: 'Graduate',
                icon: '📖'
              },
              {
                id: 3,
                title: 'Christian Counseling',
                category: 'Online Diploma',
                description: 'Professional training in biblical counseling and pastoral care methods.',
                duration: '2 Years',
                enrolled: 156,
                level: 'Diploma',
                icon: '📖'
              },
              {
                id: 4,
                title: 'Biblical Studies',
                category: 'Certificate Programs',
                description: 'Foundational knowledge of Scripture interpretation and theological principles.',
                duration: '1 Year',
                enrolled: 312,
                level: 'Certificate',
                icon: '📖'
              },
              {
                id: 5,
                title: 'Youth Ministry',
                category: 'Certificate Programs',
                description: 'Equipping leaders to effectively minister to young people in today\'s culture.',
                duration: '6 Months',
                enrolled: 89,
                level: 'Certificate',
                icon: '👥'
              },
              {
                id: 6,
                title: 'Worship Leadership',
                category: 'Online Diploma',
                description: 'Developing skills in worship planning, music ministry, and spiritual leadership.',
                duration: '1 Year',
                enrolled: 134,
                level: 'Diploma',
                icon: '🎵'
              },
              {
                id: 7,
                title: 'Biblical Languages',
                category: 'Certificate Programs',
                description: 'Learn Greek and Hebrew to better understand the original biblical texts.',
                duration: '9 Months',
                enrolled: 76,
                level: 'Certificate',
                icon: '🔤'
              },
              {
                id: 8,
                title: 'Mission & Evangelism',
                category: 'Online Diploma',
                description: 'Training for effective cross-cultural ministry and evangelistic outreach.',
                duration: '18 Months',
                enrolled: 203,
                level: 'Diploma',
                icon: '🌍'
              },
              {
                id: 9,
                title: 'Church Administration',
                category: 'Online Diploma',
                description: 'Leadership skills for church management, finance, and organizational development.',
                duration: '1 Year',
                enrolled: 167,
                level: 'Diploma',
                icon: '⛪'
              },
              {
                id: 10,
                title: 'Apologetics',
                category: 'Certificate Programs',
                description: 'Defending the faith through reasoned arguments and biblical evidence.',
                duration: '8 Months',
                enrolled: 94,
                level: 'Certificate',
                icon: '🛡️'
              }
            ]
            .filter(course => activeTab === 'All' ? true : course.category === activeTab)
            .map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow border border-gray-200 bg-white">
                <CardHeader className="p-0">
                  <div className="relative h-32 bg-gray-100 rounded-t-lg flex items-center justify-center group">
                    <div className="absolute inset-0 bg-black/20 rounded-t-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-100 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110 shadow-lg">
                        <Play className="h-5 w-5 text-gray-800 ml-1" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2 font-semibold text-primary">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-sm mb-4">
                    {course.description}
                  </CardDescription>
                  <div className="text-[10px] px-1.5 py-1 rounded font-medium inline-block mb-2 bg-[#394149] text-white">
                    {course.category}
                  </div>
                  <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                    <span>{course.duration}</span>
                    <span>{course.enrolled} enrolled</span>
                  </div>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Simple CTA Section */}
          <div className="flex gap-4 justify-center">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Explore All Programs
            </Button>
            <Button size="lg" className="bg-[#FCAF17] text-white hover:bg-yellow-600">
              Register Now
            </Button>
          </div>
        </div>
      </section>

      {/* About Dothan Ministries Section */}
      <section id="about" className="pt-24 bg-gradient-to-br from-slate-50 via-white to-slate-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-primary font-medium text-sm uppercase tracking-wider">About Dothan Ministries</span>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">
              {/* Text Content - Left Side */}
              <div className="flex-1 space-y-6">
                {/* Vision, Mission & Core Values Tabs */}
                <div>
                  {/* Tabs Navigation */}
                  <div className="flex flex-wrap justify-start gap-2 mb-8 border-b border-gray-200">
                    {['About', 'Vision', 'Mission', 'Core Values'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveValuesTab(tab)}
                        className={`px-4 py-2 text-xs font-medium transition-all duration-300 border-b-2 ${
                          activeValuesTab === tab
                            ? 'text-primary border-primary bg-primary/5'
                            : 'text-muted-foreground border-transparent hover:text-primary hover:bg-gray-50'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[300px]">
                    {activeValuesTab === 'About' && (
                      <div className="space-y-6">
                        <h3 className="text-2xl font-semibold text-primary mb-8 text-center">About Dothan Ministries</h3>
                        <div className="space-y-6">
                          <p className="text-muted-foreground leading-relaxed text-justify">
                            {t('index:aboutDothanPassage1')}
                          </p>
                          <p className="text-muted-foreground leading-relaxed text-justify mb-16">
                            {t('index:aboutDothanPassage2')}
                          </p>
                          
                          {/* Statistics Section */}
                          <div className="flex flex-wrap justify-start gap-8 mt-8 pt-8 border-t border-gray-200">
                            {[
                              { number: "Hundreds", label: "Ministers Trained", icon: <Users className="h-6 w-6 text-primary" /> },
                              { number: "10+", label: "Courses Offered", icon: <BookOpen className="h-6 w-6 text-primary" /> },
                              { number: "Various", label: "Churches Reached", icon: <Building className="h-6 w-6 text-primary" /> },
                              { number: "2+", label: "Years of Ministry", icon: <Award className="h-6 w-6 text-primary" /> },
                              { number: "Specialized", label: "Training Programs", icon: <Book className="h-6 w-6 text-primary" /> }
                            ].map((stat, index) => (
                              <div key={index} className="text-left">
                                <div className="flex items-center gap-2 mb-3">
                                  {stat.icon}
                                  <div className="text-lg font-bold text-primary">{stat.number}</div>
                                </div>
                                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{stat.label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeValuesTab === 'Vision' && (
                      <div className="space-y-4">
                        <h3 className="text-2xl font-semibold text-primary mb-4 text-center">Our Vision</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed text-justify">
                          To support the church in making disciples through education and training, helping believers know their faith, truth, and identity. By offering both short-term and long-term training programs, Dothan Ministry seeks to reach the church wherever it is found, equipping and strengthening believers for effective service.
                        </p>
                      </div>
                    )}

                    {activeValuesTab === 'Mission' && (
                      <div className="space-y-4">
                        <h3 className="text-2xl font-semibold text-primary mb-4 text-center">Our Mission</h3>
                        <p className="text-lg text-muted-foreground leading-relaxed text-justify">
                          To build a community of believers who truly know their faith, truth, and identity. We accomplish this by preparing teaching modules, translating resources, training trainers, and making education and training accessible to churches everywhere.
                        </p>
                      </div>
                    )}

                    {activeValuesTab === 'Core Values' && (
                      <div className="space-y-4">
                        <h3 className="text-2xl font-semibold text-primary mb-6 text-center">Core Values</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          {[
                            'Faithfulness',
                            'Commitment to learning',
                            'Speaking the truth in love',
                            'Understanding and explaining identity rightly',
                            'Beginning well and finishing faithfully',
                            'Pursuit of knowledge above all else',
                            'Dedication to teaching',
                            'Demonstrating Christ in daily life',
                            'Perseverance'
                          ].map((value, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                              <div className="w-2 h-2 bg-[#FCAF17] rounded-full flex-shrink-0"></div>
                              <span className="text-muted-foreground font-medium">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Enhanced CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6 justify-start mb-16">
                  <Link to="/about">
                    <Button size="lg" className="px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                      Learn More About Us
                    </Button>
                  </Link>
                  <a
                    href="https://www.globalstudentinc.com/dothan?fbclid=IwAR0N9DmYuSghoje4Q1IWJ8nqVoKRxlNCCR6VYVkPtp24oKdkHCs8wYF7wto"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="lg" variant="outline" className="px-8 py-4 border-[#FCAF17] text-[#FCAF17] hover:bg-[#FCAF17] hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                      Support Our Ministry
                    </Button>
                  </a>
                </div>
              </div>
              
              {/* Clean Logo Display - Right Side */}
              <div className="flex-shrink-0">
                <img 
                  src="/images/dothan logo.PNG" 
                  alt="Dothan Logo" 
                  className="w-[450px] h-[450px] max-w-full object-contain"
                />
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Since 2015
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 pt-8 border-t border-gray-200 mb-0">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <h4 className="text-lg font-semibold text-primary mb-2">Trusted by Ethopian Evangelical Church Council</h4>
                  <img 
                    src="https://www.ecgbc.org/_next/image?url=%2Ficon.jpg&w=640&q=75" 
                    alt="ECBC Logo" 
                    className="h-12 w-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* Digital Library Section */}
      <section id="library" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-primary font-medium text-sm uppercase tracking-wider">Use Our Digital Library</span>
              </div>
            </div>
            
            {/* Book Carousel - 4 Cards Grid */}
            <div className="relative mb-16">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {getVisibleBooks().map((book) => (
                  <Card key={book.id} className="hover:shadow-lg transition-shadow border border-gray-200 bg-white">
                    <CardHeader className="p-0">
                      <div className="relative h-40 bg-gray-100 rounded-t-lg flex items-center justify-center">
                        <Book className="h-8 w-6 text-gray-600" />
                        <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded text-xs font-medium">
                          {book.category}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <CardTitle className="text-lg mb-2 font-semibold text-primary">
                        {book.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mb-2 font-medium">{book.author}</p>
                      <CardDescription className="text-muted-foreground text-sm leading-relaxed mb-4">
                        {book.description}
                      </CardDescription>
                      <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                        <span>{book.pages} pages</span>
                      </div>
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                        Read Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Navigation Arrows - Outside Cards */}
              <button
                onClick={prevBooks}
                className="absolute -left-16 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 z-10"
                aria-label="Previous books"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextBooks}
                className="absolute -right-16 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transition-all duration-300 z-10"
                aria-label="Next books"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Simple CTA Section */}
            <div className="flex gap-4 justify-center">
              <Link to="/library">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Browse All Books
                </Button>
              </Link>
              <Button size="lg" className="bg-[#FCAF17] text-white hover:bg-yellow-600">
                Access Library
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Contact Us Section */}
      <section id="contact" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl font-serif text-primary mb-6 tracking-wide text-center">Contact Us</h2>
            <p className="text-base text-muted-foreground mb-8 text-center">
              Have questions? Send us a message and we'll respond soon.
            </p>
            
            <Card className="bg-white border border-gray-200">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Your Message"
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      
      <FloatingNavigation />
      <Footer />
    </div>
  );
};

export default Index;
