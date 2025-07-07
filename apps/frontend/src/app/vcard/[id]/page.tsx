'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Download,
  Share2,
  QrCode,
  ArrowLeft,
  Linkedin,
  Instagram,
  Twitter,
  MessageCircle
} from 'lucide-react';
import { vcardApi } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

// vCard interfaces (temporary until types package is updated)
interface VCardData {
  id: string;
  userId?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    company?: string;
    title?: string;
    photo?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  social: {
    linkedin?: string;
    whatsapp?: string;
    instagram?: string;
    twitter?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  theme: 'professional' | 'creative' | 'minimal';
  qrCode: string;
  shortUrl: string;
  shortCode: string;
  views: number;
  saves: number;
  createdAt: Date;
  updatedAt: Date;
  qrCodeUrl?: string;
}

export default function VCardPage() {
  const { id } = useParams();
  const [vcard, setVcard] = useState<VCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchVCard(id as string);
    }
  }, [id]);

  const fetchVCard = async (vcardId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await vcardApi.getByShortCode(vcardId);
      setVcard(data);
    } catch (err) {
      console.error('Error fetching vCard:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vCard');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!vcard) return;
    
    try {
      await vcardApi.download(vcard.shortCode);
      toast.success('vCard downloaded successfully');
    } catch (error) {
      console.error('Error downloading vCard:', error);
      toast.error('Failed to download vCard');
    }
  };

  const handleShare = async () => {
    if (!vcard) return;
    
    const shareData = {
      title: `${vcard.personalInfo.firstName} ${vcard.personalInfo.lastName}`,
      text: `Check out ${vcard.personalInfo.firstName}'s digital business card`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error('Failed to share');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vCard...</p>
        </div>
      </div>
    );
  }

  if (error || !vcard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">vCard Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The vCard you are looking for does not exist.'}</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Button onClick={handleShare} variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button onClick={handleDownload} size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-6">
              {vcard.personalInfo.photo ? (
                <img
                  src={vcard.personalInfo.photo}
                  alt={`${vcard.personalInfo.firstName} ${vcard.personalInfo.lastName}`}
                  className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white"
                />
              ) : (
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
              <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white">
                Active
              </Badge>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {vcard.personalInfo.firstName} {vcard.personalInfo.lastName}
            </h1>
            
            {vcard.personalInfo.title && (
              <p className="text-xl text-gray-600 mb-2">{vcard.personalInfo.title}</p>
            )}
            
            {vcard.personalInfo.company && (
              <p className="text-lg text-gray-500 flex items-center justify-center">
                <Building className="w-4 h-4 mr-1" />
                {vcard.personalInfo.company}
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vcard.contact.email && (
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-3 text-gray-400" />
                    <a href={`mailto:${vcard.contact.email}`} className="text-blue-600 hover:underline">
                      {vcard.contact.email}
                    </a>
                  </div>
                )}
                
                {vcard.contact.phone && (
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-3 text-gray-400" />
                    <a href={`tel:${vcard.contact.phone}`} className="text-blue-600 hover:underline">
                      {vcard.contact.phone}
                    </a>
                  </div>
                )}
                
                {vcard.contact.website && (
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-3 text-gray-400" />
                    <a href={vcard.contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {vcard.contact.website}
                    </a>
                  </div>
                )}
                
                {vcard.address && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-gray-600">
                      {[vcard.address.street, vcard.address.city, vcard.address.state, vcard.address.country]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Share2 className="w-5 h-5 mr-2" />
                  Social Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vcard.social.linkedin && (
                  <div className="flex items-center">
                    <Linkedin className="w-4 h-4 mr-3 text-blue-600" />
                    <a href={vcard.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      LinkedIn
                    </a>
                  </div>
                )}
                
                {vcard.social.twitter && (
                  <div className="flex items-center">
                    <Twitter className="w-4 h-4 mr-3 text-blue-400" />
                    <a href={vcard.social.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Twitter
                    </a>
                  </div>
                )}
                
                {vcard.social.instagram && (
                  <div className="flex items-center">
                    <Instagram className="w-4 h-4 mr-3 text-pink-600" />
                    <a href={vcard.social.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Instagram
                    </a>
                  </div>
                )}
                
                {vcard.social.whatsapp && (
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 mr-3 text-green-600" />
                    <a href={`https://wa.me/${vcard.social.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      WhatsApp
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* QR Code */}
          {vcard.qrCodeUrl && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <QrCode className="w-5 h-5 mr-2" />
                  QR Code
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="inline-block p-4 bg-white rounded-lg shadow-md">
                  <Image 
                    src={vcard.qrCodeUrl} 
                    alt="vCard QR Code" 
                    width={192}
                    height={192}
                    className="mx-auto"
                  />
                </div>
                <p className="text-gray-600 mt-4">
                  Scan this QR code to save contact information to your phone
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
