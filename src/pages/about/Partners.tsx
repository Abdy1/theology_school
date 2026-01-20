import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Handshake } from 'lucide-react';

const Partners = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full mb-6">
              <Handshake className="h-5 w-5 text-primary" />
              <span className="text-primary font-medium text-sm uppercase tracking-wider">Our Partners</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our Partners
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Organizations and churches we partner with to advance our mission and expand our reach in biblical education and ministry training.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <p className="text-muted-foreground">
              Coming soon: Information about our partner organizations and collaborative relationships
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Partners;
