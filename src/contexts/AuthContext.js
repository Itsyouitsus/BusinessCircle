import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, serverTimestamp, deleteDoc
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName, inviteCode) {
    // Validate invite code
    const inviteRef = doc(db, 'invites', inviteCode);
    const inviteSnap = await getDoc(inviteRef);
    if (!inviteSnap.exists()) throw new Error('Invalid invite code');
    const inviteData = inviteSnap.data();
    if (inviteData.used) throw new Error('This invite has already been used');

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    // Create user profile
    await setDoc(doc(db, 'users', cred.user.uid), {
      displayName,
      email,
      bio: '',
      location: '',
      company: '',
      website: '',
      skills: [],
      needsHelpWith: [],
      photoURL: '',
      invitedBy: inviteData.createdBy,
      inviteCode: inviteCode,
      inviteCount: 0,
      role: 'member',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Mark invite as used
    await updateDoc(inviteRef, {
      used: true,
      usedBy: cred.user.uid,
      usedAt: serverTimestamp()
    });

    // Increment invite count for the inviter
    if (inviteData.createdBy) {
      const inviterRef = doc(db, 'users', inviteData.createdBy);
      const inviterSnap = await getDoc(inviterRef);
      if (inviterSnap.exists()) {
        await updateDoc(inviterRef, {
          inviteCount: (inviterSnap.data().inviteCount || 0) + 1
        });
      }
    }

    return cred;
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  async function getUserProfile(uid) {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() };
    }
    return null;
  }

  async function updateUserProfile(uid, data) {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    const updated = await getUserProfile(uid);
    setUserProfile(updated);
    return updated;
  }

  async function createInvite(createdBy) {
    const code = generateInviteCode();
    await setDoc(doc(db, 'invites', code), {
      createdBy,
      used: false,
      usedBy: null,
      createdAt: serverTimestamp(),
      usedAt: null
    });
    return code;
  }

  async function getAllUsers() {
    const q = query(collection(db, 'users'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  }

  async function getAllInvites() {
    const q = query(collection(db, 'invites'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ code: d.id, ...d.data() }));
  }

  async function deleteUser(uid) {
    await deleteDoc(doc(db, 'users', uid));
  }

  function generateInviteCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'BC-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    logout,
    getUserProfile,
    updateUserProfile,
    createInvite,
    getAllUsers,
    getAllInvites,
    deleteUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
