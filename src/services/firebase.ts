import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { User, UserRole } from '../types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate Firebase configuration
if (!firebaseConfig.apiKey) {
  console.warn('⚠️ Firebase configuration incomplete. Check environment variables.');
}

// Only initialize if we have the config
export const app = firebaseConfig.apiKey ? initializeApp(firebaseConfig) : null;
export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
export const storage = app ? getStorage(app) : null;
export const googleProvider = app ? new GoogleAuthProvider() : null;

// Enable persistence
if (auth) {
  setPersistence(auth, browserLocalPersistence).catch(err => 
    console.warn('Persistence setup error:', err)
  );
}

/**
 * Create or update user profile in Firestore
 */
export const createOrUpdateUserProfile = async (
  firebaseUser: FirebaseUser,
  role: UserRole = 'citizen',
  department?: string
): Promise<User | null> => {
  if (!db) throw new Error("Firebase Firestore not configured");

  const userRef = doc(db, 'users', firebaseUser.uid);
  const userSnap = await getDoc(userRef);

  let user: User;

  if (userSnap.exists()) {
    // Update existing user
    user = userSnap.data() as User;
  } else {
    // Create new user
    user = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || 'Citizen User',
      email: firebaseUser.email || '',
      avatar: firebaseUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      heroPoints: 0,
      role,
      department,
      reportsCount: 0,
      resolvedCount: 0,
      badges: [],
      createdAt: firebaseUser.metadata?.creationTime?.toISOString() || new Date().toISOString()
    };
  }

  // Persist to Firestore
  await setDoc(userRef, {
    ...user,
    updatedAt: serverTimestamp(),
    lastSignIn: new Date().toISOString()
  }, { merge: true });

  return user;
};

/**
 * Get user by UID from Firestore
 */
export const getUserByUID = async (uid: string): Promise<User | null> => {
  if (!db) return null;
  
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  
  return userSnap.exists() ? (userSnap.data() as User) : null;
};

/**
 * Check if user is admin or officer by email
 */
export const checkUserRole = async (email: string): Promise<UserRole> => {
  if (!db) return 'citizen';

  // Check admin collection
  const adminQuery = query(collection(db, 'admins'), where('email', '==', email));
  const adminSnap = await getDocs(adminQuery);
  if (!adminSnap.empty) return 'admin';

  // Check officers collection
  const officersQuery = query(collection(db, 'officers'), where('email', '==', email));
  const officersSnap = await getDocs(officersQuery);
  if (!officersSnap.empty) return 'officer';

  return 'citizen';
};

/**
 * Login with Google
 */
export const loginWithGoogle = async (): Promise<{ user: User; firebaseUser: FirebaseUser }> => {
  if (!auth || !googleProvider) throw new Error("Firebase not configured");
  
  const result = await signInWithPopup(auth, googleProvider);
  const firebaseUser = result.user;

  // Check user role
  const role = await checkUserRole(firebaseUser.email || '');

  // Create or update user profile
  const user = await createOrUpdateUserProfile(firebaseUser, role);
  if (!user) throw new Error('Failed to create user profile');

  return { user, firebaseUser };
};

/**
 * Logout
 */
export const logout = async (): Promise<void> => {
  if (!auth) throw new Error("Firebase not configured");
  return signOut(auth);
};

/**
 * Listen to auth state changes
 */
export const onAuthChanged = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) {
    console.warn('Firebase auth not configured');
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

/**
 * Get current Firebase user
 */
export const getCurrentFirebaseUser = (): FirebaseUser | null => {
  if (!auth) return null;
  return auth.currentUser;
};

/**
 * Initialize sample data (for first-time setup)
 */
export const initializeSampleData = async () => {
  if (!db) return;
  
  console.log('Initializing sample data...');
  
  const samplesRef = collection(db, 'issues');
  const existingSnap = await getDocs(query(samplesRef));
  
  // Only initialize if no issues exist
  if (existingSnap.empty) {
    console.log('Database is empty. Seed it with your own data via Firebase Console.');
  }
};
