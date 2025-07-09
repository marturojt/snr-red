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
    'hero.mainTitle': 'Digital Tools for',
    'hero.mainTitleHighlight': ' Modern Business',
    'hero.mainDescription': 'Shorten URLs, generate QR codes, create digital business cards - all in one powerful platform',
    'hero.placeholder': 'Enter your long URL here... (e.g., https://example.com)',
    'hero.titlePlaceholder': 'Optional: Give your URL a title (e.g., "My Website")',
    'hero.customCodePlaceholder': 'Optional: Custom short code (e.g., "my-link")',
    'hero.generateRandom': 'Generate random code',
    'hero.advancedOptions': 'Advanced Options',
    'hero.shorten': 'Shorten',
    'hero.anonymous': 'Anonymous URLs expire in 30 days.',
    'hero.signup': 'Sign up for longer retention',

    // Results
    'results.ready': 'Your URL is ready!',
    'results.shortUrl': 'Short URL',
    'results.original': 'Original URL',
    'results.createAnother': 'Create Another URL',

    // QR Code
    'qrCode': 'QR Code',
    'qrCodeDescription': 'Scan the QR code to quickly access your shortened URL',
    'qrCodeInstructions': 'Right-click on the QR code to save it to your device',
    'copyUrl': 'Copy URL',
    'download': 'Download',
    'shortUrl': 'Short URL',

    // QR Tabs
    'qrTabs.display': 'Display',
    'qrTabs.customize': 'Customize',
    
    // QR Customizer
    'qrCustomizer.title': 'Customize QR Code',
    'qrCustomizer.description': 'Personalize your QR code with colors, styles, and settings',
    'qrCustomizer.presets': 'Presets',
    'qrCustomizer.colors': 'Colors',
    'qrCustomizer.settings': 'Settings',
    'qrCustomizer.foregroundColor': 'Foreground Color',
    'qrCustomizer.backgroundColor': 'Background Color',
    'qrCustomizer.style': 'Style',
    'qrCustomizer.square': 'Square',
    'qrCustomizer.rounded': 'Rounded',
    'qrCustomizer.dots': 'Dots',
    'qrCustomizer.size': 'Size',
    'qrCustomizer.margin': 'Margin',
    'qrCustomizer.format': 'Format',
    'qrCustomizer.errorCorrection': 'Error Correction',
    'qrCustomizer.preview': 'Preview',
    'qrCustomizer.generate': 'Generate QR Code',
    'qrCustomizer.demoNote': 'This is a demo preview. The actual QR will be generated when you click "Generate QR Code".',
    'cancel': 'Cancel',
    'customizeQR': 'Customize QR Code',
    'customizeQRDescription': 'Add colors, styles, and personal touches to your QR code',
    'back': 'Back',
    'generating': 'Generating...',
    'qrCustomizer.previewDescription': 'See how your QR code will look in real-time',

    // Enhanced QR Code Display
    'qrDisplay.title': 'QR Code Generator',
    'qrDisplay.premium': 'Premium',
    'qrDisplay.description': 'Generate a QR code for your shortened URL to share easily',
    'qrDisplay.targetUrl': 'TARGET URL',
    'qrDisplay.download': 'Download',
    'qrDisplay.copy': 'Copy',
    'qrDisplay.copied': 'Copied!',
    'qrDisplay.share': 'Share',
    'qrDisplay.regenerate': 'Regenerate',
    'qrDisplay.generateTitle': 'Generate QR Code',
    'qrDisplay.generateDescription': 'Create a scannable QR code for your shortened URL',
    'qrDisplay.generateButton': 'Generate QR Code',
    'qrDisplay.generating': 'Generating...',
    'qrDisplay.benefitsTitle': 'QR Code Benefits',
    'qrDisplay.benefit1': 'Scan with any smartphone camera',
    'qrDisplay.benefit2': 'Perfect for print materials and presentations',
    'qrDisplay.benefit3': 'High-quality PNG format',
    'qrDisplay.benefit4': 'Error correction for reliable scanning',
    'qrDisplay.benefit5': 'Customizable size and format',
    'qrDisplay.downloadSuccess': 'QR code downloaded!',
    'qrDisplay.copySuccess': 'QR code copied to clipboard!',
    'qrDisplay.shareSuccess': 'QR code shared!',
    'qrDisplay.generateSuccess': '🎉 QR code generated successfully!',

    // Features
    'features.title': 'Why Choose SNR.red?',
    'features.subtitle': 'We provide the most advanced URL shortening platform with enterprise-grade features',
    'features.analytics.title': 'Advanced Analytics',
    'features.analytics.description': 'Track clicks, locations, devices, and more with our comprehensive analytics dashboard',
    'features.qr.title': 'QR Code Generation',
    'features.qr.description': 'Automatically generate QR codes for your short URLs with customizable designs',
    'features.security.title': 'Enterprise Security',
    'features.security.description': 'Password protection, expiration dates, and malware scanning for maximum security',
    'features.url.title': 'URL Shortening',
    'features.url.description': 'Create short, memorable links with custom branding and tracking',
    'features.vcard.title': 'vCard Generator',
    'features.vcard.description': 'Create professional digital business cards with QR codes',

    // Tabs
    'tabs.url': 'URL Shortener',
    'tabs.vcard': 'vCard Generator',

    // vCard
    'vcard.title': 'Create Digital Business Cards',
    'vcard.description': 'Generate professional vCards with QR codes for easy sharing',
    
    // vCard Steps
    'vcard.step1.title': 'Personal Information',
    'vcard.step1.description': 'Tell us about yourself. Fields marked with * are required.',
    'vcard.step2.title': 'Contact Information',
    'vcard.step2.description': 'Add your contact details. All fields are optional.',
    'vcard.step3.title': 'Social & Customization',
    'vcard.step3.description': 'Add social profiles and choose your card style.',
    'vcard.step4.title': 'Your Digital Business Card',
    'vcard.step4.description': 'Your vCard is ready! Download or share it with others.',
    
    // vCard Fields
    'vcard.firstName': 'First Name',
    'vcard.lastName': 'Last Name',
    'vcard.company': 'Company',
    'vcard.jobTitle': 'Job Title',
    'vcard.email': 'Email Address',
    'vcard.phone': 'Phone Number',
    'vcard.website': 'Website',
    'vcard.linkedin': 'LinkedIn Profile',
    'vcard.instagram': 'Instagram Profile',
    'vcard.twitter': 'Twitter/X Profile',
    'vcard.whatsapp': 'WhatsApp Number',
    'vcard.address.street': 'Street Address',
    'vcard.address.city': 'City',
    'vcard.address.state': 'State/Province',
    'vcard.address.country': 'Country',
    'vcard.address.zipCode': 'ZIP/Postal Code',
    
    // vCard Placeholders
    'vcard.placeholder.firstName': 'John',
    'vcard.placeholder.lastName': 'Doe',
    'vcard.placeholder.company': 'Acme Corp',
    'vcard.placeholder.jobTitle': 'Software Engineer',
    'vcard.placeholder.email': 'john@example.com',
    'vcard.placeholder.phone': '+1 234 567 8900',
    'vcard.placeholder.website': 'https://johndoe.com',
    'vcard.placeholder.linkedin': 'linkedin.com/in/johndoe',
    'vcard.placeholder.instagram': 'instagram.com/johndoe',
    'vcard.placeholder.twitter': 'twitter.com/johndoe',
    'vcard.placeholder.whatsapp': '+1 234 567 8900',
    'vcard.placeholder.street': '123 Main Street',
    'vcard.placeholder.city': 'New York',
    'vcard.placeholder.state': 'NY',
    'vcard.placeholder.country': 'United States',
    'vcard.placeholder.zipCode': '10001',
    
    // vCard Helper Text
    'vcard.helper.company': 'Optional - Your company or organization',
    'vcard.helper.jobTitle': 'Optional - Your role or position',
    'vcard.helper.phone': 'Select your country and enter your phone number',
    'vcard.helper.website': 'Optional - Your personal or company website',
    'vcard.helper.linkedin': 'Optional - Your LinkedIn profile URL',
    'vcard.helper.instagram': 'Optional - Your Instagram profile URL',
    'vcard.helper.twitter': 'Optional - Your Twitter/X profile URL',
    'vcard.helper.whatsapp': 'Optional - Your WhatsApp number for messaging',
    'vcard.helper.address': 'Optional - Your business or home address',
    'vcard.helper.theme': 'Choose the style that best represents you',
    
    // vCard Theme
    'vcard.theme.title': 'Theme Style',
    'vcard.theme.placeholder': 'Choose a theme',
    'vcard.theme.professional': 'Professional',
    'vcard.theme.creative': 'Creative',
    'vcard.theme.minimal': 'Minimal',
    
    // vCard Buttons
    'vcard.button.next': 'Next',
    'vcard.button.previous': 'Previous',
    'vcard.button.create': 'Create vCard',
    'vcard.button.creating': 'Creating...',
    'vcard.button.download': 'Download vCard',
    'vcard.button.viewQr': 'View QR Code',
    'vcard.button.share': 'Share',
    'vcard.button.copyUrl': 'Copy URL',
    'vcard.button.backToForm': 'Create Another',
    
    // vCard Validation Messages
    'vcard.validation.emailInvalid': 'Please enter a valid email address',
    'vcard.validation.phoneInvalid': 'Please enter a valid phone number',
    'vcard.validation.websiteInvalid': 'Please enter a valid website URL',
    'vcard.validation.linkedinInvalid': 'Please enter a valid LinkedIn profile URL',
    'vcard.validation.instagramInvalid': 'Please enter a valid Instagram profile URL',
    'vcard.validation.twitterInvalid': 'Please enter a valid Twitter/X profile URL',
    'vcard.validation.whatsappInvalid': 'Please enter a valid WhatsApp number',
    'vcard.validation.required': 'is required',
    
    // vCard Success Messages
    'vcard.success.created': '🎉 vCard created successfully!',
    'vcard.success.downloaded': 'vCard downloaded successfully!',
    'vcard.success.urlCopied': 'vCard URL copied to clipboard!',
    'vcard.success.shared': 'vCard shared successfully!',
    
    // vCard Error Messages
    'vcard.error.createFailed': 'Failed to create vCard. Please try again.',
    'vcard.error.downloadFailed': 'Failed to download vCard. Please try again.',
    'vcard.error.shareFailed': 'Failed to share vCard. Please try again.',
    
    // vCard Address Section
    'vcard.address.title': 'Address (Optional)',
    'vcard.address.description': 'Add your business or home address',

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

    // Theme
    'theme.toggle': 'Toggle theme',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
    'theme.system': 'System',
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
    'hero.mainTitle': 'Herramientas Digitales para',
    'hero.mainTitleHighlight': ' Negocios Modernos',
    'hero.mainDescription': 'Acorta URLs, genera códigos QR, crea tarjetas de presentación digitales - todo en una plataforma poderosa',
    'hero.placeholder': 'Ingresa tu URL larga aquí... (ej: https://ejemplo.com)',
    'hero.titlePlaceholder': 'Opcional: Dale un título a tu URL (ej: "Mi Sitio Web")',
    'hero.customCodePlaceholder': 'Opcional: Código corto personalizado (ej: "mi-enlace")',
    'hero.generateRandom': 'Generar código aleatorio',
    'hero.advancedOptions': 'Opciones Avanzadas',
    'hero.shorten': 'Acortar',
    'hero.anonymous': 'Las URLs anónimas expiran en 30 días.',
    'hero.signup': 'Regístrate para mayor retención',

    // Results
    'results.ready': '¡Tu URL está lista!',
    'results.shortUrl': 'URL Corta',
    'results.original': 'URL Original',
    'results.createAnother': 'Crear Otra URL',

    // QR Code
    'qrCode': 'Código QR',
    'qrCodeDescription': 'Escanea el código QR para acceder rápidamente a tu URL acortada',
    'qrCodeInstructions': 'Haz clic derecho en el código QR para guardarlo en tu dispositivo',
    'copyUrl': 'Copiar URL',
    'download': 'Descargar',
    'shortUrl': 'URL Corta',

    // QR Tabs
    'qrTabs.display': 'Ver',
    'qrTabs.customize': 'Personalizar',
    
    // QR Customizer
    'qrCustomizer.title': 'Personalizar Código QR',
    'qrCustomizer.description': 'Personaliza tu código QR con colores, estilos y configuraciones',
    'qrCustomizer.presets': 'Presets',
    'qrCustomizer.colors': 'Colores',
    'qrCustomizer.settings': 'Configuración',
    'qrCustomizer.foregroundColor': 'Color Principal',
    'qrCustomizer.backgroundColor': 'Color de Fondo',
    'qrCustomizer.style': 'Estilo',
    'qrCustomizer.square': 'Cuadrado',
    'qrCustomizer.rounded': 'Redondeado',
    'qrCustomizer.dots': 'Puntos',
    'qrCustomizer.size': 'Tamaño',
    'qrCustomizer.margin': 'Margen',
    'qrCustomizer.format': 'Formato',
    'qrCustomizer.errorCorrection': 'Corrección de Errores',
    'qrCustomizer.preview': 'Vista Previa',
    'qrCustomizer.generate': 'Generar Código QR',
    'qrCustomizer.demoNote': 'Esta es una vista previa demo. El QR real se generará cuando hagas clic en "Generar Código QR".',
    'cancel': 'Cancelar',
    'customizeQR': 'Personalizar Código QR',
    'customizeQRDescription': 'Agrega colores, estilos y toques personales a tu código QR',
    'back': 'Atrás',
    'generating': 'Generando...',
    'qrCustomizer.previewDescription': 'Ve cómo se verá tu código QR en tiempo real',

    // Enhanced QR Code Display
    'qrDisplay.title': 'Generador de Código QR',
    'qrDisplay.premium': 'Premium',
    'qrDisplay.description': 'Genera un código QR para tu URL acortada y compártela fácilmente',
    'qrDisplay.targetUrl': 'URL DESTINO',
    'qrDisplay.download': 'Descargar',
    'qrDisplay.copy': 'Copiar',
    'qrDisplay.copied': '¡Copiado!',
    'qrDisplay.share': 'Compartir',
    'qrDisplay.regenerate': 'Regenerar',
    'qrDisplay.generateTitle': 'Generar Código QR',
    'qrDisplay.generateDescription': 'Crea un código QR escaneable para tu URL acortada',
    'qrDisplay.generateButton': 'Generar Código QR',
    'qrDisplay.generating': 'Generando...',
    'qrDisplay.benefitsTitle': 'Beneficios del Código QR',
    'qrDisplay.benefit1': 'Escanea con cualquier cámara de smartphone',
    'qrDisplay.benefit2': 'Perfecto para materiales impresos y presentaciones',
    'qrDisplay.benefit3': 'Formato PNG de alta calidad',
    'qrDisplay.benefit4': 'Corrección de errores para escaneo confiable',
    'qrDisplay.benefit5': 'Tamaño y formato personalizable',
    'qrDisplay.downloadSuccess': '¡Código QR descargado!',
    'qrDisplay.copySuccess': '¡Código QR copiado al portapapeles!',
    'qrDisplay.shareSuccess': '¡Código QR compartido!',
    'qrDisplay.generateSuccess': '🎉 ¡Código QR generado exitosamente!',

    // Features
    'features.title': '¿Por qué elegir SNR.red?',
    'features.subtitle': 'Proporcionamos la plataforma de acortamiento de URLs más avanzada con características de nivel empresarial',
    'features.analytics.title': 'Analytics Avanzados',
    'features.analytics.description': 'Rastrea clics, ubicaciones, dispositivos y más con nuestro panel de analytics completo',
    'features.qr.title': 'Generación de Código QR',
    'features.qr.description': 'Genera automáticamente códigos QR para tus URLs cortas con diseños personalizables',
    'features.security.title': 'Seguridad Empresarial',
    'features.security.description': 'Protección con contraseña, fechas de expiración y escaneo de malware para máxima seguridad',
    'features.url.title': 'Acortamiento de URLs',
    'features.url.description': 'Crea enlaces cortos y memorables con marca personalizada y seguimiento',
    'features.vcard.title': 'Generador de vCard',
    'features.vcard.description': 'Crea tarjetas de presentación digitales profesionales con códigos QR',

    // Tabs
    'tabs.url': 'Acortador de URLs',
    'tabs.vcard': 'Generador de vCard',

    // vCard
    'vcard.title': 'Crear Tarjetas de Presentación Digitales',
    'vcard.description': 'Genera vCards profesionales con códigos QR para compartir fácilmente',
    
    // vCard Steps
    'vcard.step1.title': 'Información Personal',
    'vcard.step1.description': 'Cuéntanos sobre ti. Los campos marcados con * son obligatorios.',
    'vcard.step2.title': 'Información de Contacto',
    'vcard.step2.description': 'Agrega tus datos de contacto. Todos los campos son opcionales.',
    'vcard.step3.title': 'Redes Sociales y Personalización',
    'vcard.step3.description': 'Agrega perfiles sociales y elige el estilo de tu tarjeta.',
    'vcard.step4.title': '¡Tu Tarjeta de Presentación Digital está Lista!',
    'vcard.step4.description': '¡Tu vCard está lista! Descárgala o compártela con otros.',
    
    // vCard Fields
    'vcard.firstName': 'Nombre',
    'vcard.lastName': 'Apellido',
    'vcard.company': 'Empresa',
    'vcard.jobTitle': 'Puesto de Trabajo',
    'vcard.email': 'Correo Electrónico',
    'vcard.phone': 'Número de Teléfono',
    'vcard.website': 'Sitio Web',
    'vcard.linkedin': 'Perfil de LinkedIn',
    'vcard.instagram': 'Perfil de Instagram',
    'vcard.twitter': 'Perfil de Twitter/X',
    'vcard.whatsapp': 'Número de WhatsApp',
    'vcard.address.street': 'Dirección',
    'vcard.address.city': 'Ciudad',
    'vcard.address.state': 'Estado/Provincia',
    'vcard.address.country': 'País',
    'vcard.address.zipCode': 'Código Postal',
    
    // vCard Placeholders
    'vcard.placeholder.firstName': 'Juan',
    'vcard.placeholder.lastName': 'Pérez',
    'vcard.placeholder.company': 'Acme Corp',
    'vcard.placeholder.jobTitle': 'Ingeniero de Software',
    'vcard.placeholder.email': 'juan@ejemplo.com',
    'vcard.placeholder.phone': '+34 123 456 789',
    'vcard.placeholder.website': 'https://juanperez.com',
    'vcard.placeholder.linkedin': 'linkedin.com/in/juanperez',
    'vcard.placeholder.instagram': 'instagram.com/juanperez',
    'vcard.placeholder.twitter': 'twitter.com/juanperez',
    'vcard.placeholder.whatsapp': '+34 123 456 789',
    'vcard.placeholder.street': 'Calle Principal 123',
    'vcard.placeholder.city': 'Madrid',
    'vcard.placeholder.state': 'Madrid',
    'vcard.placeholder.country': 'España',
    'vcard.placeholder.zipCode': '28001',
    
    // vCard Helper Text
    'vcard.helper.company': 'Opcional - Tu empresa u organización',
    'vcard.helper.jobTitle': 'Opcional - Tu puesto o cargo',
    'vcard.helper.phone': 'Selecciona tu país e ingresa tu número de teléfono',
    'vcard.helper.website': 'Opcional - Tu sitio web personal o de empresa',
    'vcard.helper.linkedin': 'Opcional - URL de tu perfil de LinkedIn',
    'vcard.helper.instagram': 'Opcional - URL de tu perfil de Instagram',
    'vcard.helper.twitter': 'Opcional - URL de tu perfil de Twitter/X',
    'vcard.helper.whatsapp': 'Opcional - Tu número de WhatsApp para mensajería',
    'vcard.helper.address': 'Opcional - Tu dirección comercial o residencial',
    'vcard.helper.theme': 'Elige el estilo que mejor te represente',
    
    // vCard Theme
    'vcard.theme.title': 'Estilo del Tema',
    'vcard.theme.placeholder': 'Elige un tema',
    'vcard.theme.professional': 'Profesional',
    'vcard.theme.creative': 'Creativo',
    'vcard.theme.minimal': 'Minimalista',
    
    // vCard Buttons
    'vcard.button.next': 'Siguiente',
    'vcard.button.previous': 'Anterior',
    'vcard.button.create': 'Crear vCard',
    'vcard.button.creating': 'Creando...',
    'vcard.button.download': 'Descargar vCard',
    'vcard.button.viewQr': 'Ver Código QR',
    'vcard.button.share': 'Compartir',
    'vcard.button.copyUrl': 'Copiar URL',
    'vcard.button.backToForm': 'Crear Otra',

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

    // Theme
    'theme.toggle': 'Cambiar tema',
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
    'theme.system': 'Sistema',
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
