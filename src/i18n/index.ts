import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enCommon from './locales/en/common.json';
import enIndex from './locales/en/index.json';
import enNavigation from './locales/en/navigation.json';
import enAuth from './locales/en/auth.json';
import enCourses from './locales/en/courses.json';
import enLibrary from './locales/en/library.json';
import amCommon from './locales/am/common.json';
import amIndex from './locales/am/index.json';
import amNavigation from './locales/am/navigation.json';
import amAuth from './locales/am/auth.json';
import amCourses from './locales/am/courses.json';
import amLibrary from './locales/am/library.json';
import omCommon from './locales/om/common.json';
import omIndex from './locales/om/index.json';
import omNavigation from './locales/om/navigation.json';
import omAuth from './locales/om/auth.json';
import omCourses from './locales/om/courses.json';
import omLibrary from './locales/om/library.json';
import tiCommon from './locales/ti/common.json';
import tiIndex from './locales/ti/index.json';
import tiNavigation from './locales/ti/navigation.json';
import tiAuth from './locales/ti/auth.json';
import tiCourses from './locales/ti/courses.json';
import tiLibrary from './locales/ti/library.json';
import enDashboard from './locales/en/dashboard.json';
import amDashboard from './locales/am/dashboard.json';
import omDashboard from './locales/om/dashboard.json';
import tiDashboard from './locales/ti/dashboard.json';

i18n
  .use(initReactI18next)
  .init({
   resources: {
  en: {
    common: enCommon,
    index: enIndex,
    navigation: enNavigation,
    auth: enAuth,
    courses: enCourses,
    library: enLibrary,
    dashboard: enDashboard
  },
  am: {
    common: amCommon,
    index: amIndex,
    navigation: amNavigation,
    auth: amAuth,
    courses: amCourses,
    library: amLibrary,
    dashboard: amDashboard
  },
  om: {
    common: omCommon,
    index: omIndex,
    navigation: omNavigation,
    auth: omAuth,
    courses: omCourses,
    library: omLibrary,
    dashboard: omDashboard
  },
  ti: {
    common: tiCommon,
    index: tiIndex,
    navigation: tiNavigation,
    auth: tiAuth,
    courses: tiCourses,
    library: tiLibrary,
    dashboard: tiDashboard
  }
},
    fallbackLng: 'en',
    debug: false,
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    }
  });

export default i18n;
