import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { FITCORE_IMAGES } from '../lib/assets';
import {
  db,
  getSecondaryAuthApp,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import type {
  AboutContent,
  AdminUser,
  AttendanceRecord,
  ContactContent,
  Facility,
  FitnessClass,
  Inquiry,
  Member,
  MemberNotification,
  MembershipPlan,
  MemberSubscription,
  PaymentRecord,
  ProgressRecord,
  ShopCategory,
  ShopProduct,
  TrainingSchedule,
  Trainer,
  WebsiteAnnouncement,
  WebsiteUser,
  WorkoutPlan,
} from '../types/fitcore';

export const DEFAULT_ABOUT_CONTENT: AboutContent = {
  headline: 'Built for Strength. Engineered for Consistency.',
  introduction:
    'FitCore is a strength and conditioning facility built around structured programming, calibrated equipment, and measurable member progression.',
  history:
    'Placeholder: Add FitCore founding story, year established, and early training philosophy via Admin Dashboard -> Website Content.',
  vision:
    'To provide a disciplined, data-backed training environment where every member has clear programming, verified progress tracking, and dedicated coaching.',
  mission:
    'Deliver structured strength training, modern commercial equipment, and transparent member management under one unified roof.',
  ownershipTitle: 'Ownership & Leadership (Editable Placeholder)',
  ownershipDetails:
    'Placeholder: Update founder, managing director, and certified coaching leadership details in Admin Dashboard -> Website Content.',
  branches: [
    {
      name: 'Main Flagship Branch (Editable Placeholder)',
      address: 'Placeholder: Enter street address, sector, and city in Admin Dashboard',
      hours: 'Mon–Sat: 6:00 AM – 11:00 PM · Sun: 8:00 AM – 8:00 PM',
      phone: '+92 300 0000000',
      isPlaceholder: true,
    },
  ],
  achievements: [
    {
      title: 'Certified Coaching Standard (Editable Placeholder)',
      year: '2026',
      category: 'Certificate',
      details: 'Placeholder: Add verified gym certifications, safety accreditations, or federation memberships from Admin Dashboard.',
      isPlaceholder: true,
    },
    {
      title: 'Regional Strength & Conditioning Milestone (Editable Placeholder)',
      year: '2026',
      category: 'Award',
      details: 'Placeholder: Add official gym awards, competition records, or community milestones from Admin Dashboard.',
      isPlaceholder: true,
    },
  ],
};

export const DEFAULT_CONTACT_CONTENT: ContactContent = {
  address: 'Plot 14, Athletic District, Main Boulevard (Editable in Admin)',
  phone: '+92 300 5550199',
  email: 'contact@fitcore-gym.example',
  openingHours: 'Mon – Sat: 6:00 AM – 11:00 PM | Sun: 8:00 AM – 8:00 PM',
  mapLabel: 'FitCore Main Training Facility — Central Commercial Zone',
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
};

function sanitizeStringList(items: string[], max = 20): string[] {
  return items
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

// ---------- PUBLIC READS & REALTIME SUBSCRIPTIONS ----------

export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onData: (rows: T[]) => void,
  onError?: (err: Error) => void,
  constraints: ReturnType<typeof where>[] = []
): Unsubscribe {
  const colRef = collection(db, collectionName);
  const q = constraints.length > 0 ? query(colRef, ...constraints) : query(colRef);
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<T, 'id'>) } as T));
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, collectionName);
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function getSiteContent<T>(sectionKey: string, fallback: T): Promise<T> {
  try {
    const ref = doc(db, 'siteContent', sectionKey);
    const snap = await getDoc(ref);
    if (!snap.exists()) return fallback;
    const raw = snap.data();
    return (raw?.data as T) ?? fallback;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `siteContent/${sectionKey}`);
  }
}

