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
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* About Dothan Ministry */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-serif font-semibold mb-4">{t('index:aboutDothan')}</h3>
            <p className="text-sm opacity-90 mb-6 leading-relaxed">
              {t('index:footerDescription')}
            </p>
            
            {/* Support Dothan Ministry CTA */}
            <div className="bg-primary-foreground/10 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-2">{t('index:supportDothanMinistry')}</h4>
              <p className="text-xs opacity-90 mb-3">
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

                      </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4">{t('index:quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:opacity-80 transition-opacity">
                  {t('index:home')}
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-sm hover:opacity-80 transition-opacity">
                  {t('index:courses')}
                </Link>
              </li>
              <li>
                <Link to="/library" className="text-sm hover:opacity-80 transition-opacity">
                  {t('index:digitalLibrary')}
                </Link>
              </li>
              <li>
                <Link to="/my-library" className="text-sm hover:opacity-80 transition-opacity">
                  My Library
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:opacity-80 transition-opacity">
                  {t('index:contactUs')}
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm hover:opacity-80 transition-opacity">
                  {t('index:registerNow')}
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm hover:opacity-80 transition-opacity">
                  {t('index:login')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4">{t('index:contactInfo')}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@dothanministry.org</span>
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

            {/* Register/Login CTAs */}
            <div className="mt-6 space-y-6">
              <Link to="/signup">
                <Button size="sm" variant="secondary" className="w-full bg-white text-primary hover:bg-[#FCAF17] hover:bg-opacity-50 hover:text-white transition-all duration-300 transform hover:scale-105">
                  {t('index:Register')}
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm" variant="outline" className="w-full border-2 border-white bg-transparent text-white hover:bg-[#FCAF17] hover:bg-opacity-50 hover:border-[#FCAF17] hover:border-opacity-50 hover:text-white transition-all duration-300 mt-4">
                  {t('index:login')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Social Media & Newsletter */}
          <div>
            <h3 className="text-xl font-serif font-semibold mb-4">{t('index:followUs')}</h3>
            <p className="text-sm opacity-90 mb-4">
              {t('index:newsletterDescription')}
            </p>
            
            {/* Social Media Links */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <a
                href="https://www.youtube.com/@DothanMinistryofficial/videos"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2 hover:bg-primary-foreground/20 transition-colors text-sm"
              >
                <Youtube className="h-4 w-4" />
                <span>YouTube</span>
              </a>
              <a
                href="https://www.tiktok.com/@dothan.ministry.media"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2 hover:bg-primary-foreground/20 transition-colors text-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-3.64 2.93 2.93 0 0 1 .88.12V8.78a6.77 6.77 0 0 0-1-.05A6.44 6.44 0 0 0 5.6 19.67a6.44 6.44 0 0 0 6.44 6.44 6.44 6.44 0 0 0 6.44-6.44v-7.73a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-3.66-3.27z"/>
                </svg>
                <span>TikTok</span>
              </a>
              <a
                href="https://t.me/dothanministryoffical"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2 hover:bg-primary-foreground/20 transition-colors text-sm"
              >
                <Send className="h-4 w-4" />
                <span>Telegram</span>
              </a>
              <a
                href="https://www.instagram.com/dothanministryofficial/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2 hover:bg-primary-foreground/20 transition-colors text-sm"
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </a>
              <a
                href="https://web.facebook.com/people/Dothan-Ministry-Media/61582005119448/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg px-3 py-2 hover:bg-primary-foreground/20 transition-colors text-sm"
              >
                <Facebook className="h-4 w-4" />
                <span>Facebook</span>
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
            <div className="flex gap-6 text-sm">
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
