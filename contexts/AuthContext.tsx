"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import type { UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isSeller: boolean;
  storeName: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  becomeSeller: (storeName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>("user");
  const [storeName, setStoreName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    return onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Upsert user record in Firestore, and load their role from it
        const ref = doc(db, "users", u.uid);
        try {
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            const initialRole: UserRole =
              u.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? "admin" : "user";
            await setDoc(ref, {
              uid: u.uid,
              email: u.email,
              name: u.displayName,
              photo: u.photoURL,
              role: initialRole,
              createdAt: new Date().toISOString(),
            });
            setRole(initialRole);
            setStoreName(null);
          } else {
            const data = snap.data();
            setRole((data.role as UserRole) ?? "user");
            setStoreName((data.storeName as string) ?? null);
          }
        } catch {
          // Firestore unreachable — fall back to env check so admin still works
          setRole(u.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? "admin" : "user");
        }
      } else {
        setRole("user");
        setStoreName(null);
      }
      setUser(u);
      setLoading(false);
    });
  }, []);

  // Env-email fallback keeps the original admin working even if their
  // Firestore doc predates the role field.
  const isAdmin = role === "admin" || (!!user && user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);
  const isSeller = role === "seller" || isAdmin;

  const signIn = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const becomeSeller = async (name: string) => {
    if (!user) throw new Error("Sign in first");
    await updateDoc(doc(db, "users", user.uid), {
      role: "seller",
      storeName: name,
      sellerSince: new Date().toISOString(),
    });
    setRole("seller");
    setStoreName(name);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, role, isAdmin, isSeller, storeName, signIn, signOut, becomeSeller }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