export async function saveSiteContent(sectionKey: string, data: Record<string, unknown>): Promise<void> {
  try {
    await setDoc(doc(db, 'siteContent', sectionKey), {
      sectionKey: sectionKey.slice(0, 60),
      data,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `siteContent/${sectionKey}`);
  }
}

export async function listFacilities(): Promise<Facility[]> {
  try {
    const snap = await getDocs(query(collection(db, 'facilities'), orderBy('sortOrder', 'asc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Facility, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'facilities');
  }
}

export async function saveFacility(id: string | null, data: Omit<Facility, 'id'>): Promise<string> {
  const payload = {
    name: data.name.trim().slice(0, 120),
    category: data.category.trim().slice(0, 80),
    description: data.description.trim().slice(0, 800),
    benefits: sanitizeStringList(data.benefits),
    imageUrl: data.imageUrl.trim().slice(0, 600),
    sortOrder: Number(data.sortOrder) || 0,
    isActive: Boolean(data.isActive),
  };
  try {
    if (id) {
      await setDoc(doc(db, 'facilities', id), payload);
      return id;
    }
    const created = await addDoc(collection(db, 'facilities'), payload);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'facilities');
  }
}

export async function deleteFacility(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'facilities', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `facilities/${id}`);
  }
}

export async function listMembershipPlans(): Promise<MembershipPlan[]> {
  try {
    const snap = await getDocs(query(collection(db, 'membershipPlans'), orderBy('sortOrder', 'asc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MembershipPlan, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'membershipPlans');
  }
}

export async function saveMembershipPlan(id: string | null, data: Omit<MembershipPlan, 'id'>): Promise<string> {
  const payload = {
    name: data.name.trim().slice(0, 100),
    durationLabel: data.durationLabel.trim().slice(0, 60),
    durationDays: Math.max(1, Number(data.durationDays) || 30),
    price: Math.max(0, Number(data.price) || 0),
    currency: (data.currency && data.currency !== 'USD' ? data.currency : 'PKR').trim().slice(0, 10),
    description: (data.description || '').trim().slice(0, 500),
    benefits: sanitizeStringList(data.benefits),
    includedFacilities: sanitizeStringList(data.includedFacilities),
    trainingBenefits: sanitizeStringList(data.trainingBenefits),
    status: data.status === 'inactive' ? 'inactive' : 'active',
    isPopular: Boolean(data.isPopular),
    sortOrder: Number(data.sortOrder) || 0,
  };
  try {
    if (id) {
      await setDoc(doc(db, 'membershipPlans', id), payload);
      return id;
    }
    const created = await addDoc(collection(db, 'membershipPlans'), payload);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'membershipPlans');
  }
}

export async function deleteMembershipPlan(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'membershipPlans', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `membershipPlans/${id}`);
  }
}

export async function listClasses(): Promise<FitnessClass[]> {
  try {
    const snap = await getDocs(collection(db, 'classes'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FitnessClass, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'classes');
  }
}

export async function saveClass(id: string | null, data: Omit<FitnessClass, 'id'>): Promise<string> {
  const payload = {
    name: data.name.trim().slice(0, 120),
    description: data.description.trim().slice(0, 800),
    duration: data.duration.trim().slice(0, 60),
    difficultyLevel: data.difficultyLevel,
    schedule: data.schedule.trim().slice(0, 160),
    imageUrl: data.imageUrl.trim().slice(0, 600),
    isActive: Boolean(data.isActive),
  };
  try {
    if (id) {
      await setDoc(doc(db, 'classes', id), payload);
      return id;
    }
    const created = await addDoc(collection(db, 'classes'), payload);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'classes');
  }
}

export async function deleteClass(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'classes', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `classes/${id}`);
  }
}

export async function listTrainers(): Promise<Trainer[]> {
  try {
    const snap = await getDocs(collection(db, 'trainers'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Trainer, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'trainers');
  }
}

export async function saveTrainer(id: string | null, data: Omit<Trainer, 'id'>): Promise<string> {
  const payload = {
    fullName: data.fullName.trim().slice(0, 120),
    imageUrl: data.imageUrl.trim().slice(0, 600),
    qualifications: data.qualifications.trim().slice(0, 300),
    experience: data.experience.trim().slice(0, 100),
    specialization: data.specialization.trim().slice(0, 160),
    bio: data.bio.trim().slice(0, 800),
    phone: data.phone.trim().slice(0, 30),
    status: data.status === 'inactive' ? 'inactive' : 'active',
  };
  try {
    if (id) {
      await setDoc(doc(db, 'trainers', id), payload);
      return id;
    }
    const created = await addDoc(collection(db, 'trainers'), payload);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'trainers');
  }
}

export async function listShopCategories(): Promise<ShopCategory[]> {
  try {
    const snap = await getDocs(query(collection(db, 'shopCategories'), orderBy('sortOrder', 'asc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ShopCategory, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'shopCategories');
  }
}

export async function saveShopCategory(id: string | null, data: Omit<ShopCategory, 'id'>): Promise<string> {
  const payload = {
    name: data.name.trim().slice(0, 80),
    slug: data.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 80),
    sortOrder: Number(data.sortOrder) || 0,
  };
  try {
    if (id) {
      await setDoc(doc(db, 'shopCategories', id), payload);
      return id;
    }
    const created = await addDoc(collection(db, 'shopCategories'), payload);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'shopCategories');
  }
}

export async function deleteShopCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'shopCategories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `shopCategories/${id}`);
  }
}

export async function listShopProducts(): Promise<ShopProduct[]> {
  try {
    const snap = await getDocs(collection(db, 'shopProducts'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ShopProduct, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'shopProducts');
  }
}

export async function saveShopProduct(id: string | null, data: Omit<ShopProduct, 'id'>): Promise<string> {
  const payload = {
    name: data.name.trim().slice(0, 140),
    brand: data.brand.trim().slice(0, 80),
    description: data.description.trim().slice(0, 800),
    price: Math.max(0, Number(data.price) || 0),
    category: data.category.trim().slice(0, 80),
    stock: Math.max(0, Number(data.stock) || 0),
    imageUrl: data.imageUrl.trim().slice(0, 600),
    isFeatured: Boolean(data.isFeatured),
    isAvailable: Boolean(data.isAvailable),
  };
  try {
    if (id) {
      await setDoc(doc(db, 'shopProducts', id), payload);
      return id;
    }
    const created = await addDoc(collection(db, 'shopProducts'), payload);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'shopProducts');
  }
}

export async function deleteShopProduct(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'shopProducts', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `shopProducts/${id}`);
  }
}

