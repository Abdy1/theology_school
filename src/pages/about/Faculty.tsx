import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Award, Users, Target, Heart } from 'lucide-react';

const Faculty = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full mb-6">
              <Award className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Faculty and Staff</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Faculty and Staff
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Meet our dedicated team of educators and ministry leaders committed to excellence in biblical education and spiritual formation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Founder & President */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-serif text-primary mb-8">Leadership</h2>
            
            <Card className="p-8 border-primary/20 bg-card">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Image */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-48 h-64 md:w-64 md:h-80 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg overflow-hidden border-2 border-primary/20 shadow-lg">
                      <img 
                        src="/images/founder.jpg" 
                        alt="Milkyas Lelago - Founder & President"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="absolute -bottom-3 -right-3 md:-bottom-4 md:-right-4 w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center">
                      <Award className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Bio Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    Founder & President – Milkyas Lelago (Phd)
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Milkyas Lelago is the Founder and President of Dothan Ministry, an organization committed to reaching Ethiopia with the gospel of Jesus Christ by equipping church ministers and leaders.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Through its training programs, Dothan Ministry has already impacted more than two thousand church leaders across different regions of the country. Looking ahead, the ministry is dedicated to equipping children's and women's ministers, addressing critical knowledge gaps within Ethiopian churches and strengthening the body of Christ.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Management Team */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-serif text-primary mb-8">Management Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Management Card 1 - EXAMPLE */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <img 
                      src="/images/management1.jpg" 
                      alt="Management Team Member"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Ato Natnael Wakuma</h3>
                <p className="text-sm text-muted-foreground mb-4">General Director</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
  <p className="text-sm text-muted-foreground leading-relaxed">
    MA in Business Administration from Dila University. 
  </p>
</div>
              </Card>

              {/* Management Card 2 */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium">Photo</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Name Here</h3>
                <p className="text-sm text-muted-foreground mb-4">Job Position</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Educational background and qualifications will be displayed here.
                  </p>
                </div>
              </Card>

              {/* Management Card 3 */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium">Photo</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Name Here</h3>
                <p className="text-sm text-muted-foreground mb-4">Job Position</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Educational background and qualifications will be displayed here.
                  </p>
                </div>
              </Card>

              {/* Management Card 4 */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium">Photo</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Name Here</h3>
                <p className="text-sm text-muted-foreground mb-4">Job Position</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Educational background and qualifications will be displayed here.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Teaching Staff */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-serif text-primary mb-8">Teaching Staff</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Teaching Staff Card 1 */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium">Photo</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Name Here</h3>
                <p className="text-sm text-muted-foreground mb-4">Teaching Position</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Educational background and qualifications will be displayed here.
                  </p>
                </div>
              </Card>

              {/* Teaching Staff Card 2 */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium">Photo</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Name Here</h3>
                <p className="text-sm text-muted-foreground mb-4">Teaching Position</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Educational background and qualifications will be displayed here.
                  </p>
                </div>
              </Card>

              {/* Teaching Staff Card 3 */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium">Photo</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Name Here</h3>
                <p className="text-sm text-muted-foreground mb-4">Teaching Position</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Educational background and qualifications will be displayed here.
                  </p>
                </div>
              </Card>

              {/* Teaching Staff Card 4 */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium">Photo</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Name Here</h3>
                <p className="text-sm text-muted-foreground mb-4">Teaching Position</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Educational background and qualifications will be displayed here.
                  </p>
                </div>
              </Card>

              {/* Teaching Staff Card 5 */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium">Photo</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Name Here</h3>
                <p className="text-sm text-muted-foreground mb-4">Teaching Position</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Educational background and qualifications will be displayed here.
                  </p>
                </div>
              </Card>

              {/* Teaching Staff Card 6 */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium">Photo</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Name Here</h3>
                <p className="text-sm text-muted-foreground mb-4">Teaching Position</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Educational background and qualifications will be displayed here.
                  </p>
                </div>
              </Card>

              {/* Teaching Staff Card 7 */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium">Photo</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Name Here</h3>
                <p className="text-sm text-muted-foreground mb-4">Teaching Position</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Educational background and qualifications will be displayed here.
                  </p>
                </div>
              </Card>

              {/* Teaching Staff Card 8 */}
              <Card className="p-8 border-primary/20 bg-card text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mb-6">
                  <div className="w-40 h-48 mx-auto bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 rounded-xl overflow-hidden border-2 border-primary/30 shadow-lg">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xs text-primary font-medium">Photo</p>
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Name Here</h3>
                <p className="text-sm text-muted-foreground mb-4">Teaching Position</p>
                <div className="text-left bg-primary/5 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Educational background and qualifications will be displayed here.
                  </p>
                </div>
              </Card>
            </div>
          </div>

          {/* Additional Faculty Section */}
          <div>
            <h2 className="text-2xl font-semibold text-primary mb-6">Join Our Team</h2>
            <Card className="p-6 border-primary/20 bg-card">
              <p className="text-muted-foreground leading-relaxed">
                We are always looking for qualified educators and ministry leaders who share our vision for biblical education and spiritual formation. If you are passionate about training the next generation of church leaders, we would love to hear from you.
              </p>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Faculty;
