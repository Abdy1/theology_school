import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, LogOut, Library, User } from 'lucide-react';

export const Navigation = () => {
  const { user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isLandingPage = location.pathname === '/';

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-primary">Dothan</span>
        </Link>
        
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/library" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Library className="h-4 w-4" />
                Library
              </Link>
              <Link to="/my-library" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                <User className="h-4 w-4" />
                My Books
              </Link>
              {isLandingPage && (
                <>
                  <Link to="/courses" className="text-foreground hover:text-primary transition-colors">
                    Courses
                  </Link>
                  <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                </>
              )}
              <span className="text-muted-foreground">{user.name}</span>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/library" className="text-foreground hover:text-primary transition-colors flex items-center gap-2">
                <Library className="h-4 w-4" />
                Library
              </Link>
              {isLandingPage && (
                <>
                  <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                </>
              )}
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/signup">
                <Button>Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