export async function listAnnouncements(): Promise<WebsiteAnnouncement[]> {
  try {
    const snap = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WebsiteAnnouncement, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'announcements');
  }
}

export async function saveAnnouncement(data: Omit<WebsiteAnnouncement, 'id'>): Promise<string> {
  try {
    const created = await addDoc(collection(db, 'announcements'), {
      title: data.title.trim().slice(0, 140),
      message: data.message.trim().slice(0, 1000),
      audience: data.audience === 'members' ? 'members' : 'public',
      isActive: Boolean(data.isActive),
      createdAt: data.createdAt || new Date().toISOString(),
    });
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'announcements');
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'announcements', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
  }
}

// ---------- INQUIRIES (PUBLIC WRITE, ADMIN READ/MANAGE) ----------

export async function submitInquiry(
  data: Omit<Inquiry, 'id' | 'status' | 'createdAt'>
): Promise<string> {
  try {
    const created = await addDoc(collection(db, 'inquiries'), {
      type: data.type,
      name: data.name.trim().slice(0, 120),
      email: data.email.trim().toLowerCase().slice(0, 200),
      phone: data.phone.trim().slice(0, 30),
      message: (data.message || '').trim().slice(0, 1500),
      requestedPlanId: (data.requestedPlanId || '').slice(0, 128),
      requestedPlanName: (data.requestedPlanName || '').slice(0, 100),
      age: Number(data.age) || 0,
      gender: (data.gender || '').slice(0, 30),
      status: 'new',
      createdAt: new Date().toISOString(),
    });
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'inquiries');
  }
}

export async function listInquiries(): Promise<Inquiry[]> {
  try {
    const snap = await getDocs(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Inquiry, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'inquiries');
  }
}

export async function updateInquiryStatus(
  id: string,
  status: Inquiry['status'],
  existingInquiry: Inquiry
): Promise<void> {
  try {
    await setDoc(doc(db, 'inquiries', id), {
      type: existingInquiry.type,
      name: existingInquiry.name,
      email: existingInquiry.email,
      phone: existingInquiry.phone,
      message: existingInquiry.message,
      requestedPlanId: existingInquiry.requestedPlanId,
      requestedPlanName: existingInquiry.requestedPlanName,
      age: existingInquiry.age,
      gender: existingInquiry.gender,
      status,
      createdAt: existingInquiry.createdAt,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `inquiries/${id}`);
  }
}

// ---------- ADMIN: MEMBERS, SUBSCRIPTIONS, SCHEDULES, ATTENDANCE, PAYMENTS, PROGRESS, WORKOUTS ----------

export async function ensureAdminDocument(user: {
  uid: string;
  email: string;
  displayName: string | null;
}): Promise<AdminUser | null> {
  try {
    const ref = doc(db, 'admins', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as AdminUser;
    }
    const payload: AdminUser = {
      uid: user.uid,
      email: user.email.toLowerCase(),
      fullName: (user.displayName || 'FitCore Administrator').slice(0, 120),
      role: 'super_admin',
      createdAt: new Date().toISOString(),
    };
    await setDoc(ref, payload);
    return payload;
  } catch {
    return null;
  }
}

export async function getWebsiteUser(uid: string): Promise<WebsiteUser | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as WebsiteUser;
  } catch {
    return null;
  }
}

