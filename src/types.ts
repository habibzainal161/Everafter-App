/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InvitationMode = 'print' | 'digital';

export interface Customer {
  id: string;
  // Groom's Info
  groomName: string;
  groomNickname?: string;
  groomParents: string;
  groomInstagram?: string;
  groomAddress?: string;
  
  // Bride's Info
  brideName: string;
  brideNickname?: string;
  brideParents: string;
  brideInstagram?: string;
  brideAddress?: string;

  // Event Details
  eventDate: string;
  matrimonyTime: string; // Akad/Pemberkatan
  receptionTime?: string;
  locationName: string;
  locationAddress: string;
  mapsUrl?: string;
  
  // Content & Messaging
  openingMessage?: string;
  quote?: string;
  prayer?: string;
  journeyOfLove?: string;
  loveStory?: { date: string; title: string; description: string }[];
  
  // Financial & RSVP
  bankAccounts?: { bankName: string; accountHolder: string; accountNumber: string }[];
  rsvpNumber?: string;
  
  // Metadata
  phoneNumber: string;
  email?: string;
  createdAt: number;
}

export interface Template {
  id: string;
  name: string;
  mode: InvitationMode;
  thumbnail: string;
  category: 'minimalist' | 'elegant' | 'modern' | 'floral';
  config: any; // Specific config for the template
}

export interface Project {
  id: string;
  customerId: string;
  templateId: string;
  mode: InvitationMode;
  status: 'draft' | 'completed';
  data: {
    customText?: string;
    sections?: string[]; // Toggleable sections
    photos?: string[]; // URLs or base64
    notes?: string;
    guestList?: string[]; // List of guest names
    preweddingAssets?: {
      type: 'image' | 'video';
      url: string;
      publicId: string;
    }[];
    coverPhoto?: { type: 'image' | 'video'; url: string; publicId: string; };
    openingPhoto?: { type: 'image' | 'video'; url: string; publicId: string; };
    quotePhoto?: { type: 'image' | 'video'; url: string; publicId: string; };
    parallaxTopPhoto?: { type: 'image' | 'video'; url: string; publicId: string; };
    parallaxBottomPhoto?: { type: 'image' | 'video'; url: string; publicId: string; };
    groomPhoto?: { type: 'image' | 'video'; url: string; publicId: string; };
    bridePhoto?: { type: 'image' | 'video'; url: string; publicId: string; };
    journeyPhoto?: { type: 'image' | 'video'; url: string; publicId: string; };
    videoThumbnail?: { type: 'image' | 'video'; url: string; publicId: string; };
    assetPosition?: 'top' | 'center' | 'bottom';
    assetScale?: number;
    assetOffsetY?: number;
    assetOffsetX?: number;
    titleFontSize?: number;
    bodyFontSize?: number;
    musicUrl?: string;
    loopAnimations?: boolean;
    wishes?: {
      id: string;
      name: string;
      message: string;
      attendance: 'attend' | 'not_attend';
      createdAt: number;
    }[];
    elementStyles?: Record<string, { x?: number; y?: number; scale?: number; rotation?: number; opacity?: number }>;
  };
  createdAt: number;
  updatedAt: number;
}
