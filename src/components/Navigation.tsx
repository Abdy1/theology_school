import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { UserDropdown } from '@/components/UserDropdown';
import { BookOpen, Library, ChevronDown, Users, Award, Handshake, Cross, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export const Navigation = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLandingPage = location.pathname === '/';
  const isAboutPage = location.pathname.startsWith('/about');
  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup';
  const isStudentDashboard = location.pathname === '/student';
  const showAboutDropdown = isLandingPage || isAboutPage;
  const showHomeLink = !isLandingPage; // Show on all pages except homepage
  const showLibrary = !isLoginPage; // Show on all pages except login/register

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const dropdownButton = target.closest('[data-dropdown="about"]');
      const dropdownMenu = target.closest('[data-dropdown-menu="about"]');
      
      if (isAboutDropdownOpen && !dropdownButton && !dropdownMenu) {
        setIsAboutDropdownOpen(false);
      }
    };

    // Only add event listener in browser environment
    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAboutDropdownOpen]);

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur-sm">
      <div className="w-full flex items-center justify-between px-4 py-4 md:container md:mx-auto">
        <span className="text-2xl font-bold text-primary">Dothan Ministry</span>
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {user ? (
              <>
                {/* Hide library and my books for admin and instructor users */}
                {user.role !== 'admin' && user.role !== 'teacher' && (
                  <>
                    {showLibrary && (
                      <Link to="/library" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                        <Library className="h-4 w-4" />
                        {t('navigation:library')}
                      </Link>
                    )}
                    <Link to="/my-library" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {t('navigation:myBooks')}
                    </Link>
                  </>
                )}
                
                {/* About Dropdown - Available on homepage and About pages only */}
                {showAboutDropdown && (
                  <div className="relative">
                    <button
                      data-dropdown="about"
                      onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                      className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {t('navigation:about')}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isAboutDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isAboutDropdownOpen && (
                      <div data-dropdown-menu="about" className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <Link
                            to="/about"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <Users className="h-4 w-4" />
                            Who We Are
                          </Link>
                          <Link
                            to="/about/statement-of-faith"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <Cross className="h-4 w-4" />
                            Statement of Faith
                          </Link>
                          <Link
                            to="/about/faculty"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <Award className="h-4 w-4" />
                            Faculty and Staff
                          </Link>
                          <Link
                            to="/about/accreditation"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <Award className="h-4 w-4" />
                            Accreditation
                          </Link>
                          <Link
                            to="/about/programs"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <BookOpen className="h-4 w-4" />
                            Programs
                          </Link>
                          <Link
                            to="/about/partners"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <Handshake className="h-4 w-4" />
                            Our Partners
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <UserDropdown />
              </>
            ) : (
              <>
                {/* Home Link - Show on all pages except homepage */}
                {showHomeLink && (
                  <Link to="/" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                    {t('navigation:home')}
                  </Link>
                )}
                
                {showLibrary && (
                  <Link to="/library" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <Library className="h-4 w-4" />
                    {t('navigation:library')}
                  </Link>
                )}
                
                {/* About Dropdown - Available on homepage and About pages only */}
                {showAboutDropdown && (
                  <div className="relative">
                    <button
                      data-dropdown="about"
                      onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                      className="text-foreground hover:text-primary transition-colors flex items-center gap-1"
                    >
                      {t('navigation:about')}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isAboutDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isAboutDropdownOpen && (
                      <div data-dropdown-menu="about" className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        <div className="py-1">
                          <Link
                            to="/about"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <Users className="h-4 w-4" />
                            Who We Are
                          </Link>
                          <Link
                            to="/about/statement-of-faith"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <Cross className="h-4 w-4" />
                            Statement of Faith
                          </Link>
                          <Link
                            to="/about/faculty"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <Award className="h-4 w-4" />
                            Faculty and Staff
                          </Link>
                          <Link
                            to="/about/accreditation"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <Award className="h-4 w-4" />
                            Accreditation
                          </Link>
                          <Link
                            to="/about/programs"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <BookOpen className="h-4 w-4" />
                            Programs
                          </Link>
                          <Link
                            to="/about/partners"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                            onClick={() => setIsAboutDropdownOpen(false)}
                          >
                            <Handshake className="h-4 w-4" />
                            Our Partners
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <Link to="/login">
                  <Button variant="outline">{t('navigation:login')}</Button>
                </Link>
                <Link to="/signup">
                  <Button>{t('navigation:getStarted')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-card">
          <div className="w-full px-4 py-4 space-y-4">
            {user ? (
              <>
                {/* Hide library and my books for admin and instructor users */}
                {user.role !== 'admin' && user.role !== 'teacher' && (
                  <>
                    {showLibrary && (
                      <Link 
                        to="/library" 
                        className="text-foreground hover:text-primary transition-colors flex items-center gap-2 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Library className="h-4 w-4" />
                        {t('navigation:library')}
                      </Link>
                    )}
                    <Link 
                      to="/my-library" 
                      className="text-foreground hover:text-primary transition-colors flex items-center gap-2 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BookOpen className="h-4 w-4" />
                      {t('navigation:myBooks')}
                    </Link>
                  </>
                )}
                
                {/* About Dropdown - Available on homepage and About pages only */}
                {showAboutDropdown && (
                  <div className="space-y-2">
                    <button
                      data-dropdown="about"
                      onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                      className="text-foreground hover:text-primary transition-colors flex items-center gap-1 py-2"
                    >
                      {t('navigation:about')}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isAboutDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isAboutDropdownOpen && (
                      <div data-dropdown-menu="about" className="ml-4 space-y-2">
                        <Link
                          to="/about"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Users className="h-4 w-4" />
                          Who We Are
                        </Link>
                        <Link
                          to="/about/statement-of-faith"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Cross className="h-4 w-4" />
                          Statement of Faith
                        </Link>
                        <Link
                          to="/about/faculty"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Award className="h-4 w-4" />
                          Faculty and Staff
                        </Link>
                        <Link
                          to="/about/accreditation"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Award className="h-4 w-4" />
                          Accreditation
                        </Link>
                        <Link
                          to="/about/programs"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <BookOpen className="h-4 w-4" />
                          Programs
                        </Link>
                        <Link
                          to="/about/partners"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Handshake className="h-4 w-4" />
                          Our Partners
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                <div onClick={() => setIsMobileMenuOpen(false)}>
                  <UserDropdown />
                </div>
              </>
            ) : (
              <>
                {/* Home Link - Show on all pages except homepage */}
                {showHomeLink && (
                  <Link 
                    to="/" 
                    className="text-foreground hover:text-primary transition-colors flex items-center gap-2 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('navigation:home')}
                  </Link>
                )}
                
                {showLibrary && (
                  <Link 
                    to="/library" 
                    className="text-foreground hover:text-primary transition-colors flex items-center gap-2 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Library className="h-4 w-4" />
                    {t('navigation:library')}
                  </Link>
                )}
                
                {/* About Dropdown - Available on homepage and About pages only */}
                {showAboutDropdown && (
                  <div className="space-y-2">
                    <button
                      data-dropdown="about"
                      onClick={() => setIsAboutDropdownOpen(!isAboutDropdownOpen)}
                      className="text-foreground hover:text-primary transition-colors flex items-center gap-1 py-2"
                    >
                      {t('navigation:about')}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isAboutDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isAboutDropdownOpen && (
                      <div data-dropdown-menu="about" className="ml-4 space-y-2">
                        <Link
                          to="/about"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Users className="h-4 w-4" />
                          Who We Are
                        </Link>
                        <Link
                          to="/about/statement-of-faith"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Cross className="h-4 w-4" />
                          Statement of Faith
                        </Link>
                        <Link
                          to="/about/faculty"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Award className="h-4 w-4" />
                          Faculty and Staff
                        </Link>
                        <Link
                          to="/about/accreditation"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Award className="h-4 w-4" />
                          Accreditation
                        </Link>
                        <Link
                          to="/about/programs"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <BookOpen className="h-4 w-4" />
                          Programs
                        </Link>
                        <Link
                          to="/about/partners"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary transition-colors"
                          onClick={() => {
                            setIsAboutDropdownOpen(false);
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Handshake className="h-4 w-4" />
                          Our Partners
                        </Link>
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-2">
                  <Link 
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button variant="outline" className="w-full">{t('navigation:login')}</Button>
                  </Link>
                  <Link 
                    to="/signup"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full">{t('navigation:getStarted')}</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
