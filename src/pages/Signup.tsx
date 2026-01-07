import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation } from '@/components/Navigation';
import { useToast } from '@/hooks/use-toast';

const Signup = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setPhone_number] = useState('');
  const [password, setPassword] = useState('');
  const { signup, user, isLoading, isStudent, isTeacher, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password, name, phone_number);
      toast({ title: t('auth:welcome'), description: t('auth:accountCreatedSuccessfully') });
      navigate('/courses');
    } catch (error) {
      toast({ title: t('common:error'), description: t('auth:failedToCreateAccount'), variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('auth:createAccount')}</CardTitle>
            <CardDescription>{t('auth:signUpToStart')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('auth:fullName')}</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
                  <div className="space-y-2">
                <Label htmlFor="phone_number">{t('auth:phoneNumber')}</Label>
                <Input
                  id="phone_number"
                  type="text"
                  placeholder="+251"
                  value={phone_number}
                  onChange={(e) => setPhone_number(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth:emailAddress')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('auth:password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {t('auth:signup')}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t('auth:alreadyHaveAccount')}{' '}
                <Link to="/login" className="text-primary hover:underline">
                  {t('auth:login')}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
