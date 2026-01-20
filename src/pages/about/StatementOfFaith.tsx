import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cross, BookOpen, Church, Heart, Users, Star, Shield, Sparkles } from 'lucide-react';

const StatementOfFaith = () => {
  const { t } = useTranslation();

  const beliefs = [
    {
      title: "God",
      content: "We believe in the eternal God, revealed in three persons — the Father, the Son, and the Holy Spirit — one true and living God.",
      icon: <Star className="h-6 w-6" />
    },
    {
      title: "Creation and Sovereignty",
      content: "We believe God created the world, sustains and governs all creation, and will judge the world in love, grace, and justice.",
      icon: <Sparkles className="h-6 w-6" />
    },
    {
      title: "Scripture",
      content: "We believe the Holy Scripture is divinely inspired, authoritative, and infallible. It is the Word of God, the source of life, instruction, and freedom from guilt.",
      icon: <BookOpen className="h-6 w-6" />
    },
    {
      title: "Humanity",
      content: "We believe humanity was created in the image of God, originally pure and in fellowship with Him, but separated through sin. Because of this, mankind is in need of a Savior, worthy of God's love and care.",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Jesus Christ",
      content: "We believe Jesus Christ is the true representation of God. Becoming fully human yet without sin, He offered Himself as a perfect sacrifice for sin, reconciling humanity to God.",
      icon: <Heart className="h-6 w-6" />
    },
    {
      title: "Salvation",
      content: "We believe forgiveness of sins and mercy from the Father come only through the work of Jesus Christ on the cross, through His name and His blood.",
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: "The Only Way",
      content: "We believe Jesus Christ, the Son of God, is the only Savior and the only way of righteousness.",
      icon: <Heart className="h-6 w-6" />
    },
    {
      title: "The Holy Spirit",
      content: "We believe the Holy Spirit convicts the world of sin and righteousness until people receive new birth in Christ Jesus. He comforts believers in trials and reminds them of their eternal hope.",
      icon: <Sparkles className="h-6 w-6" />
    },
    {
      title: "The Church",
      content: "We believe the Church is the body of Christ, both universal and local. Believers are given the ministry of priesthood and spiritual gifts by the Holy Spirit, to worship God and proclaim the Gospel. Through this, love and justice are upheld.",
      icon: <Church className="h-6 w-6" />
    },
    {
      title: "The Second Coming",
      content: "We believe Jesus Christ will return again. Those who believe in Him will inherit eternal life, while those who reject Him will face eternal judgment. In the end, there will be a new heaven and a new earth where believers will dwell forever.",
      icon: <Star className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full mb-6">
              <Cross className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Statement of Faith</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Statement of Faith – Dothan Ministry
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We affirm the following foundational truths that guide our ministry and shape our understanding of God's revelation to humanity.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {[
                {
                  title: "God",
                  content: "We believe in the eternal God, revealed in three persons — the Father, the Son, and the Holy Spirit — one true and living God."
                },
                {
                  title: "Creation and Sovereignty",
                  content: "We believe God created the world, sustains and governs all creation, and will judge the world in love, grace, and justice."
                },
                {
                  title: "Scripture",
                  content: "We believe the Holy Scripture is divinely inspired, authoritative, and infallible. It is the Word of God, the source of life, instruction, and freedom from guilt."
                },
                {
                  title: "Humanity",
                  content: "We believe humanity was created in the image of God, originally pure and in fellowship with Him, but separated through sin. Because of this, mankind is in need of a Savior, worthy of God's love and care."
                },
                {
                  title: "Jesus Christ",
                  content: "We believe Jesus Christ is the true representation of God. Becoming fully human yet without sin, He offered Himself as a perfect sacrifice for sin, reconciling humanity to God."
                },
                {
                  title: "Salvation",
                  content: "We believe forgiveness of sins and mercy from the Father come only through the work of Jesus Christ on the cross, through His name and His blood."
                },
                {
                  title: "The Only Way",
                  content: "We believe Jesus Christ, the Son of God, is the only Savior and the only way of righteousness."
                },
                {
                  title: "The Holy Spirit",
                  content: "We believe the Holy Spirit convicts the world of sin and righteousness until people receive new birth in Christ Jesus. He comforts believers in trials and reminds them of their eternal hope."
                },
                {
                  title: "The Church",
                  content: "We believe the Church is the body of Christ, both universal and local. Believers are given the ministry of priesthood and spiritual gifts by the Holy Spirit, to worship God and proclaim the Gospel. Through this, love and justice are upheld."
                },
                {
                  title: "The Second Coming",
                  content: "We believe Jesus Christ will return again. Those who believe in Him will inherit eternal life, while those who reject Him will face eternal judgment. In the end, there will be a new heaven and a new earth where believers will dwell forever."
                }
              ].map((item, index) => (
                <Card key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">{index + 1}</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl font-semibold text-primary mb-3">{item.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground leading-relaxed">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StatementOfFaith;
