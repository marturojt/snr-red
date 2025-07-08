import { VCard, IVCard } from '../models/VCard';
import QRCode from 'qrcode';
import { createError } from '../middleware/errorHandler';

export interface CreateVCardData {
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
  social?: {
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
  theme?: 'professional' | 'creative' | 'minimal';
}

class VCardService {
  private readonly baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  async createVCard(data: CreateVCardData): Promise<IVCard> {
    try {
      // Generate unique short code
      let shortCode: string;
      let isUnique = false;
      let attempts = 0;

      do {
        shortCode = generateRandomString(8);
        const existing = await VCard.findOne({ shortCode, isActive: true });
        isUnique = !existing;
        attempts++;
        
        if (attempts > 10) {
          throw createError(500, 'Unable to generate unique short code');
        }
      } while (!isUnique);

      // Generate URLs
      const shortUrl = `${this.baseUrl}/v/${shortCode}`;
      
      // Generate QR Code
      const qrCode = await QRCode.toDataURL(shortUrl, {
        errorCorrectionLevel: 'M',
        width: 512,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create vCard
      const vcard = new VCard({
        userId: data.userId,
        personalInfo: data.personalInfo,
        contact: data.contact,
        social: data.social || {},
        address: data.address,
        theme: data.theme || 'professional',
        qrCode,
        shortUrl,
        shortCode,
        views: 0,
        saves: 0,
        isActive: true
      });

      return await vcard.save();
    } catch (error) {
      console.error('Error creating vCard:', error);
      throw createError(500, 'Failed to create vCard');
    }
  }

  async getVCardByShortCode(shortCode: string): Promise<IVCard | null> {
    try {
      const vcard = await VCard.findOne({ shortCode, isActive: true });
      return vcard;
    } catch (error) {
      console.error('Error fetching vCard:', error);
      throw createError(500, 'Failed to fetch vCard');
    }
  }

  async getVCardsByUserId(userId: string): Promise<IVCard[]> {
    try {
      const vcards = await VCard.find({ 
        userId, 
        isActive: true 
      }).sort({ createdAt: -1 });
      
      return vcards;
    } catch (error) {
      console.error('Error fetching user vCards:', error);
      throw createError(500, 'Failed to fetch vCards');
    }
  }

  async incrementViews(vcardId: string): Promise<void> {
    try {
      await VCard.findByIdAndUpdate(
        vcardId,
        { $inc: { views: 1 } },
        { new: true }
      );
    } catch (error) {
      console.error('Error incrementing views:', error);
      // Don't throw error for analytics failures
    }
  }

  async incrementSaves(vcardId: string): Promise<void> {
    try {
      await VCard.findByIdAndUpdate(
        vcardId,
        { $inc: { saves: 1 } },
        { new: true }
      );
    } catch (error) {
      console.error('Error incrementing saves:', error);
      // Don't throw error for analytics failures
    }
  }

  async updateVCard(vcardId: string, userId: string, updateData: Partial<CreateVCardData>): Promise<IVCard | null> {
    try {
      const vcard = await VCard.findOneAndUpdate(
        { _id: vcardId, userId, isActive: true },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        },
        { new: true }
      );

      return vcard;
    } catch (error) {
      console.error('Error updating vCard:', error);
      throw createError(500, 'Failed to update vCard');
    }
  }

  async deleteVCard(vcardId: string, userId: string): Promise<boolean> {
    try {
      const result = await VCard.findOneAndUpdate(
        { _id: vcardId, userId, isActive: true },
        { isActive: false },
        { new: true }
      );

      return !!result;
    } catch (error) {
      console.error('Error deleting vCard:', error);
      throw createError(500, 'Failed to delete vCard');
    }
  }

  generateVCardFile(vcard: IVCard): string {
    const { personalInfo, contact, address, social } = vcard;
    
    let vcfContent = 'BEGIN:VCARD\n';
    vcfContent += 'VERSION:3.0\n';
    
    // Name
    vcfContent += `FN:${personalInfo.firstName} ${personalInfo.lastName}\n`;
    vcfContent += `N:${personalInfo.lastName};${personalInfo.firstName};;;\n`;
    
    // Organization
    if (personalInfo.company) {
      vcfContent += `ORG:${personalInfo.company}\n`;
    }
    
    // Title
    if (personalInfo.title) {
      vcfContent += `TITLE:${personalInfo.title}\n`;
    }
    
    // Phone
    if (contact.phone) {
      vcfContent += `TEL;TYPE=WORK,VOICE:${contact.phone}\n`;
    }
    
    // Email
    if (contact.email) {
      vcfContent += `EMAIL;TYPE=WORK:${contact.email}\n`;
    }
    
    // Website
    if (contact.website) {
      vcfContent += `URL:${contact.website}\n`;
    }
    
    // Address
    if (address && (address.street || address.city || address.country)) {
      const addrParts = [
        address.street || '',
        address.city || '',
        address.state || '',
        address.zipCode || '',
        address.country || ''
      ];
      vcfContent += `ADR;TYPE=WORK:;;${addrParts.join(';')}\n`;
    }
    
    // Social Networks (as URLs)
    if (social.linkedin) {
      vcfContent += `URL;TYPE=LinkedIn:${social.linkedin}\n`;
    }
    if (social.instagram) {
      vcfContent += `URL;TYPE=Instagram:${social.instagram}\n`;
    }
    if (social.twitter) {
      vcfContent += `URL;TYPE=Twitter:${social.twitter}\n`;
    }
    
    // Generated by
    vcfContent += 'NOTE:Generated by SNR.red\n';
    
    vcfContent += 'END:VCARD';
    
    return vcfContent;
  }
}

// Helper function to generate random string (if not imported)
function generateRandomString(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const vcardService = new VCardService();
