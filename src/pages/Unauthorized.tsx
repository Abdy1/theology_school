import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md">
        <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. Please contact an administrator if you think this is an error.
          </p>
        </div>
        <div className="space-y-3">
          <Link to="/courses">
            <Button className="w-full">Back to Courses</Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full">Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
