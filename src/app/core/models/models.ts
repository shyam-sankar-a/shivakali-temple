export interface Deity {
  _id: string;
  name: string;
  description: string;
  iconEmoji: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Pooja {
  _id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  deity: 'Kali' | 'Durga' | 'Both';
  timings: string[];
  isActive: boolean;
}

export interface Devotee {
  name: string;
  nakshatra: string;
  phone: string;
}

export interface PoojaBooking {
  _id: string;
  pooja: string | Pooja;
  poojaName: string;
  extraPoojaNames?: string[];
  bookedDate: string;
  devotees: Devotee[];
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'pay_at_temple' | 'failed';
  paymentMethod: 'online' | 'pay_at_temple' | 'cash' | 'upi' | 'card' | 'cheque';
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  deityName?: string;
  deityId?: string;
  bookingSource?: 'online' | 'offline';
  receiptNumber?: string;
  collectedBy?: string;
}

export interface Donation {
  _id: string;
  donorName: string;
  donorPhone?: string;
  donorEmail?: string;
  amount: number;
  purpose: 'General' | 'Annadanam' | 'Temple Renovation' | 'Festival' | 'Education' | 'Other';
  paymentMethod: 'online' | 'cash' | 'upi' | 'card' | 'cheque' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed';
  bookingSource: 'online' | 'offline';
  collectedBy?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface AuditSummary {
  poojaRevenue: number;
  donationRevenue: number;
  totalRevenue: number;
  totalBookings: number;
  totalDonations: number;
  onlineBookings: number;
  offlineBookings: number;
  byDeity: { deity: string; count: number; revenue: number }[];
  byPooja: { name: string; count: number; revenue: number }[];
  byPaymentMethod: { method: string; count: number; revenue: number }[];
  dailyRevenue: { date: string; poojaRevenue: number; donationRevenue: number }[];
}

export interface GalleryImage {
  _id: string;
  title: string;
  imageUrl: string;
  category: string;
  isVisible: boolean;
}

export interface Employee {
  _id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
  phone: string;
  email: string;
}

export interface TempleEvent {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
  isHighlight: boolean;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  adminStatus: 'active' | 'inactive';
}

export const NAKSHATRAS = [
  'Ashwini','Bharani','Krittika','Rohini','Mrigashira','Ardra','Punarvasu',
  'Pushya','Ashlesha','Magha','Purva Phalguni','Uttara Phalguni','Hasta',
  'Chitra','Swati','Vishakha','Anuradha','Jyeshtha','Mula','Purva Ashadha',
  'Uttara Ashadha','Shravana','Dhanishtha','Shatabhisha','Purva Bhadrapada',
  'Uttara Bhadrapada','Revati',
];
