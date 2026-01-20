import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Award, BookOpen, Target, ChevronRight, Heart, Globe, Lightbulb, MapPin, Church, Cross, Home, ChevronUp, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AboutUs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('vision');
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);

  const aboutNavItems = [
    { id: 'hero', label: 'Top', icon: <Home className="h-4 w-4" /> },
    { id: 'who-we-are', label: 'Who We Are', icon: <Users className="h-4 w-4" /> },
    { id: 'statement-of-faith', label: 'Statement of Faith', icon: <Cross className="h-4 w-4" /> },
    { id: 'the-name-dothan', label: 'The Name Dothan', icon: <Church className="h-4 w-4" /> },
    { id: 'vision-mission-values', label: 'Vision & Mission', icon: <Target className="h-4 w-4" /> },
    { id: 'register', label: 'Register', icon: <User className="h-4 w-4" /> },
    { id: 'login', label: 'Login', icon: <LogIn className="h-4 w-4" /> }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);

      const sections = aboutNavItems.filter(item => !['login', 'register'].includes(item.id)).map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
      })).filter(section => section.element);

      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section.element) {
          const { offsetTop, offsetHeight } = section.element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigation = (itemId: string) => {
    if (itemId === 'login') {
      navigate('/login');
    } else if (itemId === 'register') {
      navigate('/signup');
    } else {
      scrollToSection(itemId);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Custom About Page Floating Navigation */}
      {isVisible && (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col items-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 p-1 flex flex-col">
            {aboutNavItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                size="sm"
                onClick={() => handleNavigation(item.id)}
                className={`w-8 h-8 p-0 rounded-full mb-1 last:mb-0 ${
                  activeSection === item.id && !['login', 'register'].includes(item.id)
                    ? 'bg-primary text-primary-foreground scale-110' 
                    : item.id === 'register'
                    ? 'text-[#FCAF17] hover:text-[#FCAF17] hover:bg-gray-100 hover:scale-105'
                    : item.id === 'login'
                    ? 'text-gray-600 hover:text-primary hover:bg-gray-100 hover:scale-105'
                    : 'text-gray-600 hover:text-primary hover:bg-gray-100 hover:scale-105'
                } transition-all duration-200`}
                title={item.label}
              >
                {item.icon}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToTop}
            className="w-8 h-8 p-0 rounded-full bg-white/90 backdrop-blur-sm border-gray-200 hover:bg-gray-100 hover:scale-105 transition-all duration-200 mt-2"
            title="Back to top"
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {/* Hero Section */}
      <section id="hero" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Section Badge */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-primary font-medium text-sm uppercase tracking-wider">About Us</span>
              </div>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl font-serif text-primary text-center mb-4">
              Dothan Ministry
            </h1>
            
            {/* Motto */}
            <p className="text-lg text-primary font-medium text-center mb-12 italic">
              Our Motto: "To know faith, truth, and identity!"
            </p>
            
            {/* Trust Badge */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">Approved by Ethiopian Evangelical Church Council</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-20">
            
            {/* Who We Are */}
            <div id="who-we-are">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium text-sm uppercase tracking-wider">Who We Are</span>
              </div>
              
              <div className="grid lg:grid-cols-2 gap-12 items-start">
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">
                    Dothan Ministry History
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    By the will of God, Dothan Ministry has, over the past two years, reached hundreds of ministers, church leaders, and church planters across various churches through specialized training in church planting. This ongoing work continues to equip leaders and strengthen ministries.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Established as a dedicated institution for education and training, Dothan Ministry is envisioned to support the effort of raising disciples who truly know their faith, truth, and identity.
                  </p>
                </div>
                <div className="relative">
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
                    <div className="text-center mb-6">
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                      <h3 className="text-xl font-semibold text-primary">Our Reach</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">Hundreds</div>
                        <div className="text-sm text-muted-foreground">Ministers Trained</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">Various</div>
                        <div className="text-sm text-muted-foreground">Churches Reached</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">2+</div>
                        <div className="text-sm text-muted-foreground">Years of Ministry</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary mb-1">Specialized</div>
                        <div className="text-sm text-muted-foreground">Training Programs</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* We Serve Believers */}
              <div className="mt-12">
                <h3 className="text-2xl font-semibold text-primary mb-6">We serve believers who:</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Confess faith in Jesus Christ",
                    "Are baptized in the name of the Father, the Son, and the Holy Spirit",
                    "Believe that Jesus Christ is the only way to the Father",
                    "Affirm that the Holy Spirit proceeds from the Father and the Son",
                    "Accept the divinity of Christ and the supreme authority of Scripture",
                    "Embrace fellowship and unity under one church without distinction"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                      <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed mt-6">
                  With thorough preparation and experience, Dothan Ministry is committed to training and equipping believers to serve faithfully.
                </p>
              </div>
            </div>

            {/* Statement of Faith */}
            <div id="statement-of-faith">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Cross className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium text-sm uppercase tracking-wider">Statement of Faith</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif text-primary mb-8">
                Statement of Faith – Dothan Ministry
              </h2>
              <p className="text-lg text-muted-foreground mb-8">We affirm the following truths:</p>
              
              <div className="space-y-8">
                {[
                  {
                    title: "God",
                    content: "We believe in the eternal God, revealed in three persons — the Father, the Son, and the Holy Spirit — one true and living God."
                  },
                  {
                    title: "Creation and Sovereignty",
                    content: "We believe God created the world, sustains and governs all creation, and will judge the world in love, grace, and justice."
                  },
                  {
                    title: "Scripture",
                    content: "We believe the Holy Scripture is divinely inspired, authoritative, and infallible. It is the Word of God, the source of life, instruction, and freedom from guilt."
                  },
                  {
                    title: "Humanity",
                    content: "We believe humanity was created in the image of God, originally pure and in fellowship with Him, but separated through sin. Because of this, mankind is in need of a Savior, worthy of God's love and care."
                  },
                  {
                    title: "Jesus Christ",
                    content: "We believe Jesus Christ is the true representation of God. Becoming fully human yet without sin, He offered Himself as a perfect sacrifice for sin, reconciling humanity to God."
                  },
                  {
                    title: "Salvation",
                    content: "We believe forgiveness of sins and mercy from the Father come only through the work of Jesus Christ on the cross, through His name and His blood."
                  },
                  {
                    title: "The Only Way",
                    content: "We believe Jesus Christ, the Son of God, is the only Savior and the only way of righteousness."
                  },
                  {
                    title: "The Holy Spirit",
                    content: "We believe the Holy Spirit convicts the world of sin and righteousness until people receive new birth in Christ Jesus. He comforts believers in trials and reminds them of their eternal hope."
                  },
                  {
                    title: "The Church",
                    content: "We believe the Church is the body of Christ, both universal and local. Believers are given the ministry of priesthood and spiritual gifts by the Holy Spirit, to worship God and proclaim the Gospel. Through this, love and justice are upheld."
                  },
                  {
                    title: "The Second Coming",
                    content: "We believe Jesus Christ will return again. Those who believe in Him will inherit eternal life, while those who reject Him will face eternal judgment. In the end, there will be a new heaven and a new earth where believers will dwell forever."
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-primary mb-3">{item.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{item.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* The Name Dothan */}
            <div id="the-name-dothan">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Church className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium text-sm uppercase tracking-wider">The Name "Dothan Ministry"</span>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">
                  The Name "Dothan Ministry"
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  The name Dothan originates from 2 Kings Chapter 6, where the prophet Elisha lived. It was in this place that Elisha, through the Spirit, revealed the plans of the king of Syria and saved the king of Israel.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  Dothan is also where the eyes of Elisha's servant were opened to witness the mighty strength of God against their enemies. Here, the Syrian army was struck with blindness and delivered into Israel's hands, and it became a place where wisdom and love brought peace between Israel and Syria.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Just as God used Dothan to expose evil counsel and rescue Israel's king, Dothan Ministry exists today to strengthen the church. Rooted in the authority of God's Word, and supported by study and research, we provide comprehensive training to equip the church in its mission of raising disciples who truly know their faith, truth, and identity.
                </p>
              </div>
            </div>

            {/* Vision, Mission, Values */}
            <div id="vision-mission-values">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium text-sm uppercase tracking-wider">Vision, Mission, and Values</span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-serif text-primary mb-8">
                Vision, Mission, and Values – Dothan Ministry
              </h2>
              
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-8">
                <div className="flex flex-wrap gap-1">
                  {['vision', 'mission', 'values'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                        activeTab === tab
                          ? 'text-primary border-primary bg-primary/5'
                          : 'text-muted-foreground border-transparent hover:text-primary hover:bg-gray-50'
                      }`}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-lg border border-gray-200 p-8">
                {activeTab === 'vision' && (
                  <div>
                    <h3 className="text-2xl font-semibold text-primary mb-4">Vision</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      To support the church in making disciples through education and training, helping believers know their faith, truth, and identity. By offering both short-term and long-term training programs, Dothan Ministry seeks to reach the church wherever it is found, equipping and strengthening believers for effective service.
                    </p>
                  </div>
                )}

                {activeTab === 'mission' && (
                  <div>
                    <h3 className="text-2xl font-semibold text-primary mb-4">Mission</h3>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      To build a community of believers who truly know their faith, truth, and identity. We accomplish this by preparing teaching modules, translating resources, training trainers, and making education and training accessible to churches everywhere.
                    </p>
                  </div>
                )}

                {activeTab === 'values' && (
                  <div>
                    <h3 className="text-2xl font-semibold text-primary mb-4">Core Values</h3>
                    <p className="text-lg text-muted-foreground mb-6">The following principles guide the work of Dothan Ministry:</p>
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        "Faithfulness",
                        "Pursuit of knowledge above all else",
                        "Commitment to learning",
                        "Dedication to teaching",
                        "Speaking the truth in love",
                        "Demonstrating Christ in daily life",
                        "Understanding and explaining identity rightly",
                        "Perseverance",
                        "Beginning well and finishing faithfully"
                      ].map((value, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-muted-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