export async function saveWebsiteUser(user: WebsiteUser): Promise<WebsiteUser> {
  const payload: WebsiteUser = {
    uid: user.uid,
    fullName: user.fullName.trim().slice(0, 120),
    email: user.email.trim().toLowerCase().slice(0, 200),
    phone: (user.phone || '').trim().slice(0, 30),
    age: Math.max(12, Math.min(110, Number(user.age) || 24)),
    gender: user.gender,
    status: 'active',
    createdAt: user.createdAt,
    updatedAt: new Date().toISOString(),
  };
  try {
    await setDoc(doc(db, 'users', payload.uid), payload);
    return payload;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${payload.uid}`);
  }
}

export function generateRandomMemberPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '@#$%';
  const all = upper + lower + digits + symbols;
  const pick = (pool: string) => pool[Math.floor(Math.random() * pool.length)];
  const chars = [
    'F',
    'C',
    pick(symbols),
    pick(upper),
    pick(lower),
    pick(digits),
    pick(upper),
    pick(lower),
    pick(digits),
    pick(all),
    pick(all),
  ];
  return chars.join('');
}

export async function listAllMembers(): Promise<Member[]> {
  try {
    const snap = await getDocs(query(collection(db, 'members'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Member, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'members');
  }
}

export async function findMemberByAuthOrEmail(uid: string, email: string): Promise<Member | null> {
  try {
    const byUidSnap = await getDocs(query(collection(db, 'members'), where('authUid', '==', uid)));
    if (!byUidSnap.empty) {
      const d = byUidSnap.docs[0];
      return { id: d.id, ...(d.data() as Omit<Member, 'id'>) };
    }
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    const byEmailSnap = await getDocs(
      query(collection(db, 'members'), where('email', '==', normalizedEmail))
    );
    if (!byEmailSnap.empty) {
      const d = byEmailSnap.docs[0];
      const member = { id: d.id, ...(d.data() as Omit<Member, 'id'>) };
      if (!member.authUid) {
        await updateDoc(doc(db, 'members', d.id), {
          authUid: uid,
          updatedAt: new Date().toISOString(),
        });
        member.authUid = uid;
      }
      return member;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'members');
  }
}

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  dateOfBirth: string;
  gender: Member['gender'];
  phone: string;
  temporaryPassword: string;
  plan: MembershipPlan;
  startDate: string;
  expiryDate: string;
  trainer: Trainer | null;
  paymentStatus: 'paid' | 'unpaid';
  inquiryIdToApprove?: string;
}

export interface CreateMemberResult {
  memberId: string;
  memberCode: string;
  email: string;
  password: string;
  authProvisioned: boolean;
  authNotice: string;
}

export async function adminCreateMember(input: CreateMemberInput): Promise<CreateMemberResult> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const now = new Date().toISOString();

  // Duplicate check
  const existingSnap = await getDocs(
    query(collection(db, 'members'), where('email', '==', normalizedEmail))
  );
  if (!existingSnap.empty) {
    throw new Error(
      `A member with email ${normalizedEmail} already exists (${existingSnap.docs[0].data().memberCode}). Open their profile to assign or update their membership.`
    );
  }

  let authUid = '';
  const { secondaryAuth, cleanup } = getSecondaryAuthApp();
  try {
    const cred = await createUserWithEmailAndPassword(
      secondaryAuth,
      normalizedEmail,
      input.temporaryPassword
    );
    authUid = cred.user.uid;
    await signOut(secondaryAuth);
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code || '';
    if (code === 'auth/email-already-in-use') {
      throw new Error(
        'This email is already used by an existing website account. Enter a dedicated Member Portal email for this member so the generated Member Password works.'
      );
    }
    if (code === 'auth/operation-not-allowed') {
      throw new Error(
        'Email/Password sign-in is disabled in Firebase Console. Enable Email/Password under Authentication -> Sign-in method first.'
      );
    }
    if (code === 'auth/weak-password') {
      throw new Error('Generated password must be at least 6 characters.');
    }
    throw new Error(
      err instanceof Error ? err.message : 'Could not create Member Portal login credentials.'
    );
  } finally {
    await cleanup();
  }

  const memberCode = `FC-${Math.floor(100000 + Math.random() * 900000)}`;
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`;

  try {
    const memberRef = await addDoc(collection(db, 'members'), {
      memberCode,
      firstName: input.firstName.trim().slice(0, 80),
      lastName: input.lastName.trim().slice(0, 80),
      email: normalizedEmail.slice(0, 200),
      age: Math.max(12, Math.min(110, Number(input.age) || 22)),
      dateOfBirth: (input.dateOfBirth || '').trim().slice(0, 20),
      gender: input.gender,
      phone: input.phone.trim().slice(0, 30),
      authUid,
      status: 'active',
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    });

    const subRef = await addDoc(collection(db, 'subscriptions'), {
      memberId: memberRef.id,
      memberUid: authUid,
      memberEmail: normalizedEmail,
      memberName: fullName.slice(0, 160),
      planId: input.plan.id,
      planName: input.plan.name,
      startDate: input.startDate,
      expiryDate: input.expiryDate,
      status: 'active',
      trainerId: input.trainer?.id || '',
      trainerName: input.trainer?.fullName || 'Unassigned',
      trainerSpecialization: input.trainer?.specialization || '',
      trainerPhone: input.trainer?.phone || '',
      amount: Number(input.plan.price) || 0,
      createdAt: now,
      updatedAt: now,
    });

    await addDoc(collection(db, 'payments'), {
      memberId: memberRef.id,
      memberUid: authUid,
      memberEmail: normalizedEmail,
      memberName: fullName.slice(0, 160),
      subscriptionId: subRef.id,
      planName: input.plan.name,
      amount: Number(input.plan.price) || 0,
      status: input.paymentStatus,
      paymentDate: now.slice(0, 10),
      method: 'Front Desk / Gym Transfer',
      notes: `Initial subscription payment for ${input.plan.name}`,
      createdAt: now,
    });

    await addDoc(collection(db, 'notifications'), {
      memberId: memberRef.id,
      memberUid: authUid,
      memberEmail: normalizedEmail,
      type: 'announcement',
      title: 'Welcome to FitCore',
      message: `Your ${input.plan.name} membership (${input.startDate} to ${input.expiryDate}) is active.${
        input.trainer ? ` Assigned trainer: ${input.trainer.fullName}.` : ''
      }`,
      isRead: false,
      createdAt: now,
    });

    if (input.inquiryIdToApprove) {
      const inqSnap = await getDoc(doc(db, 'inquiries', input.inquiryIdToApprove));
      if (inqSnap.exists()) {
        await updateInquiryStatus(
          input.inquiryIdToApprove,
          'approved',
          { id: inqSnap.id, ...(inqSnap.data() as Omit<Inquiry, 'id'>) }
        );
      }
    }

    return {
      memberId: memberRef.id,
      memberCode,
      email: normalizedEmail,
      password: input.temporaryPassword,
      authProvisioned: true,
      authNotice: 'Member Portal credentials created and ready to copy & send.',
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'members');
  }
}

export async function adminUpdateMember(member: Member): Promise<void> {
  try {
    await setDoc(doc(db, 'members', member.id), {
      memberCode: member.memberCode,
      firstName: member.firstName.trim().slice(0, 80),
      lastName: member.lastName.trim().slice(0, 80),
      email: member.email.trim().toLowerCase().slice(0, 200),
      age: Math.max(12, Math.min(110, Number(member.age) || 22)),
      dateOfBirth: (member.dateOfBirth || '').trim().slice(0, 20),
      gender: member.gender,
      phone: member.phone.trim().slice(0, 30),
      authUid: member.authUid || '',
      status: member.status,
      mustChangePassword: Boolean(member.mustChangePassword),
      createdAt: member.createdAt,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `members/${member.id}`);
  }
}

export async function adminDeleteMember(memberId: string): Promise<void> {
  const linkedCollections = [
    'subscriptions',
    'trainingSchedules',
    'attendance',
    'payments',
    'progressRecords',
    'workoutPlans',
    'notifications',
  ];
  try {
    for (const colName of linkedCollections) {
      const snap = await getDocs(
        query(collection(db, colName), where('memberId', '==', memberId))
      );
      if (!snap.empty) {
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
    }
    await deleteDoc(doc(db, 'members', memberId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `members/${memberId}`);
  }
}

export async function listAllSubscriptions(): Promise<MemberSubscription[]> {
  try {
    const snap = await getDocs(query(collection(db, 'subscriptions'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MemberSubscription, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'subscriptions');
  }
}

export async function saveSubscription(
  id: string | null,
  data: Omit<MemberSubscription, 'id'>
): Promise<string> {
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  try {
    if (id) {
      await setDoc(doc(db, 'subscriptions', id), payload);
      return id;
    }
    const created = await addDoc(collection(db, 'subscriptions'), payload);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'subscriptions');
  }
}

export async function listAllSchedules(): Promise<TrainingSchedule[]> {
  try {
    const snap = await getDocs(collection(db, 'trainingSchedules'));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TrainingSchedule, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'trainingSchedules');
  }
}

export async function saveTrainingSchedule(
  id: string | null,
  data: Omit<TrainingSchedule, 'id'>
): Promise<string> {
  const payload = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  try {
    if (id) {
      await setDoc(doc(db, 'trainingSchedules', id), payload);
      return id;
    }
    const created = await addDoc(collection(db, 'trainingSchedules'), payload);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'trainingSchedules');
  }
}

export async function deleteTrainingSchedule(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'trainingSchedules', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `trainingSchedules/${id}`);
  }
}

export async function listAllAttendance(): Promise<AttendanceRecord[]> {
  try {
    const snap = await getDocs(query(collection(db, 'attendance'), orderBy('date', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AttendanceRecord, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'attendance');
  }
}

export async function saveAttendanceRecord(
  id: string | null,
  data: Omit<AttendanceRecord, 'id'>
): Promise<string> {
  try {
    if (id) {
      await setDoc(doc(db, 'attendance', id), data);
      return id;
    }
    const created = await addDoc(collection(db, 'attendance'), data);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'attendance');
  }
}

export async function listAllPayments(): Promise<PaymentRecord[]> {
  try {
    const snap = await getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PaymentRecord, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'payments');
  }
}

export async function savePaymentRecord(
  id: string | null,
  data: Omit<PaymentRecord, 'id'>
): Promise<string> {
  try {
    if (id) {
      await setDoc(doc(db, 'payments', id), data);
      return id;
    }
    const created = await addDoc(collection(db, 'payments'), data);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'payments');
  }
}

