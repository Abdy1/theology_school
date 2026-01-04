import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Award, Video } from 'lucide-react';

const Index = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-5">
            {t('index:strengtheningChurch')}
          </h2>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            {t('index:equipYourself')}
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="text-lg">
                {t('index:startLearningToday')}
              </Button>
            </Link>
            <Link to="/courses">
              <Button size="lg" variant="outline" className="text-lg bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                {t('index:browseCourses')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-primary mb-12">
            {t('index:whyChooseDothan')}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <Video className="h-12 w-12 mb-4 text-accent" />
                <CardTitle>{t('index:videoLessons')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('index:videoDescription')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BookOpen className="h-12 w-12 mb-4 text-accent" />
                <CardTitle>{t('index:comprehensiveCurriculum')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('index:curriculumDescription')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-12 w-12 mb-4 text-accent" />
                <CardTitle>{t('index:learnAtYourPace')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('index:paceDescription')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Award className="h-12 w-12 mb-4 text-accent" />
                <CardTitle>{t('index:certificates')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('index:certificatesDescription')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-muted py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-primary mb-6">{t('index:aboutDothan')}</h2>
            <p className="text-lg text-muted-foreground mb-6">
              {t('index:aboutDothanPassage1')}
            </p>
            <p className="text-lg text-muted-foreground">
              {t('index:aboutDothanPassage2')}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center space-y-10">
          <div>
            <h2 className="text-4xl font-bold text-primary mb-6">
              {t('index:readyToBeginJourney')}
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('index:journeyDescription')}
            </p>
            <Link to="/signup">
              <Button size="lg" className="text-lg">
                {t('index:getStartedFree')}
              </Button>
            </Link>
          </div>

          <div className="max-w-2xl mx-auto rounded-2xl border border-accent/40 bg-gradient-to-r from-accent to-secondary text-accent-foreground shadow-lg shadow-accent/40 p-8">
            <h3 className="text-2xl font-semibold mb-3">{t('index:supportDothan')}</h3>
            <p className="mb-6 text-sm md:text-base opacity-90">
              {t('index:supportDescription')}
            </p>
            <a
              href="https://www.globalstudentinc.com/dothan?fbclid=IwAR0N9DmYuSghoje4Q1IWJ8nqVoKRxlNCCR6VYVkPtp24oKdkHCs8wYF7wto"
              target="_blank"
              rel="noreferrer"
            >
              <Button
                size="lg"
                variant="secondary"
                className="text-lg font-semibold px-10 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {t('index:donateToDothan')}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
