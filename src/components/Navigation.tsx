import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { UserDropdown } from '@/components/UserDropdown';
import { BookOpen, Library } from 'lucide-react';

export const Navigation = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();

  const isLandingPage = location.pathname === '/';

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
       
          {/* <BookOpen className="h-8 w-8 text-primary" /> */}
          <span className="text-2xl font-bold text-primary">Dothan</span>
    
        
        <div className="flex items-center space-x-4">
          <LanguageSwitcher />
          
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                {/* Hide library and my books for admin users */}
                {user.role !== 'admin' && (
                  <>
                    <Link to="/library" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                      <Library className="h-4 w-4" />
                      {t('navigation:library')}
                    </Link>
                    <Link to="/my-library" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {t('navigation:myBooks')}
                    </Link>
                  </>
                )}
                {isLandingPage && (
                  <>
                    <Link to="/courses" className="text-foreground hover:text-primary transition-colors">
                      {t('navigation:courses')}
                    </Link>
                    <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
                      {t('navigation:contact')}
                    </Link>
                  </>
                )}
                <UserDropdown />
              </>
            ) : (
              <>
                <Link to="/library" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                  <Library className="h-4 w-4" />
                  {t('navigation:library')}
                </Link>
                {isLandingPage && (
                  <>
                    <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
                      {t('navigation:contact')}
                    </Link>
                  </>
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
    </nav>
  );
};
