import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, MapPin } from 'lucide-react';

const WhoWeAre = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full mb-6">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Who We Are</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Dothan Ministry
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our Motto: "To know faith, truth, and identity!"
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            
            {/* Ministry History */}
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">
                Dothan Ministry History
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                By the will of God, Dothan Ministry has, over the past two years, reached hundreds of ministers, church leaders, and church planters across various churches through specialized training in church planting. This ongoing work continues to equip leaders and strengthen ministries.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Established as a dedicated institution for education and training, Dothan Ministry is envisioned to support the effort of raising disciples who truly know their faith, truth, and identity.
              </p>
            </div>

            {/* Our Reach */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="text-center mb-6">
                  <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                  <h3 className="text-xl font-semibold text-primary">Our Reach</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">Hundreds</div>
                    <div className="text-sm text-muted-foreground">Ministers Trained</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">Various</div>
                    <div className="text-sm text-muted-foreground">Churches Reached</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">2+</div>
                    <div className="text-sm text-muted-foreground">Years of Ministry</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-1">Specialized</div>
                    <div className="text-sm text-muted-foreground">Training Programs</div>
                  </div>
                </div>
              </div>
            </div>

            {/* We Serve Believers */}
            <div>
              <h3 className="text-2xl font-semibold text-primary mb-6">We serve believers who:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Confess faith in Jesus Christ",
                  "Are baptized in the name of the Father, the Son, and the Holy Spirit",
                  "Believe that Jesus Christ is the only way to the Father",
                  "Affirm that the Holy Spirit proceeds from the Father and the Son",
                  "Accept the divinity of Christ and the supreme authority of Scripture",
                  "Embrace fellowship and unity under one church without distinction"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200">
                    <BookOpen className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed mt-6">
                With thorough preparation and experience, Dothan Ministry is committed to training and equipping believers to serve faithfully.
              </p>
            </div>
            
            {/* Vision Section */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">
                Our Vision
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To support the church in making disciples through education and training, helping believers know their faith, truth, and identity. By offering both short‑term and long‑term training programs, Dothan Ministry seeks to reach the church wherever it is found, equipping and strengthening believers for effective service.
              </p>
            </div>

            {/* Mission Section */}
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                To build a community of believers who truly know their faith, truth, and identity. We accomplish this by preparing teaching modules, translating resources, training trainers, and making education and training accessible to churches everywhere.
              </p>
            </div>

            {/* Core Values Section */}
            <div>
              <h2 className="text-3xl md:text-4xl font-serif text-primary mb-6">
                Core Values
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                The following principles guide the work of Dothan Ministry:
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Faithfulness",
                  "Pursuit of knowledge above all else",
                  "Commitment to learning",
                  "Dedication to teaching",
                  "Speaking the truth in love",
                  "Demonstrating Christ in daily life",
                  "Understanding and explaining identity rightly",
                  "Perseverance",
                  "Beginning well and finishing faithfully"
                ].map((value, index) => (
                  <div key={index} className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-foreground font-medium">{value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WhoWeAre;
