import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, getDocs, serverTimestamp, deleteDoc,
  addDoc, orderBy, where
} from 'firebase/firestore';

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function signup(email, password, displayName, inviteCode) {
    const inviteRef = doc(db, 'invites', inviteCode);
    const inviteSnap = await getDoc(inviteRef);
    if (!inviteSnap.exists()) throw new Error('Invalid invite code');
    const inviteData = inviteSnap.data();
    if (inviteData.used) throw new Error('This invite has already been used');

    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    await setDoc(doc(db, 'users', cred.user.uid), {
      displayName, email, bio: '', photoURL: '',
      companies: [], locations: [], websites: [], linkedins: [],
      skills: [],
      invitedBy: inviteData.createdBy,
      inviteCode, inviteCount: 0, role: 'member',
      createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });

    await updateDoc(inviteRef, { used: true, usedBy: cred.user.uid, usedAt: serverTimestamp() });

    if (inviteData.createdBy) {
      const inviterRef = doc(db, 'users', inviteData.createdBy);
      const inviterSnap = await getDoc(inviterRef);
      if (inviterSnap.exists()) {
        await updateDoc(inviterRef, { inviteCount: (inviterSnap.data().inviteCount || 0) + 1 });
      }
    }
    return cred;
  }

  function login(email, password) { return signInWithEmailAndPassword(auth, email, password); }
  function logout() { return signOut(auth); }

  async function getUserProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) return { uid, ...snap.data() };
    return null;
  }

  async function updateUserProfile(uid, data) {
    await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
    const updated = await getUserProfile(uid);
    setUserProfile(updated);
    return updated;
  }

  async function createInvite(createdBy) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'BC-';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    await setDoc(doc(db, 'invites', code), {
      createdBy, used: false, usedBy: null, createdAt: serverTimestamp(), usedAt: null
    });
    return code;
  }

  async function getAllUsers() {
    const snap = await getDocs(query(collection(db, 'users')));
    return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
  }

  async function getAllInvites() {
    const snap = await getDocs(query(collection(db, 'invites')));
    return snap.docs.map(d => ({ code: d.id, ...d.data() }));
  }

  async function getAllSkills() {
    const users = await getAllUsers();
    const skills = {};
    users.forEach(u => {
      (u.skills || []).forEach(s => {
        const key = s.toLowerCase().trim();
        if (!skills[key]) skills[key] = { name: s, count: 0 };
        skills[key].count++;
      });
    });
    return Object.values(skills).sort((a, b) => b.count - a.count);
  }

  async function updateSkillName(oldName, newName) {
    const users = await getAllUsers();
    for (const u of users) {
      if (u.skills && u.skills.includes(oldName)) {
        const newSkills = u.skills.map(s => s === oldName ? newName : s);
        await updateDoc(doc(db, 'users', u.uid), { skills: newSkills });
      }
    }
  }

  // Forum
  async function getForumPosts() {
    const snap = await getDocs(query(collection(db, 'forum'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async function createForumPost(data) {
    return addDoc(collection(db, 'forum'), { ...data, createdAt: serverTimestamp(), replies: [] });
  }

  async function addForumReply(postId, reply) {
    const postRef = doc(db, 'forum', postId);
    const postSnap = await getDoc(postRef);
    if (postSnap.exists()) {
      const replies = postSnap.data().replies || [];
      replies.push({ ...reply, createdAt: new Date().toISOString() });
      await updateDoc(postRef, { replies });
    }
  }

  // News
  async function getNewsItems() {
    const snap = await getDocs(query(collection(db, 'news'), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async function createNewsItem(data) {
    return addDoc(collection(db, 'news'), { ...data, createdAt: serverTimestamp() });
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else { setUserProfile(null); }
      setLoading(false);
    });
    return unsub;
  }, []);

  const value = {
    currentUser, userProfile, loading,
    signup, login, logout, getUserProfile, updateUserProfile,
    createInvite, getAllUsers, getAllInvites,
    getAllSkills, updateSkillName,
    getForumPosts, createForumPost, addForumReply,
    getNewsItems, createNewsItem
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
