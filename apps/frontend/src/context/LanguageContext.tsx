'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translations object
const translations = {
  en: {
    // Navigation
    'nav.myUrls': 'My URLs',
    'nav.login': 'Login / Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.admin': 'Admin',
    'nav.logout': 'Logout',
    'nav.back': '← Back to Home',

    // Hero Section
    'hero.badge': 'Most Advanced URL Shortener',
    'hero.title': 'Shorten URLs with',
    'hero.titleHighlight': ' Super Powers',
    'hero.description': 'Create powerful short links, generate QR codes, and track performance with our advanced analytics platform.',
    'hero.placeholder': 'Enter your long URL here... (e.g., https://example.com)',
    'hero.shorten': 'Shorten',
    'hero.anonymous': 'Anonymous URLs expire in 30 days.',
    'hero.signup': 'Sign up for longer retention',

    // Results
    'results.ready': 'Your URL is ready!',
    'results.shortUrl': 'Short URL',
    'results.original': 'Original URL',
    'results.createAnother': 'Create Another URL',

    // Features
    'features.title': 'Why Choose SNR.red?',
    'features.subtitle': 'We provide the most advanced URL shortening platform with enterprise-grade features',
    'features.analytics.title': 'Advanced Analytics',
    'features.analytics.description': 'Track clicks, locations, devices, and more with our comprehensive analytics dashboard',
    'features.qr.title': 'QR Code Generation',
    'features.qr.description': 'Automatically generate QR codes for your short URLs with customizable designs',
    'features.security.title': 'Enterprise Security',
    'features.security.description': 'Password protection, expiration dates, and malware scanning for maximum security',

    // Stats
    'stats.urls': 'URLs Shortened',
    'stats.users': 'Active Users',
    'stats.uptime': 'Uptime',
    'stats.support': 'Support',

    // Pricing
    'pricing.title': 'Simple, Transparent Pricing',
    'pricing.subtitle': 'Choose the plan that fits your needs. Upgrade or downgrade at any time.',
    'pricing.free': 'Free',
    'pricing.premium': 'Premium',
    'pricing.freeDescription': 'Perfect for personal use',
    'pricing.premiumDescription': 'For professionals and businesses',
    'pricing.mostPopular': 'Most Popular',
    'pricing.getStarted': 'Get Started Free',
    'pricing.startTrial': 'Start Premium Trial',

    // Features List
    'features.urlsPerMonth': 'URLs per month',
    'features.basicAnalytics': 'Basic analytics',
    'features.qrGeneration': 'QR code generation',
    'features.retention': 'months retention',
    'features.unlimited': 'Unlimited URLs',
    'features.advancedAnalytics': 'Advanced analytics',
    'features.customDomains': 'Custom domains',
    'features.passwordProtection': 'Password protection',
    'features.apiAccess': 'API access',
    'features.prioritySupport': 'Priority support',

    // CTA Section
    'cta.title': 'Ready to Get Started?',
    'cta.subtitle': 'Join thousands of users who trust SNR.red for their URL shortening needs',
    'cta.startTrial': 'Start Free Trial',
    'cta.watchDemo': 'Watch Demo',

    // Footer
    'footer.description': 'The most advanced URL shortening platform with enterprise-grade features.',
    'footer.product': 'Product',
    'footer.features': 'Features',
    'footer.pricing': 'Pricing',
    'footer.api': 'API',
    'footer.integrations': 'Integrations',
    'footer.company': 'Company',
    'footer.about': 'About',
    'footer.blog': 'Blog',
    'footer.careers': 'Careers',
    'footer.contact': 'Contact',
    'footer.support': 'Support',
    'footer.helpCenter': 'Help Center',
    'footer.status': 'Status',
    'footer.privacy': 'Privacy',
    'footer.terms': 'Terms',
    'footer.copyright': '© 2025 SNR.red. All rights reserved.',

    // Auth Modal
    'auth.welcome': 'Welcome to SNR.red',
    'auth.close': '×',

    // Messages
    'messages.urlCopied': 'URL copied to clipboard!',
    'messages.loggedOut': 'Logged out successfully',
    'messages.urlShortened': 'URL shortened successfully!',
    'messages.enterUrl': 'Please enter a URL to shorten',
    'messages.validUrl': 'Please enter a valid URL with protocol (http:// or https://)',
    'messages.welcome': 'Welcome',

    // User Management
    'user.myUrls': 'My URLs',
    'user.plan': 'Plan',
    'user.hi': 'Hi',
  },
  es: {
    // Navigation
    'nav.myUrls': 'Mis URLs',
    'nav.login': 'Iniciar Sesión / Registrarse',
    'nav.dashboard': 'Panel',
    'nav.admin': 'Admin',
    'nav.logout': 'Cerrar Sesión',
    'nav.back': '← Volver al Inicio',

    // Hero Section
    'hero.badge': 'Acortador de URLs Más Avanzado',
    'hero.title': 'Acorta URLs con',
    'hero.titleHighlight': ' Super Poderes',
    'hero.description': 'Crea enlaces cortos poderosos, genera códigos QR y rastrea el rendimiento con nuestra plataforma de analytics avanzada.',
    'hero.placeholder': 'Ingresa tu URL larga aquí... (ej: https://ejemplo.com)',
    'hero.shorten': 'Acortar',
    'hero.anonymous': 'Las URLs anónimas expiran en 30 días.',
    'hero.signup': 'Regístrate para mayor retención',

    // Results
    'results.ready': '¡Tu URL está lista!',
    'results.shortUrl': 'URL Corta',
    'results.original': 'URL Original',
    'results.createAnother': 'Crear Otra URL',

    // Features
    'features.title': '¿Por qué elegir SNR.red?',
    'features.subtitle': 'Proporcionamos la plataforma de acortamiento de URLs más avanzada con características de nivel empresarial',
    'features.analytics.title': 'Analytics Avanzados',
    'features.analytics.description': 'Rastrea clics, ubicaciones, dispositivos y más con nuestro panel de analytics completo',
    'features.qr.title': 'Generación de Código QR',
    'features.qr.description': 'Genera automáticamente códigos QR para tus URLs cortas con diseños personalizables',
    'features.security.title': 'Seguridad Empresarial',
    'features.security.description': 'Protección con contraseña, fechas de expiración y escaneo de malware para máxima seguridad',

    // Stats
    'stats.urls': 'URLs Acortadas',
    'stats.users': 'Usuarios Activos',
    'stats.uptime': 'Tiempo Activo',
    'stats.support': 'Soporte',

    // Pricing
    'pricing.title': 'Precios Simples y Transparentes',
    'pricing.subtitle': 'Elige el plan que se adapte a tus necesidades. Actualiza o degrada en cualquier momento.',
    'pricing.free': 'Gratis',
    'pricing.premium': 'Premium',
    'pricing.freeDescription': 'Perfecto para uso personal',
    'pricing.premiumDescription': 'Para profesionales y empresas',
    'pricing.mostPopular': 'Más Popular',
    'pricing.getStarted': 'Comenzar Gratis',
    'pricing.startTrial': 'Iniciar Prueba Premium',

    // Features List
    'features.urlsPerMonth': 'URLs por mes',
    'features.basicAnalytics': 'Analytics básicos',
    'features.qrGeneration': 'Generación de código QR',
    'features.retention': 'meses de retención',
    'features.unlimited': 'URLs ilimitadas',
    'features.advancedAnalytics': 'Analytics avanzados',
    'features.customDomains': 'Dominios personalizados',
    'features.passwordProtection': 'Protección con contraseña',
    'features.apiAccess': 'Acceso a API',
    'features.prioritySupport': 'Soporte prioritario',

    // CTA Section
    'cta.title': '¿Listo para Comenzar?',
    'cta.subtitle': 'Únete a miles de usuarios que confían en SNR.red para sus necesidades de acortamiento de URLs',
    'cta.startTrial': 'Iniciar Prueba Gratuita',
    'cta.watchDemo': 'Ver Demo',

    // Footer
    'footer.description': 'La plataforma de acortamiento de URLs más avanzada con características de nivel empresarial.',
    'footer.product': 'Producto',
    'footer.features': 'Características',
    'footer.pricing': 'Precios',
    'footer.api': 'API',
    'footer.integrations': 'Integraciones',
    'footer.company': 'Empresa',
    'footer.about': 'Acerca de',
    'footer.blog': 'Blog',
    'footer.careers': 'Carreras',
    'footer.contact': 'Contacto',
    'footer.support': 'Soporte',
    'footer.helpCenter': 'Centro de Ayuda',
    'footer.status': 'Estado',
    'footer.privacy': 'Privacidad',
    'footer.terms': 'Términos',
    'footer.copyright': '© 2025 SNR.red. Todos los derechos reservados.',

    // Auth Modal
    'auth.welcome': 'Bienvenido a SNR.red',
    'auth.close': '×',

    // Messages
    'messages.urlCopied': '¡URL copiada al portapapeles!',
    'messages.loggedOut': 'Sesión cerrada exitosamente',
    'messages.urlShortened': '¡URL acortada exitosamente!',
    'messages.enterUrl': 'Por favor ingresa una URL para acortar',
    'messages.validUrl': 'Por favor ingresa una URL válida con protocolo (http:// o https://)',
    'messages.welcome': 'Bienvenido',

    // User Management
    'user.myUrls': 'Mis URLs',
    'user.plan': 'Plan',
    'user.hi': 'Hola',
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('snr-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('snr-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