export async function listAllProgress(): Promise<ProgressRecord[]> {
  try {
    const snap = await getDocs(
      query(collection(db, 'progressRecords'), orderBy('measurementDate', 'asc'))
    );
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ProgressRecord, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'progressRecords');
  }
}

export async function saveProgressRecord(
  id: string | null,
  data: Omit<ProgressRecord, 'id'>
): Promise<string> {
  try {
    if (id) {
      await setDoc(doc(db, 'progressRecords', id), data);
      return id;
    }
    const created = await addDoc(collection(db, 'progressRecords'), data);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'progressRecords');
  }
}

export async function listAllWorkoutPlans(): Promise<WorkoutPlan[]> {
  try {
    const snap = await getDocs(query(collection(db, 'workoutPlans'), orderBy('updatedAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WorkoutPlan, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'workoutPlans');
  }
}

export async function saveWorkoutPlan(
  id: string | null,
  data: Omit<WorkoutPlan, 'id'>
): Promise<string> {
  const payload = {
    ...data,
    exercises: data.exercises.slice(0, 40),
    updatedAt: new Date().toISOString(),
  };
  try {
    if (id) {
      await setDoc(doc(db, 'workoutPlans', id), payload);
      return id;
    }
    const created = await addDoc(collection(db, 'workoutPlans'), payload);
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'workoutPlans');
  }
}

export async function deleteWorkoutPlan(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'workoutPlans', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `workoutPlans/${id}`);
  }
}

