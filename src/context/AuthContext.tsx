import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  updateProfile,
  type User,
} from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  googleAuthProvider,
} from '../lib/firebase';
import {
  ensureAdminDocument,
  findMemberByAuthOrEmail,
  getWebsiteUser,
  saveWebsiteUser,
} from '../services/fitcoreDb';
import type { Member, UserRole, WebsiteUser } from '../types/fitcore';

export interface RegisterWebsiteUserInput {
  fullName: string;
  email: string;
  phone: string;
  age: number;
  gender: WebsiteUser['gender'];
  password: string;
}

interface AuthContextValue {
  firebaseUser: User | null;
  role: UserRole | null;
  memberProfile: Member | null;
  websiteUser: WebsiteUser | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginUserWithEmail: (email: string, password: string) => Promise<boolean>;
  registerUserWithEmail: (input: RegisterWebsiteUserInput) => Promise<boolean>;
  loginUserWithGoogle: () => Promise<boolean>;
  updateWebsiteUserProfile: (updates: Pick<WebsiteUser, 'fullName' | 'phone' | 'age' | 'gender'>) => Promise<void>;
  loginMemberWithEmail: (email: string, password: string) => Promise<boolean>;
  loginAdminWithGoogle: () => Promise<boolean>;
  loginAdminWithEmail: (email: string, password: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  changeMemberPassword: (newPassword: string) => Promise<void>;
  refreshMemberProfile: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function checkIsAdminUser(user: User): Promise<boolean> {
  if (
    user.email &&
    user.email.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase() &&
    user.emailVerified
  ) {
    await ensureAdminDocument({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    });
    return true;
  }
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [memberProfile, setMemberProfile] = useState<Member | null>(null);
  const [websiteUser, setWebsiteUser] = useState<WebsiteUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const resolveUserSession = async (user: User | null) => {
    if (!user) {
      setFirebaseUser(null);
      setRole(null);
      setMemberProfile(null);
      setWebsiteUser(null);
      setLoading(false);
      return;
    }

    setFirebaseUser(user);
    try {
      const isAdmin = await checkIsAdminUser(user);
      if (isAdmin) {
        setRole('admin');
        setMemberProfile(null);
        setWebsiteUser(null);
        setLoading(false);
        return;
      }

      const member = await findMemberByAuthOrEmail(user.uid, user.email || '');
      if (member && member.status !== 'inactive') {
        setRole('member');
        setMemberProfile(member);
        setWebsiteUser(null);
        setLoading(false);
        return;
      }

      const webUser = await getWebsiteUser(user.uid);
      if (webUser) {
        setRole('user');
        setWebsiteUser(webUser);
        setMemberProfile(null);
        setLoading(false);
        return;
      }

      setRole(null);
      setMemberProfile(null);
      setWebsiteUser(null);
    } catch (err) {
      console.error('Session resolution error:', err);
      setRole(null);
      setMemberProfile(null);
      setWebsiteUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      void resolveUserSession(user);
    });
    return () => unsub();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const formatAuthError = (err: unknown): string => {
    const code = (err as { code?: string })?.code || '';
    if (code === 'auth/operation-not-allowed') {
      return 'Email/Password sign-in is not yet enabled in Firebase Authentication Console. Enable Email/Password under Authentication -> Sign-in method, or use Google Sign-In for General User / Admin access.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (code === 'auth/weak-password') {
      return 'Password must be at least 6 characters long.';
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Invalid email or password. Please verify your credentials.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Sign-in window was closed before completion.';
    }
    return err instanceof Error ? err.message : 'Authentication failed. Please try again.';
  };

  // ---------- GENERAL WEBSITE USER AUTH (SEPARATE FROM MEMBER PORTAL) ----------

  const registerUserWithEmail = async (input: RegisterWebsiteUserInput): Promise<boolean> => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        input.email.trim().toLowerCase(),
        input.password
      );
      if (input.fullName.trim()) {
        await updateProfile(cred.user, { displayName: input.fullName.trim() }).catch(() => {});
      }
      const now = new Date().toISOString();
      const profile = await saveWebsiteUser({
        uid: cred.user.uid,
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: input.phone.trim(),
        age: Math.max(12, Math.min(110, Number(input.age) || 24)),
        gender: input.gender,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });
      setRole('user');
      setWebsiteUser(profile);
      setMemberProfile(null);
      return true;
    } catch (err) {
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const loginUserWithEmail = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const isAdmin = await checkIsAdminUser(result.user);
      if (isAdmin) {
        await signOut(auth);
        setAuthError('This email belongs to an Administrator. Please use the Admin Login tab.');
        return false;
      }
      let webUser = await getWebsiteUser(result.user.uid);
      if (!webUser) {
        const member = await findMemberByAuthOrEmail(result.user.uid, result.user.email || '');
        if (member) {
          await signOut(auth);
          setAuthError(
            'These credentials belong to a Gym Member Portal account. Please switch to the Member Portal tab to sign in.'
          );
          return false;
        }
        // Auto-create website user profile if Auth account exists without Firestore doc
        const now = new Date().toISOString();
        webUser = await saveWebsiteUser({
          uid: result.user.uid,
          fullName: result.user.displayName || result.user.email?.split('@')[0] || 'FitCore Visitor',
          email: (result.user.email || email).toLowerCase(),
          phone: '',
          age: 24,
          gender: 'Prefer not to say',
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });
      }
      setRole('user');
      setWebsiteUser(webUser);
      setMemberProfile(null);
      return true;
    } catch (err) {
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const loginUserWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const isAdmin = await checkIsAdminUser(result.user);
      if (isAdmin) {
        await signOut(auth);
        setAuthError('This Google account is an Administrator account. Please use the Admin Login tab.');
        return false;
      }

      let webUser = await getWebsiteUser(result.user.uid);
      if (!webUser) {
        const now = new Date().toISOString();
        webUser = await saveWebsiteUser({
          uid: result.user.uid,
          fullName: result.user.displayName || result.user.email?.split('@')[0] || 'FitCore Visitor',
          email: (result.user.email || '').toLowerCase(),
          phone: '',
          age: 24,
          gender: 'Prefer not to say',
          status: 'active',
          createdAt: now,
          updatedAt: now,
        });
      }
      setRole('user');
      setWebsiteUser(webUser);
      setMemberProfile(null);
      return true;
    } catch (err) {
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const updateWebsiteUserProfile = async (
    updates: Pick<WebsiteUser, 'fullName' | 'phone' | 'age' | 'gender'>
  ) => {
    if (!websiteUser) throw new Error('No active website user session.');
    const updated = await saveWebsiteUser({
      ...websiteUser,
      ...updates,
    });
    setWebsiteUser(updated);
  };

  // ---------- MEMBER PORTAL AUTH (ADMIN-ISSUED CREDENTIALS ONLY) ----------

  const loginMemberWithEmail = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const member = await findMemberByAuthOrEmail(result.user.uid, result.user.email || '');
      if (!member) {
        await signOut(auth);
        setAuthError(
          'No active Member Portal account matches these credentials. Gym Member accounts are created exclusively by FitCore Administration.'
        );
        return false;
      }
      if (member.status === 'inactive') {
        await signOut(auth);
        setAuthError('Your FitCore membership account is deactivated. Please contact reception.');
        return false;
      }
      setRole('member');
      setMemberProfile(member);
      setWebsiteUser(null);
      return true;
    } catch (err) {
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  // ---------- ADMIN AUTH ----------

  const loginAdminWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const isAdmin = await checkIsAdminUser(result.user);
      if (!isAdmin) {
        await signOut(auth);
        setAuthError('Access denied. This Google account does not have FitCore Admin authorization.');
        return false;
      }
      setRole('admin');
      setMemberProfile(null);
      setWebsiteUser(null);
      return true;
    } catch (err) {
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const loginAdminWithEmail = async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const isAdmin = await checkIsAdminUser(result.user);
      if (!isAdmin) {
        await signOut(auth);
        setAuthError('Access denied. This account is not registered as a FitCore Administrator.');
        return false;
      }
      setRole('admin');
      setMemberProfile(null);
      setWebsiteUser(null);
      return true;
    } catch (err) {
      setAuthError(formatAuthError(err));
      return false;
    }
  };

  const changeMemberPassword = async (newPassword: string): Promise<void> => {
    if (!auth.currentUser || !memberProfile) {
      throw new Error('No authenticated member session.');
    }
    await updatePassword(auth.currentUser, newPassword);
    await updateDoc(doc(db, 'members', memberProfile.id), {
      authUid: auth.currentUser.uid,
      mustChangePassword: false,
      updatedAt: new Date().toISOString(),
    });
    setMemberProfile({ ...memberProfile, mustChangePassword: false, authUid: auth.currentUser.uid });
  };

  const refreshMemberProfile = async () => {
    if (!auth.currentUser) return;
    const member = await findMemberByAuthOrEmail(auth.currentUser.uid, auth.currentUser.email || '');
    if (member) setMemberProfile(member);
  };

  const resetPassword = async (email: string): Promise<void> => {
    setAuthError(null);
    const trimmed = email.trim();
    if (!trimmed) {
      throw new Error('Please enter your email address first.');
    }
    try {
      await sendPasswordResetEmail(auth, trimmed);
    } catch (err) {
      throw new Error(formatAuthError(err));
    }
  };

  const logout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
    setRole(null);
    setMemberProfile(null);
    setWebsiteUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        role,
        memberProfile,
        websiteUser,
        loading,
        authError,
        clearAuthError,
        loginUserWithEmail,
        registerUserWithEmail,
        loginUserWithGoogle,
        updateWebsiteUserProfile,
        loginMemberWithEmail,
        loginAdminWithGoogle,
        loginAdminWithEmail,
        resetPassword,
        changeMemberPassword,
        refreshMemberProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
