'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  AlertCircle
} from 'lucide-react';
import { vcardApi } from '@/lib/api';
import { copyToClipboard } from '@/lib/utils';

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

interface VCardErrors {
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
  const [errors, setErrors] = useState<VCardErrors>({
    personalInfo: { firstName: '', lastName: '', company: '', title: '', photo: '' },
    contact: { phone: '', email: '', website: '' },
    social: { linkedin: '', whatsapp: '', instagram: '', twitter: '' },
    address: { street: '', city: '', state: '', country: '', zipCode: '' }
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
      website: ''
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

  // Validation functions
  // Enhanced validation functions
  const validateEmail = useCallback((email: string): string => {
    if (!email) return '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) ? '' : 'Please enter a valid email address';
  }, []);

  const validatePhone = useCallback((phone: string): string => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const phoneRegex = /^[\+]?[1-9][\d]{7,15}$/;
    return phoneRegex.test(cleanPhone) ? '' : 'Please enter a valid phone number';
  }, []);

  const validateWebsite = useCallback((website: string): string => {
    if (!website) return '';
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return urlRegex.test(website) ? '' : 'Please enter a valid website URL';
  }, []);

  const validateLinkedIn = useCallback((linkedin: string): string => {
    if (!linkedin) return '';
    const linkedinRegex = /^(https?:\/\/)?(www\.)?(linkedin\.com\/(in|pub|public-profile)\/[a-zA-Z0-9-]+)\/?$/;
    return linkedinRegex.test(linkedin) ? '' : 'Please enter a valid LinkedIn URL';
  }, []);

  const validateInstagram = useCallback((instagram: string): string => {
    if (!instagram) return '';
    const instagramRegex = /^(https?:\/\/)?(www\.)?(instagram\.com\/[a-zA-Z0-9_.]+)\/?$/;
    return instagramRegex.test(instagram) ? '' : 'Please enter a valid Instagram URL';
  }, []);

  const validateTwitter = useCallback((twitter: string): string => {
    if (!twitter) return '';
    const twitterRegex = /^(https?:\/\/)?(www\.)?(twitter\.com\/[a-zA-Z0-9_]+|x\.com\/[a-zA-Z0-9_]+)\/?$/;
    return twitterRegex.test(twitter) ? '' : 'Please enter a valid Twitter/X URL';
  }, []);

  const validateWhatsApp = useCallback((whatsapp: string): string => {
    if (!whatsapp) return '';
    const cleanWhatsApp = whatsapp.replace(/[\s\-\(\)]/g, '');
    const whatsappRegex = /^[\+]?[1-9][\d]{7,15}$/;
    return whatsappRegex.test(cleanWhatsApp) ? '' : 'Please enter a valid WhatsApp number';
  }, []);

  // Enhanced formatting functions
  const formatPhone = useCallback((phone: string): string => {
    // Remove all non-digits except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Handle international format
    if (cleaned.startsWith('+')) {
      const withoutPlus = cleaned.slice(1);
      if (withoutPlus.length <= 3) {
        return '+' + withoutPlus;
      } else if (withoutPlus.length <= 6) {
        return `+${withoutPlus.slice(0, 3)} ${withoutPlus.slice(3)}`;
      } else if (withoutPlus.length <= 10) {
        return `+${withoutPlus.slice(0, 3)} ${withoutPlus.slice(3, 6)} ${withoutPlus.slice(6)}`;
      } else {
        return `+${withoutPlus.slice(0, 3)} ${withoutPlus.slice(3, 6)} ${withoutPlus.slice(6, 10)} ${withoutPlus.slice(10)}`;
      }
    }
    
    // Handle national format
    const digits = cleaned.replace(/\D/g, '');
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else {
      return `+${digits.slice(0, -10)} (${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
    }
  }, []);

  const formatWebsite = useCallback((website: string): string => {
    if (!website) return '';
    if (website.startsWith('http://') || website.startsWith('https://')) {
      return website;
    }
    return `https://${website}`;
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const newErrors = { ...errors };
    let hasErrors = false;

    if (step === 1) {
      // Personal Info validation (Required fields)
      if (!formData.personalInfo.firstName.trim()) {
        newErrors.personalInfo.firstName = 'First name is required';
        hasErrors = true;
      } else if (formData.personalInfo.firstName.length < 2) {
        newErrors.personalInfo.firstName = 'First name must be at least 2 characters';
        hasErrors = true;
      } else {
        newErrors.personalInfo.firstName = '';
      }

      if (!formData.personalInfo.lastName.trim()) {
        newErrors.personalInfo.lastName = 'Last name is required';
        hasErrors = true;
      } else if (formData.personalInfo.lastName.length < 2) {
        newErrors.personalInfo.lastName = 'Last name must be at least 2 characters';
        hasErrors = true;
      } else {
        newErrors.personalInfo.lastName = '';
      }

      // Company validation (optional but if provided, must be valid)
      if (formData.personalInfo.company && formData.personalInfo.company.length < 2) {
        newErrors.personalInfo.company = 'Company name must be at least 2 characters';
        hasErrors = true;
      } else {
        newErrors.personalInfo.company = '';
      }

      // Title validation (optional but if provided, must be valid)
      if (formData.personalInfo.title && formData.personalInfo.title.length < 2) {
        newErrors.personalInfo.title = 'Job title must be at least 2 characters';
        hasErrors = true;
      } else {
        newErrors.personalInfo.title = '';
      }

    } else if (step === 2) {
      // Contact validation
      if (formData.contact.email) {
        const emailError = validateEmail(formData.contact.email);
        if (emailError) {
          newErrors.contact.email = emailError;
          hasErrors = true;
        } else {
          newErrors.contact.email = '';
        }
      }

      if (formData.contact.phone) {
        const phoneError = validatePhone(formData.contact.phone);
        if (phoneError) {
          newErrors.contact.phone = phoneError;
          hasErrors = true;
        } else {
          newErrors.contact.phone = '';
        }
      }

      if (formData.contact.website) {
        const websiteError = validateWebsite(formData.contact.website);
        if (websiteError) {
          newErrors.contact.website = websiteError;
          hasErrors = true;
        } else {
          newErrors.contact.website = '';
        }
      }

    } else if (step === 3) {
      // Social media validation
      if (formData.social.linkedin) {
        const linkedinError = validateLinkedIn(formData.social.linkedin);
        if (linkedinError) {
          newErrors.social.linkedin = linkedinError;
          hasErrors = true;
        } else {
          newErrors.social.linkedin = '';
        }
      }

      if (formData.social.instagram) {
        const instagramError = validateInstagram(formData.social.instagram);
        if (instagramError) {
          newErrors.social.instagram = instagramError;
          hasErrors = true;
        } else {
          newErrors.social.instagram = '';
        }
      }

      if (formData.social.twitter) {
        const twitterError = validateTwitter(formData.social.twitter);
        if (twitterError) {
          newErrors.social.twitter = twitterError;
          hasErrors = true;
        } else {
          newErrors.social.twitter = '';
        }
      }

      if (formData.social.whatsapp) {
        const whatsappError = validateWhatsApp(formData.social.whatsapp);
        if (whatsappError) {
          newErrors.social.whatsapp = whatsappError;
          hasErrors = true;
        } else {
          newErrors.social.whatsapp = '';
        }
      }
    }

    setErrors(newErrors);
    return !hasErrors;
  }, [errors, formData, validateEmail, validatePhone, validateWebsite, validateLinkedIn, validateInstagram, validateTwitter, validateWhatsApp]);

  const updatePersonalInfo = useCallback((field: keyof VCardFormData['personalInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors.personalInfo[field]) {
      setErrors(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          [field]: ''
        }
      }));
    }
  }, [errors.personalInfo]);

  const updateContact = useCallback((field: keyof VCardFormData['contact'], value: string) => {
    let processedValue = value;
    
    // Apply phone formatting
    if (field === 'phone') {
      processedValue = formatPhone(value);
    }
    
    // Apply website formatting
    if (field === 'website') {
      processedValue = formatWebsite(value);
    }
    
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: processedValue
      }
    }));
    
    // Clear error when user starts typing
    if (errors.contact[field]) {
      setErrors(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: ''
        }
      }));
    }
  }, [errors.contact, formatPhone, formatWebsite]);

  const updateSocial = useCallback((field: keyof VCardFormData['social'], value: string) => {
    setFormData(prev => ({
      ...prev,
      social: {
        ...prev.social,
        [field]: value
      }
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    // Validate all steps before submission
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);
    
    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      toast.error('Please fix all validation errors before submitting');
      // Go back to the first step with errors
      if (!isStep1Valid) {
        setCurrentStep(1);
      } else if (!isStep2Valid) {
        setCurrentStep(2);
      } else if (!isStep3Valid) {
        setCurrentStep(3);
      }
      return;
    }

    // Double-check required fields
    if (!formData.personalInfo.firstName || !formData.personalInfo.lastName) {
      toast.error('First name and last name are required');
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    try {
      const result = await vcardApi.create(formData);
      setVCard(result);
      setCurrentStep(4); // Show result
      toast.success('vCard created successfully!');
    } catch (error) {
      console.error('Error creating vCard:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create vCard');
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateStep]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await copyToClipboard(text);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  const handleDownload = useCallback(async () => {
    if (!vcard) return;
    
    try {
      await vcardApi.download(vcard.shortCode);
      toast.success('vCard downloaded!');
    } catch (error) {
      console.error('Error downloading vCard:', error);
      toast.error('Failed to download vCard');
    }
  }, [vcard]);

  const resetForm = useCallback(() => {
    setVCard(null);
    setCurrentStep(1);
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
        website: ''
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
  }, []);

  const renderStep = () => {
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
                Tell us about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <Input
                    value={formData.personalInfo.firstName}
                    onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                    placeholder="John"
                    required
                    className={errors.personalInfo.firstName ? 'border-red-500' : ''}
                  />
                  {errors.personalInfo.firstName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.personalInfo.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <Input
                    value={formData.personalInfo.lastName}
                    onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                    placeholder="Doe"
                    required
                    className={errors.personalInfo.lastName ? 'border-red-500' : ''}
                  />
                  {errors.personalInfo.lastName && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.personalInfo.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <Input
                  value={formData.personalInfo.company}
                  onChange={(e) => updatePersonalInfo('company', e.target.value)}
                  placeholder="Your Company Inc."
                  className={errors.personalInfo.company ? 'border-red-500' : ''}
                />
                {errors.personalInfo.company && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.personalInfo.company}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <Input
                  value={formData.personalInfo.title}
                  onChange={(e) => updatePersonalInfo('title', e.target.value)}
                  placeholder="Software Engineer"
                  className={errors.personalInfo.title ? 'border-red-500' : ''}
                />
                {errors.personalInfo.title && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.personalInfo.title}
                  </p>
                )}
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.personalInfo.firstName || !formData.personalInfo.lastName}
                >
                  Next: Contact Info
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
                How can people reach you?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  placeholder="john@example.com"
                  className={errors.contact.email ? 'border-red-500' : ''}
                />
                {errors.contact.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.contact.email}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                  className={errors.contact.phone ? 'border-red-500' : ''}
                />
                {errors.contact.phone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.contact.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <Input
                  type="url"
                  value={formData.contact.website}
                  onChange={(e) => updateContact('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className={errors.contact.website ? 'border-red-500' : ''}
                />
                {errors.contact.website && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.contact.website}
                  </p>
                )}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setCurrentStep(3)}>
                  Next: Social Media
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
                <Linkedin className="w-5 h-5" />
                Social Media & Theme
              </CardTitle>
              <CardDescription>
                Connect your social profiles and choose a style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Social Media</h3>
                <div>
                  <label className="block text-sm font-medium mb-1">LinkedIn</label>
                  <Input
                    value={formData.social.linkedin}
                    onChange={(e) => updateSocial('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/johndoe"
                    className={errors.social.linkedin ? 'border-red-500' : ''}
                  />
                  {errors.social.linkedin && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.social.linkedin}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp</label>
                  <Input
                    value={formData.social.whatsapp}
                    onChange={(e) => updateSocial('whatsapp', e.target.value)}
                    placeholder="+1234567890"
                    className={errors.social.whatsapp ? 'border-red-500' : ''}
                  />
                  {errors.social.whatsapp && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.social.whatsapp}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram</label>
                  <Input
                    value={formData.social.instagram}
                    onChange={(e) => updateSocial('instagram', e.target.value)}
                    placeholder="https://instagram.com/johndoe"
                    className={errors.social.instagram ? 'border-red-500' : ''}
                  />
                  {errors.social.instagram && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.social.instagram}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Twitter</label>
                  <Input
                    value={formData.social.twitter}
                    onChange={(e) => updateSocial('twitter', e.target.value)}
                    placeholder="https://twitter.com/johndoe"
                    className={errors.social.twitter ? 'border-red-500' : ''}
                  />
                  {errors.social.twitter && (
                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.social.twitter}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Choose Theme</h3>
                <Select value={formData.theme} onValueChange={(value: 'professional' | 'creative' | 'minimal') => setFormData(prev => ({ ...prev, theme: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <QrCode className="w-4 h-4 mr-2" />
                  )}
                  Create vCard
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        if (!vcard) return null;
        
        return (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Check className="w-5 h-5" />
                Your vCard is Ready!
              </CardTitle>
              <CardDescription>
                Share your digital business card with the world
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="inline-block p-4 bg-background rounded-lg border">
                  <Image 
                    src={vcard.qrCode} 
                    alt="vCard QR Code" 
                    width={192}
                    height={192}
                    className="mx-auto"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">vCard URL</p>
                    <p className="text-lg font-mono text-primary">{vcard.shortUrl}</p>
                  </div>
                  <Button
                    onClick={() => handleCopy(vcard.shortUrl)}
                    size="sm"
                    variant="outline"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid gap-3">
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Contact Card
                  </Button>
                  <Button onClick={() => window.open(vcard.shortUrl, '_blank')} variant="outline" className="w-full">
                    <Globe className="w-4 h-4 mr-2" />
                    Preview vCard
                  </Button>
                </div>

                <div className="flex justify-center">
                  <Button onClick={resetForm} variant="outline">
                    Create Another vCard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <QrCode className="w-3 h-3 mr-1" />
            Digital Business Card
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Create Your vCard
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Generate a beautiful digital business card with QR code that your contacts can save directly to their phones
          </p>
        </div>

        {/* Progress Steps */}
        {currentStep < 4 && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-border text-muted-foreground'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-primary' : 'bg-border'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>Personal</span>
              <span>Contact</span>
              <span>Social & Theme</span>
            </div>
          </div>
        )}

        {/* Form Steps */}
        {renderStep()}
      </div>
    </div>
  );
}