export async function sendMemberNotification(
  data: Omit<MemberNotification, 'id'>
): Promise<string> {
  try {
    const created = await addDoc(collection(db, 'notifications'), {
      ...data,
      title: data.title.trim().slice(0, 140),
      message: data.message.trim().slice(0, 1000),
      createdAt: data.createdAt || new Date().toISOString(),
    });
    return created.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'notifications');
  }
}

export async function listAllNotifications(): Promise<MemberNotification[]> {
  try {
    const snap = await getDocs(query(collection(db, 'notifications'), orderBy('createdAt', 'desc')));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MemberNotification, 'id'>) }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'notifications');
  }
}

export async function markNotificationRead(notification: MemberNotification): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notification.id), { isRead: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${notification.id}`);
  }
}

// ---------- MEMBER SCOPED QUERIES ----------

export function subscribeMemberRecords<T extends { id: string }>(
  collectionName: string,
  memberUid: string,
  memberEmail: string,
  onData: (rows: T[]) => void
): Unsubscribe {
  const colRef = collection(db, collectionName);
  const q = memberUid
    ? query(colRef, where('memberUid', '==', memberUid))
    : query(colRef, where('memberEmail', '==', memberEmail.toLowerCase()));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<T, 'id'>) } as T)));
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, collectionName);
    }
  );
}

// ---------- STARTER CATALOG INITIALIZATION (ADMIN ONLY) ----------

export async function seedStarterGymCatalog(force = false): Promise<boolean> {
  const existingPlans = await getDocs(collection(db, 'membershipPlans'));
  if (!force && !existingPlans.empty) {
    return false;
  }

  const batch = writeBatch(db);
  const now = new Date().toISOString();

  batch.set(doc(db, 'siteContent', 'about'), {
    sectionKey: 'about',
    data: DEFAULT_ABOUT_CONTENT,
    updatedAt: now,
  });

  batch.set(doc(db, 'siteContent', 'contact'), {
    sectionKey: 'contact',
    data: DEFAULT_CONTACT_CONTENT,
    updatedAt: now,
  });

  const facilities: Omit<Facility, 'id'>[] = [
    {
      name: 'Strength Training Area',
      category: 'Strength',
      description:
        'Competition-grade power racks, Olympic lifting platforms, and calibrated competition plates engineered for heavy compound lifts.',
      benefits: [
        '6 heavy-duty power cages with safety spotter arms',
        'Calibrated Olympic barbells and bumper plates',
        'Dedicated deadlift platforms with shock-absorbing flooring',
      ],
      imageUrl: FITCORE_IMAGES.facilityStrength,
      sortOrder: 1,
      isActive: true,
    },
    {
      name: 'Dumbbells & Free Weights',
      category: 'Free Weights',
      description:
        'Full urethane dumbbell wall from 2.5 kg to 60 kg alongside EZ-curl bars, flat/incline benches, and preacher stations.',
      benefits: [
        'Full 2.5 kg increments up to 60 kg',
        'Multiple adjustable zero-gap benches',
        'Spacious mirror alignment for form checks',
      ],
      imageUrl: FITCORE_IMAGES.heroAthlete,
      sortOrder: 2,
      isActive: true,
    },
    {
      name: 'Cardio Machines',
      category: 'Cardio',
      description:
        'Commercial slat-belt treadmills, Concept2 rowers, curved sprint runners, and stair climbers for aerobic conditioning.',
      benefits: [
        'Heart-rate zone telemetry displays',
        'Low-impact curved sprint tracks',
        'Concept2 RowErgs and air bikes',
      ],
      imageUrl: FITCORE_IMAGES.facilityCardio,
      sortOrder: 3,
      isActive: true,
    },
    {
      name: 'Weight Training Machines',
      category: 'Biomechanics',
      description:
        'Plate-loaded and pin-selected biomechanically aligned machines targeting chest, back, legs, and isolation movements.',
      benefits: [
        'Converging press & row ergonomics',
        'Leg press, hack squat, and pendulum stations',
        'Dual-pulley functional cable towers',
      ],
      imageUrl: FITCORE_IMAGES.facilityStrength,
      sortOrder: 4,
      isActive: true,
    },
    {
      name: 'Functional Training Area',
      category: 'Conditioning',
      description:
        '25-meter sprint turf lane with sleds, kettlebells, battle ropes, plyometric boxes, and suspension rigs.',
      benefits: [
        'Prowler sled turf track',
        'Cast-iron kettlebells 8 kg to 32 kg',
        'Athletic agility and core conditioning zone',
      ],
      imageUrl: FITCORE_IMAGES.classTraining,
      sortOrder: 5,
      isActive: true,
    },
    {
      name: 'Locker & Changing Facilities',
      category: 'Amenities',
      description:
        'Clean ventilated changing suites, private showers, digital security lockers, and hydration refill stations.',
      benefits: [
        'Individual digital-lock storage lockers',
        'Sanitized shower and grooming stations',
        'Chilled filtered water stations',
      ],
      imageUrl: FITCORE_IMAGES.facilityCardio,
      sortOrder: 6,
      isActive: true,
    },
  ];

  facilities.forEach((f, idx) => {
    batch.set(doc(db, 'facilities', `fac_${idx + 1}`), f);
  });

  const plans: Omit<MembershipPlan, 'id'>[] = [
    {
      name: 'Monthly',
      durationLabel: '1 Month',
      durationDays: 30,
      price: 5000,
      currency: 'PKR',
      description: 'Flexible 30-day access to the full strength floor, cardio zone, and locker rooms.',
      benefits: ['Full gym floor access', 'Locker & shower access', 'Member Portal tracking'],
      includedFacilities: ['Strength Area', 'Free Weights', 'Cardio Zone', 'Lockers'],
      trainingBenefits: ['Initial movement orientation', 'Workout plan portal access'],
      status: 'active',
      isPopular: false,
      sortOrder: 1,
    },
    {
      name: 'Quarterly',
      durationLabel: '3 Months',
      durationDays: 90,
      price: 13500,
      currency: 'PKR',
      description: '90-day structured transformation cycle with monthly body composition check-ins.',
      benefits: [
        'Everything in Monthly',
        'Monthly progress measurement logs',
        'Group conditioning class access',
      ],
      includedFacilities: ['All Strength & Cardio Floors', 'Functional Turf', 'Lockers'],
      trainingBenefits: ['Assigned coach check-ins', 'Custom training split'],
      status: 'active',
      isPopular: true,
      sortOrder: 2,
    },
    {
      name: 'Half-Yearly',
      durationLabel: '6 Months',
      durationDays: 180,
      price: 25000,
      currency: 'PKR',
      description: 'Six months of dedicated strength progression with priority trainer scheduling.',
      benefits: [
        'Priority trainer assignment',
        'Bi-weekly body measurement tracking',
        'Full class & turf access',
      ],
      includedFacilities: ['All Gym Zones', 'Functional Turf', 'Recovery & Lockers'],
      trainingBenefits: ['Structured periodized workout plan', 'Nutrition guidance notes'],
      status: 'active',
      isPopular: false,
      sortOrder: 3,
    },
    {
      name: 'Annual',
      durationLabel: '12 Months',
      durationDays: 365,
      price: 45000,
      currency: 'PKR',
      description: 'Year-round athletic membership with maximum value and full performance analytics.',
      benefits: [
        'Best annual rate',
        'Dedicated coach pairing',
        'Unlimited group classes & progress audits',
      ],
      includedFacilities: ['All Gym Zones', 'Functional Turf', 'Priority Locker Access'],
      trainingBenefits: ['Year-round periodization', '1-on-1 monthly review'],
      status: 'active',
      isPopular: false,
      sortOrder: 4,
    },
  ];

  plans.forEach((p, idx) => {
    batch.set(doc(db, 'membershipPlans', `plan_${idx + 1}`), p);
  });

  const classes: Omit<FitnessClass, 'id'>[] = [
    {
      name: 'Strength Training',
      description:
        'Coach-led barbell fundamentals covering squat, bench press, deadlift, and overhead press mechanics.',
      duration: '60 Min',
      difficultyLevel: 'All Levels',
      schedule: 'Mon, Wed, Fri · 7:00 AM & 6:30 PM',
      imageUrl: FITCORE_IMAGES.classTraining,
      isActive: true,
    },
    {
      name: 'Personal Training',
      description:
        'Individualized 1-on-1 coaching tailored to strength goals, injury prevention, and progressive overload.',
      duration: '60 Min',
      difficultyLevel: 'All Levels',
      schedule: 'By Appointment · Daily 6:00 AM – 10:00 PM',
      imageUrl: FITCORE_IMAGES.heroAthlete,
      isActive: true,
    },
    {
      name: 'Functional Training',
      description:
        'High-output athletic circuits combining sled pushes, kettlebells, battle ropes, and core stability.',
      duration: '45 Min',
      difficultyLevel: 'Intermediate',
      schedule: 'Tue, Thu, Sat · 7:30 AM & 7:00 PM',
      imageUrl: FITCORE_IMAGES.classTraining,
      isActive: true,
    },
    {
      name: 'Cardio Training',
      description:
        'Structured interval conditioning on rowers, assault bikes, and sprint tracks to build VO2 capacity.',
      duration: '45 Min',
      difficultyLevel: 'Beginner',
      schedule: 'Daily · 8:00 AM & 5:30 PM',
      imageUrl: FITCORE_IMAGES.facilityCardio,
      isActive: true,
    },
    {
      name: 'Weight Loss Training',
      description:
        'Metabolic resistance training paired with high-expenditure conditioning intervals for sustainable fat loss.',
      duration: '50 Min',
      difficultyLevel: 'Beginner',
      schedule: 'Mon – Fri · 9:00 AM & 6:00 PM',
      imageUrl: FITCORE_IMAGES.classTraining,
      isActive: true,
    },
    {
      name: 'Muscle Building Programs',
      description:
        'Hypertrophy-focused split sessions emphasizing progressive tension, tempo control, and volume tracking.',
      duration: '65 Min',
      difficultyLevel: 'Advanced',
      schedule: 'Mon, Tue, Thu, Fri · 7:30 PM',
      imageUrl: FITCORE_IMAGES.heroAthlete,
      isActive: true,
    },
  ];

  classes.forEach((c, idx) => {
    batch.set(doc(db, 'classes', `class_${idx + 1}`), c);
  });

  const trainers: Omit<Trainer, 'id'>[] = [
    {
      fullName: 'Coach Tariq Mahmood',
      imageUrl: FITCORE_IMAGES.trainerCoach,
      qualifications: 'NSCA Certified Strength & Conditioning Specialist',
      experience: '9 Years Coaching Experience',
      specialization: 'Powerlifting & Hypertrophy',
      bio: 'Specializes in barbell biomechanics, hypertrophy periodization, and structured strength progression.',
      phone: '+92 300 1112233',
      status: 'active',
    },
    {
      fullName: 'Coach Bilal Siddiqui',
      imageUrl: FITCORE_IMAGES.heroAthlete,
      qualifications: 'ACE Certified Personal Trainer & Sports Nutritionist',
      experience: '7 Years Coaching Experience',
      specialization: 'Fat Loss & Metabolic Conditioning',
      bio: 'Focuses on sustainable body recomposition, measurable waist-to-weight tracking, and conditioning splits.',
      phone: '+92 300 4445566',
      status: 'active',
    },
    {
      fullName: 'Coach Hamza Qureshi',
      imageUrl: FITCORE_IMAGES.classTraining,
      qualifications: 'CrossFit Level 2 & Functional Movement Specialist',
      experience: '6 Years Coaching Experience',
      specialization: 'Functional Athletic Conditioning',
      bio: 'Leads high-output functional turf sessions, mobility drills, and athletic endurance programs.',
      phone: '+92 300 7778899',
      status: 'active',
    },
  ];

  trainers.forEach((t, idx) => {
    batch.set(doc(db, 'trainers', `trainer_${idx + 1}`), t);
  });

  const categories: Omit<ShopCategory, 'id'>[] = [
    { name: 'Whey & Protein', slug: 'whey-protein', sortOrder: 1 },
    { name: 'Mass Gainers', slug: 'mass-gainers', sortOrder: 2 },
    { name: 'Creatine & Pre-Workout', slug: 'creatine-preworkout', sortOrder: 3 },
    { name: 'Bars & Accessories', slug: 'bars-accessories', sortOrder: 4 },
  ];

  categories.forEach((cat, idx) => {
    batch.set(doc(db, 'shopCategories', `cat_${idx + 1}`), cat);
  });

  const products: Omit<ShopProduct, 'id'>[] = [
    {
      name: 'FitCore Isolate Whey Protein (2.2 kg)',
      brand: 'FitCore Nutrition',
      description: '25g ultra-filtered whey isolate per scoop with 5.5g naturally occurring BCAAs and low carbs.',
      price: 18500,
      category: 'Whey & Protein',
      stock: 24,
      imageUrl: FITCORE_IMAGES.shopWhey,
      isFeatured: true,
      isAvailable: true,
    },
    {
      name: 'Pro Mass Gainer Complex (3 kg)',
      brand: 'IronFuel',
      description: 'Clean complex carbohydrates and 50g multi-stage protein blend for high-calorie bulking phases.',
      price: 15500,
      category: 'Mass Gainers',
      stock: 16,
      imageUrl: FITCORE_IMAGES.shopWhey,
      isFeatured: true,
      isAvailable: true,
    },
    {
      name: 'Micronized Creatine Monohydrate (300g)',
      brand: 'FitCore Nutrition',
      description: 'Pure 5g micronized creatine monohydrate per serving to support explosive power output.',
      price: 6500,
      category: 'Creatine & Pre-Workout',
      stock: 42,
      imageUrl: FITCORE_IMAGES.shopWhey,
      isFeatured: true,
      isAvailable: true,
    },
    {
      name: 'Crimson Ignite Pre-Workout',
      brand: 'Apex Lab',
      description: 'L-Citrulline, Beta-Alanine, and clean caffeine formula for sustained training focus.',
      price: 8500,
      category: 'Creatine & Pre-Workout',
      stock: 18,
      imageUrl: FITCORE_IMAGES.shopWhey,
      isFeatured: true,
      isAvailable: true,
    },
    {
      name: 'Dark Cocoa Protein Bar (Box of 12)',
      brand: 'FitCore Nutrition',
      description: '20g whey protein and 3g sugar per bar for convenient post-training recovery.',
      price: 7200,
      category: 'Bars & Accessories',
      stock: 30,
      imageUrl: FITCORE_IMAGES.shopWhey,
      isFeatured: false,
      isAvailable: true,
    },
    {
      name: 'FitCore Matte Black Steel Shaker (750ml)',
      brand: 'FitCore Gear',
      description: 'Leak-proof stainless steel shaker bottle with integrated mixing grate.',
      price: 3200,
      category: 'Bars & Accessories',
      stock: 35,
      imageUrl: FITCORE_IMAGES.shopWhey,
      isFeatured: false,
      isAvailable: true,
    },
  ];

  products.forEach((prod, idx) => {
    batch.set(doc(db, 'shopProducts', `prod_${idx + 1}`), prod);
  });

  batch.set(doc(db, 'announcements', 'ann_1'), {
    title: 'Welcome to the FitCore Portal',
    message:
      'Members can now view their active subscriptions, assigned coaches, measurement charts, and daily workout splits online.',
    audience: 'public',
    isActive: true,
    createdAt: now,
  });

  await batch.commit();
  return true;
}
