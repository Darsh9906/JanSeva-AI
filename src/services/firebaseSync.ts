import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy,
  limit,
  where,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';
import { store } from './store';
import { Issue, Comment, Verification, User } from '../types';
import { onAuthChanged, getUserByUID } from './firebase';

let unsubscribers: (() => void)[] = [];

export const startFirebaseSync = () => {
  if (!db) {
    console.warn('Firebase Firestore not configured');
    return;
  }

  console.log('🔄 Starting Firebase data sync...');

  // Clean up previous subscriptions
  unsubscribers.forEach(unsub => unsub());
  unsubscribers = [];

  // Auth state listener
  const unsubAuth = onAuthChanged(async (firebaseUser) => {
    if (firebaseUser) {
      try {
        const userProfile = await getUserByUID(firebaseUser.uid);
        if (userProfile) {
          store.setState({ currentUser: userProfile });
          console.log('✅ User loaded:', userProfile.name);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    } else {
      store.setState({ currentUser: null });
    }
  });
  unsubscribers.push(unsubAuth);

  // Sync Issues (limited to 500 most recent)
  const issuesRef = collection(db, 'issues');
  const qIssues = query(
    issuesRef, 
    orderBy('createdAt', 'desc'),
    limit(500)
  );
  
  const unsubIssues = onSnapshot(qIssues, (snapshot) => {
    const issues = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || data.updatedAt,
        timeline: (data.timeline || []).map((entry: any) => ({
          ...entry,
          at: entry.at?.toDate?.()?.toISOString?.() || entry.at
        }))
      } as Issue;
    });
    store.setState({ issues });
    console.log(`📋 Synced ${issues.length} issues from Firebase`);
  }, (error) => {
    console.error("❌ Firestore Issues Error:", error);
  });
  unsubscribers.push(unsubIssues);

  // Sync Comments
  const commentsRef = collection(db, 'comments');
  const qComments = query(commentsRef, orderBy('createdAt', 'desc'));
  
  const unsubComments = onSnapshot(qComments, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || doc.data().createdAt
    } as Comment));
    store.setState({ comments });
    console.log(`💬 Synced ${comments.length} comments from Firebase`);
  }, (error) => {
    console.error("❌ Firestore Comments Error:", error);
  });
  unsubscribers.push(unsubComments);

  // Sync Verifications
  const verificationsRef = collection(db, 'verifications');
  const qVerifications = query(verificationsRef, orderBy('createdAt', 'desc'));
  
  const unsubVerifications = onSnapshot(qVerifications, (snapshot) => {
    const verifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || doc.data().createdAt
    } as Verification));
    store.setState({ verifications });
    console.log(`✅ Synced ${verifications.length} verifications from Firebase`);
  }, (error) => {
    console.error("❌ Firestore Verifications Error:", error);
  });
  unsubscribers.push(unsubVerifications);

  // Sync Users (limited to 200)
  const usersRef = collection(db, 'users');
  const qUsers = query(
    usersRef, 
    orderBy('heroPoints', 'desc'),
    limit(200)
  );
  
  const unsubUsers = onSnapshot(qUsers, (snapshot) => {
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString?.() || doc.data().createdAt
    } as User));
    store.setState({ users });
    console.log(`👥 Synced ${users.length} users from Firebase`);
  }, (error) => {
    console.error("❌ Firestore Users Error:", error);
  });
  unsubscribers.push(unsubUsers);

  store.setState({ isInitialized: true });
  console.log('✅ Firebase sync initialized');
};

/**
 * Stop all Firebase subscriptions
 */
export const stopFirebaseSync = () => {
  console.log('🛑 Stopping Firebase sync...');
  unsubscribers.forEach(unsub => unsub());
  unsubscribers = [];
};
