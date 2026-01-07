import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

export const Breadcrumb = () => {
  const { t } = useTranslation();
  const { user, isStudent, isTeacher, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getDashboardPath = () => {
    if (isStudent) return '/student';
    if (isTeacher) return '/instructor';
    if (isAdmin) return '/admin';
    return '/';
  };

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Link 
          to={getDashboardPath()} 
          className="hover:text-primary transition-colors"
        >
          {t('navigation:dashboard')}
        </Link>
        
        {/* Show breadcrumb based on current path */}
        {location.pathname.includes('/courses/') && !location.pathname.includes('/learn') && (
          <>
            <span>/</span>
            <Link to="/courses" className="hover:text-primary transition-colors">
              {t('navigation:courses')}
            </Link>
          </>
        )}
        
        {location.pathname.includes('/my-courses') && (
          <>
            <span>/</span>
            <span className="text-foreground">{t('navigation:myCourses')}</span>
          </>
        )}
        
        {location.pathname.includes('/learn') && (
          <>
            <span>/</span>
            <Link to="/my-courses" className="hover:text-primary transition-colors">
              {t('navigation:myCourses')}
            </Link>
            <span>/</span>
            <span className="text-foreground">{t('navigation:learning')}</span>
          </>
        )}
        
        {location.pathname.includes('/quiz') && (
          <>
            <span>/</span>
            <Link to="/my-courses" className="hover:text-primary transition-colors">
              {t('navigation:myCourses')}
            </Link>
            <span>/</span>
            <span className="text-foreground">{t('navigation:quiz')}</span>
          </>
        )}
        
        {location.pathname.includes('/library') && !location.pathname.includes('/my-library') && (
          <>
            <span>/</span>
            <span className="text-foreground">{t('navigation:library')}</span>
          </>
        )}
        
        {location.pathname.includes('/my-library') && (
          <>
            <span>/</span>
            <span className="text-foreground">{t('navigation:myBooks')}</span>
          </>
        )}
        
        {location.pathname.includes('/library/book/') && location.pathname.includes('/read') && (
          <>
            <span>/</span>
            <Link to="/my-library" className="hover:text-primary transition-colors">
              {t('navigation:myBooks')}
            </Link>
            <span>/</span>
            <span className="text-foreground">{t('navigation:reading')}</span>
          </>
        )}
      </div>
    </div>
  );
};
