import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, Search } from 'lucide-react';

const StudentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary">{t('dashboard:studentDashboard')}</h1>
          <p className="text-muted-foreground">{t('dashboard:manageCoursesAndAchievements')}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/my-courses')}
          >
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary" />
              <CardTitle>{t('dashboard:myCourses')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('dashboard:viewEnrolledCourses')}</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/certificates')}
          >
            <CardHeader>
              <Award className="h-8 w-8 text-primary" />
              <CardTitle>{t('dashboard:certificates')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('dashboard:viewEarnedCertificates')}</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/courses')}
          >
            <CardHeader>
              <Search className="h-8 w-8 text-primary" />
              <CardTitle>{t('dashboard:browseCourses')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t('dashboard:exploreAllCourses')}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
