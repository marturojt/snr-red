'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Image from 'next/image';
import { 
  User, 
  Phone, 
  Globe, 
  QrCode, 
  Download,
  Copy,
  ArrowRight,
  Check,
  Linkedin,
  AlertCircle,
  Mail,
  Building,
  Briefcase,
  Instagram,
  Twitter,
  MessageCircle,
  MapPin,
  Palette
} from 'lucide-react';
import { vcardApi } from '@/lib/api';
import { copyToClipboard } from '@/lib/utils';
import { ProgressStepper } from '@/components/ProgressStepper';
import { EnhancedInput } from '@/components/EnhancedInput';
import { PhoneInput } from '@/components/PhoneInput';
import { countries, defaultCountry, type Country } from '@/lib/countries';

interface VCardFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    company: string;
    title: string;
    photo: string;
  };
  contact: {
    phone: string;
    email: string;
    website: string;
    phoneCountry: Country;
  };
  social: {
    linkedin: string;
    whatsapp: string;
    instagram: string;
    twitter: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  theme: 'professional' | 'creative' | 'minimal';
}

interface ValidationState {
  isValid: boolean;
  isValidating: boolean;
  message?: string;
}

interface VCardErrors {
  personalInfo: {
    firstName: ValidationState;
    lastName: ValidationState;
    company: ValidationState;
    title: ValidationState;
    photo: ValidationState;
  };
  contact: {
    phone: ValidationState;
    email: ValidationState;
    website: ValidationState;
  };
  social: {
    linkedin: ValidationState;
    whatsapp: ValidationState;
    instagram: ValidationState;
    twitter: ValidationState;
  };
  address: {
    street: ValidationState;
    city: ValidationState;
    state: ValidationState;
    country: ValidationState;
    zipCode: ValidationState;
  };
}

interface VCardResult {
  id: string;
  shortUrl: string;
  shortCode: string;
  qrCode: string;
  personalInfo: {
    firstName: string;
    lastName: string;
  };
}

