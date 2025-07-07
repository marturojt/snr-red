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
  Linkedin
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

  const updatePersonalInfo = useCallback((field: keyof VCardFormData['personalInfo'], value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  }, []);

  const updateContact = useCallback((field: keyof VCardFormData['contact'], value: string) => {
    setFormData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  }, []);

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
    if (!formData.personalInfo.firstName || !formData.personalInfo.lastName) {
      toast.error('First name and last name are required');
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
  }, [formData]);

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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name *</label>
                  <Input
                    value={formData.personalInfo.lastName}
                    onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <Input
                  value={formData.personalInfo.company}
                  onChange={(e) => updatePersonalInfo('company', e.target.value)}
                  placeholder="Your Company Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <Input
                  value={formData.personalInfo.title}
                  onChange={(e) => updatePersonalInfo('title', e.target.value)}
                  placeholder="Software Engineer"
                />
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
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <Input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <Input
                  type="url"
                  value={formData.contact.website}
                  onChange={(e) => updateContact('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
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
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp</label>
                  <Input
                    value={formData.social.whatsapp}
                    onChange={(e) => updateSocial('whatsapp', e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram</label>
                  <Input
                    value={formData.social.instagram}
                    onChange={(e) => updateSocial('instagram', e.target.value)}
                    placeholder="https://instagram.com/johndoe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Twitter</label>
                  <Input
                    value={formData.social.twitter}
                    onChange={(e) => updateSocial('twitter', e.target.value)}
                    placeholder="https://twitter.com/johndoe"
                  />
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
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Check className="w-5 h-5" />
                Your vCard is Ready!
              </CardTitle>
              <CardDescription>
                Share your digital business card with the world
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg border">
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
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-1">vCard URL</p>
                    <p className="text-lg font-mono text-blue-600">{vcard.shortUrl}</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <QrCode className="w-3 h-3 mr-1" />
            Digital Business Card
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your vCard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
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
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
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
