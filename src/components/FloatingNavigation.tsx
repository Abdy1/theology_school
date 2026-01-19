import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, BookOpen, Users, Library, Mail, ChevronUp, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export const FloatingNavigation = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    {
      id: 'hero',
      label: 'Home',
      icon: <Home className="h-4 w-4" />
    },
    {
      id: 'programs',
      label: 'Programs',
      icon: <BookOpen className="h-4 w-4" />
    },
    {
      id: 'about',
      label: 'About',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: 'library',
      label: 'Library',
      icon: <Library className="h-4 w-4" />
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: <Mail className="h-4 w-4" />
    },
    {
      id: 'register',
      label: 'Register',
      icon: <User className="h-4 w-4" />
    },
    {
      id: 'login',
      label: 'Login',
      icon: <LogIn className="h-4 w-4" />
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      // Show/hide floating nav based on scroll position
      setIsVisible(window.scrollY > 300);

      // Determine active section based on scroll position
      const sections = navItems.filter(item => !['login', 'register'].includes(item.id)).map(item => ({
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
    handleScroll(); // Initial check

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

  const handleNavigation = (item: NavItem) => {
    if (item.id === 'login') {
      navigate('/login');
    } else if (item.id === 'register') {
      navigate('/signup');
    } else {
      scrollToSection(item.id);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 flex flex-col items-center">
      {/* Navigation Items */}
      <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 p-1 flex flex-col">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={activeSection === item.id ? "default" : "ghost"}
            size="sm"
            onClick={() => handleNavigation(item)}
            className={`w-8 h-8 p-0 rounded-full mb-1 last:mb-0 ${
              activeSection === item.id && !['login', 'register'].includes(item.id)
                ? 'bg-primary text-primary-foreground scale-110' 
                : item.id === 'register'
                ? 'text-[#FCAF17] hover:text-[#FCAF17] hover:bg-gray-100 hover:scale-105'
                : 'text-gray-600 hover:text-primary hover:bg-gray-100 hover:scale-105'
            } transition-all duration-200`}
            title={item.label}
          >
            {item.icon}
          </Button>
        ))}
      </div>

      {/* Scroll to Top Button */}
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
  );
};
