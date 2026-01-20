import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Facebook, Instagram, Youtube, Video, Mail, Phone, MapPin, Send } from 'lucide-react';

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Support Dothan Ministry CTA */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4">{t('index:supportDothanMinistry')}</h3>
            <p className="text-sm opacity-90 mb-4 leading-relaxed">
              {t('index:supportDescription')}
            </p>
            <a
              href="https://www.globalstudentinc.com/dothan?fbclid=IwAR0N9DmYuSghoje4Q1IWJ8nqVoKRxlNCCR6VYVkPtp24oKdkHCs8wYF7wto"
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-colors">
                {t('index:donateToDothan')}
              </Button>
            </a>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4">{t('index:contactInfo')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@dothanministries.org</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+251-946224222</span>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>
                  Addis Ababa, Nefas Silk, Ethiopia
                </span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4">{t('index:followUs')}</h3>
            <p className="text-sm opacity-90 mb-6">
              Follow us on social media for updates and content
            </p>
            
            {/* Social Media Links */}
            <div className="flex gap-3">
              <a
                href="https://www.youtube.com/@DothanMinistryofficial/videos"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-110"
                title="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="https://www.tiktok.com/@dothan.ministry.media"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-110"
                title="TikTok"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-3.64 2.93 2.93 0 0 1 .88.12V8.78a6.77 6.77 0 0 0-1-.05A6.44 6.44 0 0 0 5.6 19.67a6.44 6.44 0 0 0 6.44 6.44 6.44 6.44 0 0 0 6.44-6.44v-7.73a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-3.66-3.27z"/>
                </svg>
              </a>
              <a
                href="https://t.me/dothanministryoffical"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-110"
                title="Telegram"
              >
                <Send className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/dothanministryofficial/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-110"
                title="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://web.facebook.com/people/Dothan-Ministry-Media/61582005119448/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-110"
                title="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/dothanministry"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-110"
                title="Twitter"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 00-2.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-4.594 4.11 13.95 13.95 0 00-10.13-5.141 4.928 4.928 0 001.523 6.574A4.9 4.9 0 012.79 9.091a4.93 4.93 0 004.067 4.927 4.9 4.9 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-75">
              © 2024 Dothan Ministry. {t('index:allRightsReserved')}
            </p>
            <div className="flex gap-6 text-sm items-center">
              <Link to="/privacy" className="hover:opacity-80 transition-opacity">
                {t('index:privacyPolicy')}
              </Link>
              <Link to="/terms" className="hover:opacity-80 transition-opacity">
                {t('index:termsOfService')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
