export type UserRole = 'admin' | 'member' | 'user';

export interface AdminUser {
  uid: string;
  email: string;
  fullName: string;
  role: 'admin' | 'super_admin';
  createdAt: string;
}

export interface WebsiteUser {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Other' | 'Prefer not to say';
  status: 'active';
  createdAt: string;
  updatedAt: string;
}

export interface Member {
  id: string;
  memberCode: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  dateOfBirth?: string;
  gender: 'Male' | 'Other' | 'Prefer not to say';
  phone: string;
  authUid: string;
  status: 'active' | 'inactive' | 'pending';
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  durationLabel: string;
  durationDays: number;
  price: number;
  currency: string;
  description: string;
  benefits: string[];
  includedFacilities: string[];
  trainingBenefits: string[];
  status: 'active' | 'inactive';
  isPopular: boolean;
  sortOrder: number;
}

export interface MemberSubscription {
  id: string;
  memberId: string;
  memberUid: string;
  memberEmail: string;
  memberName: string;
  planId: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  trainerId: string;
  trainerName: string;
  trainerSpecialization: string;
  trainerPhone: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Trainer {
  id: string;
  fullName: string;
  imageUrl: string;
  qualifications: string;
  experience: string;
  specialization: string;
  bio: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface TrainingSchedule {
  id: string;
  memberId: string;
  memberUid: string;
  memberEmail: string;
  memberName: string;
  subscriptionId: string;
  trainerId: string;
  trainerName: string;
  trainingDays: string;
  timings: string;
  trainingType: string;
  instructions: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberUid: string;
  memberEmail: string;
  memberName: string;
  subscriptionId: string;
  date: string;
  status: 'present' | 'absent';
  notes: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberUid: string;
  memberEmail: string;
  memberName: string;
  subscriptionId: string;
  planName: string;
  amount: number;
  status: 'paid' | 'unpaid';
  paymentDate: string;
  method: string;
  notes: string;
  createdAt: string;
}

export interface ProgressRecord {
  id: string;
  memberId: string;
  memberUid: string;
  memberEmail: string;
  memberName: string;
  measurementDate: string;
  fullBody: number;
  chest: number;
  biceps: number;
  waist: number;
  thighs: number;
  shoulders: number;
  weight: number;
  bodyFat: number;
  notes: string;
  recordedBy: string;
  createdAt: string;
}

export interface WorkoutExercise {
  exerciseName: string;
  trainingDay: string;
  sets: string;
  reps: string;
  instructions: string;
}

export interface WorkoutPlan {
  id: string;
  memberId: string;
  memberUid: string;
  memberEmail: string;
  memberName: string;
  title: string;
  trainerName: string;
  trainerNotes: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberNotification {
  id: string;
  memberId: string;
  memberUid: string;
  memberEmail: string;
  type: 'expiry_reminder' | 'payment_due' | 'schedule_update' | 'trainer_update' | 'announcement';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Facility {
  id: string;
  name: string;
  category: string;
  description: string;
  benefits: string[];
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface FitnessClass {
  id: string;
  name: string;
  description: string;
  duration: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  schedule: string;
  imageUrl: string;
  isActive: boolean;
}

export interface ShopCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
}

export interface ShopProduct {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  isFeatured: boolean;
  isAvailable: boolean;
}

export interface BranchItem {
  name: string;
  address: string;
  hours: string;
  phone: string;
  isPlaceholder?: boolean;
}

export interface AchievementItem {
  title: string;
  year: string;
  category: 'Achievement' | 'Certificate' | 'Award' | 'Milestone';
  details: string;
  isPlaceholder?: boolean;
}

export interface AboutContent {
  headline: string;
  introduction: string;
  history: string;
  vision: string;
  mission: string;
  ownershipTitle: string;
  ownershipDetails: string;
  branches: BranchItem[];
  achievements: AchievementItem[];
}

export interface ContactContent {
  address: string;
  phone: string;
  email: string;
  openingHours: string;
  mapLabel: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
}

export interface WebsiteAnnouncement {
  id: string;
  title: string;
  message: string;
  audience: 'public' | 'members';
  isActive: boolean;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  type: 'contact' | 'membership_registration';
  name: string;
  email: string;
  phone: string;
  message: string;
  requestedPlanId: string;
  requestedPlanName: string;
  age: number;
  gender: string;
  status: 'new' | 'contacted' | 'approved' | 'archived';
  createdAt: string;
}