export default function VCardGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [vcard, setVCard] = useState<VCardResult | null>(null);
  
  const createValidationState = (isValid = true, message = ''): ValidationState => ({
    isValid,
    isValidating: false,
    message
  });

  const [errors, setErrors] = useState<VCardErrors>({
    personalInfo: { 
      firstName: createValidationState(), 
      lastName: createValidationState(), 
      company: createValidationState(), 
      title: createValidationState(), 
      photo: createValidationState() 
    },
    contact: { 
      phone: createValidationState(), 
      email: createValidationState(), 
      website: createValidationState() 
    },
    social: { 
      linkedin: createValidationState(), 
      whatsapp: createValidationState(), 
      instagram: createValidationState(), 
      twitter: createValidationState() 
    },
    address: { 
      street: createValidationState(), 
      city: createValidationState(), 
      state: createValidationState(), 
      country: createValidationState(), 
      zipCode: createValidationState() 
    }
  });

  const [formData, setFormData] = useState<VCardFormData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      company: '',
      title: '',
      photo: ''
    },
    contact: {
      phone: '',
      email: '',
      website: '',
      phoneCountry: defaultCountry
    },
    social: {
      linkedin: '',
      whatsapp: '',
      instagram: '',
      twitter: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    theme: 'professional'
  });

  // Enhanced validation functions with ValidationState
  const validateEmail = useCallback((email: string): ValidationState => {
    if (!email) return createValidationState(true, '');
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(email);
    return createValidationState(isValid, isValid ? '' : 'Please enter a valid email address');
  }, []);

  const validatePhone = useCallback((phone: string, country: Country): ValidationState => {
    if (!phone) return createValidationState(true, '');
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^[\+]?[1-9][\d]{7,15}$/;
    const isValid = phoneRegex.test(cleaned);
    return createValidationState(isValid, isValid ? '' : 'Please enter a valid phone number');
  }, []);

  const validateWebsite = useCallback((website: string): ValidationState => {
    if (!website) return createValidationState(true, '');
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const isValid = urlRegex.test(website);
    return createValidationState(isValid, isValid ? '' : 'Please enter a valid website URL');
  }, []);

  const validateLinkedIn = useCallback((linkedin: string): ValidationState => {
    if (!linkedin) return createValidationState(true, '');
    const linkedinRegex = /^(https?:\/\/)?(www\.)?(linkedin\.com\/(in|pub|public-profile)\/[a-zA-Z0-9-]+)\/?$/;
    const isValid = linkedinRegex.test(linkedin);
    return createValidationState(isValid, isValid ? '' : 'Please enter a valid LinkedIn URL');
  }, []);

  const validateInstagram = useCallback((instagram: string): ValidationState => {
    if (!instagram) return createValidationState(true, '');
    const instagramRegex = /^(https?:\/\/)?(www\.)?(instagram\.com\/[a-zA-Z0-9_.]+)\/?$/;
    const isValid = instagramRegex.test(instagram);
    return createValidationState(isValid, isValid ? '' : 'Please enter a valid Instagram URL');
  }, []);

  const validateTwitter = useCallback((twitter: string): ValidationState => {
    if (!twitter) return createValidationState(true, '');
    const twitterRegex = /^(https?:\/\/)?(www\.)?(twitter\.com\/[a-zA-Z0-9_]+|x\.com\/[a-zA-Z0-9_]+)\/?$/;
    const isValid = twitterRegex.test(twitter);
    return createValidationState(isValid, isValid ? '' : 'Please enter a valid Twitter/X URL');
  }, []);

  const validateWhatsApp = useCallback((whatsapp: string): ValidationState => {
    if (!whatsapp) return createValidationState(true, '');
    const cleanWhatsApp = whatsapp.replace(/[\s\-\(\)]/g, '');
    const whatsappRegex = /^[\+]?[1-9][\d]{7,15}$/;
    const isValid = whatsappRegex.test(cleanWhatsApp);
    return createValidationState(isValid, isValid ? '' : 'Please enter a valid WhatsApp number');
  }, []);

  const validateRequired = useCallback((value: string, fieldName: string, minLength = 2): ValidationState => {
    if (!value.trim()) {
      return createValidationState(false, `${fieldName} is required`);
    }
    if (value.length < minLength) {
      return createValidationState(false, `${fieldName} must be at least ${minLength} characters`);
    }
    return createValidationState(true, '');
  }, []);

  const validateOptional = useCallback((value: string, fieldName: string, minLength = 2): ValidationState => {
    if (!value.trim()) return createValidationState(true, '');
    if (value.length < minLength) {
      return createValidationState(false, `${fieldName} must be at least ${minLength} characters`);
    }
    return createValidationState(true, '');
  }, []);

  // Auto-format website to include https://
  const formatWebsite = useCallback((website: string): string => {
    if (!website) return '';
    if (website.startsWith('http://') || website.startsWith('https://')) {
      return website;
    }
    return `https://${website}`;
  }, []);

  // Real-time validation with debouncing
  const validateField = useCallback((section: keyof VCardErrors, field: string, value: string) => {
    let validation: ValidationState;
    
    switch (section) {
      case 'personalInfo':
        if (field === 'firstName' || field === 'lastName') {
          validation = validateRequired(value, field === 'firstName' ? 'First name' : 'Last name');
        } else {
          validation = validateOptional(value, field === 'company' ? 'Company' : 'Job title');
        }
        break;
      case 'contact':
        if (field === 'email') {
          validation = validateEmail(value);
        } else if (field === 'phone') {
          validation = validatePhone(value, formData.contact.phoneCountry);
        } else if (field === 'website') {
          validation = validateWebsite(value);
        } else {
          validation = createValidationState(true, '');
        }
        break;
      case 'social':
        if (field === 'linkedin') {
          validation = validateLinkedIn(value);
        } else if (field === 'instagram') {
          validation = validateInstagram(value);
        } else if (field === 'twitter') {
          validation = validateTwitter(value);
        } else if (field === 'whatsapp') {
          validation = validateWhatsApp(value);
        } else {
          validation = createValidationState(true, '');
        }
        break;
      default:
        validation = createValidationState(true, '');
    }

    setErrors(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: validation
      }
    }));
  }, [formData.contact.phoneCountry, validateRequired, validateOptional, validateEmail, validatePhone, validateWebsite, validateLinkedIn, validateInstagram, validateTwitter, validateWhatsApp]);

  // Update form data handlers
  const updatePersonalInfo = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
    validateField('personalInfo', field, value);
  }, [validateField]);

  const updateContact = useCallback((field: string, value: string) => {
    const finalValue = field === 'website' ? formatWebsite(value) : value;
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, [field]: finalValue }
    }));
    validateField('contact', field, finalValue);
  }, [formatWebsite, validateField]);

  const updateSocial = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      social: { ...prev.social, [field]: value }
    }));
    validateField('social', field, value);
  }, [validateField]);

  const updateAddress = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  }, []);

  const updatePhoneCountry = useCallback((country: Country) => {
    setFormData(prev => ({
      ...prev,
      contact: { ...prev.contact, phoneCountry: country }
    }));
    // Re-validate phone number with new country
    if (formData.contact.phone) {
      validateField('contact', 'phone', formData.contact.phone);
    }
  }, [formData.contact.phone, validateField]);

  // Step validation
  const validateStep = useCallback((step: number): boolean => {
    let isValid = true;

    if (step === 1) {
      const firstNameValidation = validateRequired(formData.personalInfo.firstName, 'First name');
      const lastNameValidation = validateRequired(formData.personalInfo.lastName, 'Last name');
      const companyValidation = validateOptional(formData.personalInfo.company, 'Company');
      const titleValidation = validateOptional(formData.personalInfo.title, 'Job title');

      setErrors(prev => ({
        ...prev,
        personalInfo: {
          firstName: firstNameValidation,
          lastName: lastNameValidation,
          company: companyValidation,
          title: titleValidation,
          photo: createValidationState(true, '')
        }
      }));

      isValid = firstNameValidation.isValid && lastNameValidation.isValid && 
                companyValidation.isValid && titleValidation.isValid;
    }

    if (step === 2) {
      const emailValidation = validateEmail(formData.contact.email);
      const phoneValidation = validatePhone(formData.contact.phone, formData.contact.phoneCountry);
      const websiteValidation = validateWebsite(formData.contact.website);

      setErrors(prev => ({
        ...prev,
        contact: {
          email: emailValidation,
          phone: phoneValidation,
          website: websiteValidation
        }
      }));

      isValid = emailValidation.isValid && phoneValidation.isValid && websiteValidation.isValid;
    }

    if (step === 3) {
      const linkedinValidation = validateLinkedIn(formData.social.linkedin);
      const instagramValidation = validateInstagram(formData.social.instagram);
      const twitterValidation = validateTwitter(formData.social.twitter);
      const whatsappValidation = validateWhatsApp(formData.social.whatsapp);

      setErrors(prev => ({
        ...prev,
        social: {
          linkedin: linkedinValidation,
          instagram: instagramValidation,
          twitter: twitterValidation,
          whatsapp: whatsappValidation
        }
      }));

      isValid = linkedinValidation.isValid && instagramValidation.isValid && 
                twitterValidation.isValid && whatsappValidation.isValid;
    }

    return isValid;
  }, [formData, validateRequired, validateOptional, validateEmail, validatePhone, validateWebsite, validateLinkedIn, validateInstagram, validateTwitter, validateWhatsApp]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  }, [currentStep, validateStep]);

  const handleBack = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  // Form submission
  const handleSubmit = useCallback(async () => {
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const response = await vcardApi.create({
        ...formData,
        contact: {
          ...formData.contact,
          phone: formData.contact.phone ? `${formData.contact.phoneCountry.dialCode} ${formData.contact.phone}` : ''
        }
      });
      
      setVCard(response);
      setCurrentStep(4);
      toast.success('vCard created successfully!');
    } catch (error) {
      console.error('Error creating vCard:', error);
      toast.error('Failed to create vCard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateStep]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      personalInfo: {
        firstName: '',
        lastName: '',
        company: '',
        title: '',
        photo: ''
      },
      contact: {
        phone: '',
        email: '',
        website: '',
        phoneCountry: defaultCountry
      },
      social: {
        linkedin: '',
        whatsapp: '',
        instagram: '',
        twitter: ''
      },
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: ''
      },
      theme: 'professional'
    });

    setErrors({
      personalInfo: { 
        firstName: createValidationState(), 
        lastName: createValidationState(), 
        company: createValidationState(), 
        title: createValidationState(), 
        photo: createValidationState() 
      },
      contact: { 
        phone: createValidationState(), 
        email: createValidationState(), 
        website: createValidationState() 
      },
      social: { 
        linkedin: createValidationState(), 
        whatsapp: createValidationState(), 
        instagram: createValidationState(), 
        twitter: createValidationState() 
      },
      address: { 
        street: createValidationState(), 
        city: createValidationState(), 
        state: createValidationState(), 
        country: createValidationState(), 
        zipCode: createValidationState() 
      }
    });

    setCurrentStep(1);
    setVCard(null);
  }, []);

  // Copy functions
  const copyUrl = useCallback(async () => {
    if (vcard?.shortUrl) {
      try {
        await copyToClipboard(vcard.shortUrl);
        toast.success('URL copied to clipboard!');
      } catch (error) {
        toast.error('Failed to copy URL');
      }
    }
  }, [vcard]);

  const downloadQR = useCallback(() => {
    if (vcard?.qrCode) {
      const link = document.createElement('a');
      link.href = vcard.qrCode;
      link.download = `${vcard.personalInfo.firstName}-${vcard.personalInfo.lastName}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR Code downloaded!');
    }
  }, [vcard]);

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Tell us about yourself. Fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <EnhancedInput
                  label="First Name"
                  required
                  value={formData.personalInfo.firstName}
                  onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                  placeholder="John"
                  validation={errors.personalInfo.firstName}
                  icon={<User className="w-4 h-4" />}
                />
                <EnhancedInput
                  label="Last Name"
                  required
                  value={formData.personalInfo.lastName}
                  onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                  placeholder="Doe"
                  validation={errors.personalInfo.lastName}
                  icon={<User className="w-4 h-4" />}
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <EnhancedInput
                  label="Company"
                  value={formData.personalInfo.company}
                  onChange={(e) => updatePersonalInfo('company', e.target.value)}
                  placeholder="Acme Corp"
                  validation={errors.personalInfo.company}
                  icon={<Building className="w-4 h-4" />}
                  helperText="Optional - Your company or organization"
                />
                <EnhancedInput
                  label="Job Title"
                  value={formData.personalInfo.title}
                  onChange={(e) => updatePersonalInfo('title', e.target.value)}
                  placeholder="Software Engineer"
                  validation={errors.personalInfo.title}
                  icon={<Briefcase className="w-4 h-4" />}
                  helperText="Optional - Your role or position"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNext} className="min-w-[120px]">
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                Add your contact details. All fields are optional but recommended.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EnhancedInput
                label="Email Address"
                type="email"
                value={formData.contact.email}
                onChange={(e) => updateContact('email', e.target.value)}
                placeholder="john@example.com"
                validation={errors.contact.email}
                icon={<Mail className="w-4 h-4" />}
                helperText="We'll never share your email with anyone"
              />

              <div>
                <label className="text-sm font-medium leading-none mb-2 block">
                  Phone Number
                </label>
                <PhoneInput
                  value={formData.contact.phone}
                  onChange={(value) => updateContact('phone', value)}
                  country={formData.contact.phoneCountry}
                  onCountryChange={updatePhoneCountry}
                  placeholder="Enter phone number"
                  error={errors.contact.phone.message}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  International format recommended
                </p>
              </div>

              <EnhancedInput
                label="Website"
                type="url"
                value={formData.contact.website}
                onChange={(e) => updateContact('website', e.target.value)}
                placeholder="www.example.com"
                validation={errors.contact.website}
                icon={<Globe className="w-4 h-4" />}
                helperText="We'll automatically add https:// if needed"
              />

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="min-w-[120px]">
                  Previous
                </Button>
                <Button onClick={handleNext} className="min-w-[120px]">
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Instagram className="w-5 h-5" />
                Social Media & Theme
              </CardTitle>
              <CardDescription>
                Connect your social profiles and choose a theme. All fields are optional.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <EnhancedInput
                  label="LinkedIn Profile"
                  value={formData.social.linkedin}
                  onChange={(e) => updateSocial('linkedin', e.target.value)}
                  placeholder="linkedin.com/in/johndoe"
                  validation={errors.social.linkedin}
                  icon={<Linkedin className="w-4 h-4" />}
                />
                <EnhancedInput
                  label="Instagram Profile"
                  value={formData.social.instagram}
                  onChange={(e) => updateSocial('instagram', e.target.value)}
                  placeholder="instagram.com/johndoe"
                  validation={errors.social.instagram}
                  icon={<Instagram className="w-4 h-4" />}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <EnhancedInput
                  label="Twitter/X Profile"
                  value={formData.social.twitter}
                  onChange={(e) => updateSocial('twitter', e.target.value)}
                  placeholder="twitter.com/johndoe"
                  validation={errors.social.twitter}
                  icon={<Twitter className="w-4 h-4" />}
                />
                <EnhancedInput
                  label="WhatsApp Number"
                  value={formData.social.whatsapp}
                  onChange={(e) => updateSocial('whatsapp', e.target.value)}
                  placeholder="+1 234 567 8900"
                  validation={errors.social.whatsapp}
                  icon={<MessageCircle className="w-4 h-4" />}
                />
              </div>

              <div>
                <label className="text-sm font-medium leading-none mb-2 block">
                  Theme Style
                </label>
                <Select
                  value={formData.theme}
                  onValueChange={(value: 'professional' | 'creative' | 'minimal') => 
                    setFormData(prev => ({ ...prev, theme: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Professional
                      </div>
                    </SelectItem>
                    <SelectItem value="creative">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4" />
                        Creative
                      </div>
                    </SelectItem>
                    <SelectItem value="minimal">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Minimal
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose the style that best represents you
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="min-w-[120px]">
                  Previous
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      Creating...
                      <div className="ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </>
                  ) : (
                    <>
                      Create vCard
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        if (!vcard) return null;
        
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Check className="w-6 h-6 text-green-500" />
                vCard Created Successfully!
              </CardTitle>
              <CardDescription>
                Your digital business card is ready. Share it with others!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="relative mx-auto w-48 h-48 bg-white rounded-lg border-2 border-border p-4">
                  <Image
                    src={vcard.qrCode}
                    alt="vCard QR Code"
                    fill
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {vcard.personalInfo.firstName} {vcard.personalInfo.lastName}
                  </h3>
                  <p className="text-muted-foreground">{vcard.shortUrl}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Button onClick={copyUrl} variant="outline" className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy URL
                </Button>
                <Button onClick={downloadQR} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download QR
                </Button>
              </div>

              <div className="text-center">
                <Button onClick={resetForm} variant="ghost">
                  Create Another vCard
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Create Your vCard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate a beautiful digital business card with QR code that your contacts can save directly to their phones
          </p>
        </div>

        {/* Progress Stepper */}
        {currentStep < 4 && (
          <div className="mb-12">
            <ProgressStepper currentStep={currentStep} />
          </div>
        )}

        {/* Form Steps */}
        {renderStepContent()}
      </div>
    </div>
  );
}
