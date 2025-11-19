// AuthContext.tsx
import { createContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { ReactNode } from "react";
import type { User } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

interface FirestoreUser {
  firstName: string;
  lastName: string;
  address: string;
  age: number;
  gender: string;
  birthday: string;
  email: string;
  role: string;
}

interface AuthContextType {
  currentUser: User | null;
  profile: FirestoreUser | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  profile: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setProfile(docSnap.data() as FirestoreUser);
          } else {
            setProfile(null); // 🔥 Important fallback
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
          setProfile(null); // 🔥 Always fallback
        }
      } else {
        setProfile(null); // 🔥 Ensure profile resets
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);
  return (
    <AuthContext.Provider value={{ currentUser, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
