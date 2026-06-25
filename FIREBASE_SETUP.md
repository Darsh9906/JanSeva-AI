# CivicPulse Firebase Production Setup Guide

## Overview
CivicPulse is now production-ready with full Firebase integration. This guide covers setup, security rules, and data initialization.

## Prerequisites
- Firebase project created (janseva-ai-5345d)
- Firebase CLI installed (`npm install -g firebase-tools`)
- Admin credentials configured

## 1. Environment Configuration ✅

All environment variables are configured in `.env.local`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=janseva-ai-5345d.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=janseva-ai-5345d
VITE_FIREBASE_STORAGE_BUCKET=janseva-ai-5345d.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=52610686724
VITE_FIREBASE_APP_ID=1:52610686724:web:ab3dfa331227804845fa51
```

## 2. Firebase Collections Setup

Create the following Firestore collections:

### A. **users** Collection
Stores citizen, officer, and admin profiles.

**Schema:**
```typescript
{
  id: string;                    // Firebase Auth UID
  name: string;
  email: string;
  avatar: string;               // Photo URL
  heroPoints: number;           // Earned through participation
  role: "citizen" | "officer" | "admin";
  department?: string;          // For officers/admins
  reportsCount: number;
  resolvedCount: number;        // For officers only
  badges: string[];            // Achievement badges
  createdAt: string;           // ISO timestamp
  updatedAt: timestamp;
  lastSignIn: string;
}
```

**Sample Document:**
```json
{
  "id": "firebase-uid-12345",
  "name": "Elena Rostova",
  "email": "elena.rostova@gmail.com",
  "avatar": "https://...",
  "heroPoints": 340,
  "role": "citizen",
  "reportsCount": 8,
  "resolvedCount": 0,
  "badges": ["First Report 🎖️", "Verified Neighbor 🛡️"],
  "createdAt": "2026-01-15T08:30:00Z"
}
```

### B. **issues** Collection
Stores all reported municipal issues.

**Schema:**
```typescript
{
  id: string;
  title: string;
  description: string;
  category: "Pothole" | "Water Leakage" | "Streetlight" | ... ;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Reported" | "Verified" | "Assigned" | "In Progress" | "Resolved";
  department: string;           // Target department
  confidence: number;           // 0-1 (AI confidence score)
  riskScore: number;           // 0-100
  estimatedCost: number;       // USD
  estimatedFixTime: string;    // e.g., "24 hours"
  latitude: number;
  longitude: number;
  address: string;
  imageUrl: string;
  mediaType: "photo" | "video";
  verificationStatus: "Verified" | "Likely Verified" | "Needs Review";
  confirmCount: number;        // Community confirmations
  upvoteCount: number;
  rejectCount: number;
  commentCount: number;
  createdBy: string;          // User ID
  createdByName: string;
  assignedTo?: string;        // Officer UID
  assignedOfficerName?: string;
  timeline: TimelineEntry[];
  createdAt: timestamp;
  updatedAt: timestamp;
  resolutionNote?: string;    // For resolved issues
}
```

### C. **comments** Collection
Stores discussion threads on issues.

**Schema:**
```typescript
{
  id: string;
  issueId: string;           // Reference to parent issue
  userId: string;            // User ID
  userName: string;
  userAvatar: string;
  message: string;
  createdAt: timestamp;
}
```

### D. **verifications** Collection
Stores user votes (confirmations, upvotes, rejections).

**Schema:**
```typescript
{
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  voteType: "confirm" | "upvote" | "reject";
  createdAt: timestamp;
}
```

### E. **admins** Collection (Optional)
Whitelist of admin emails.

**Schema:**
```typescript
{
  email: string;
  role: "admin";
  createdAt: timestamp;
}
```

### F. **officers** Collection (Optional)
Whitelist of officer emails with departments.

**Schema:**
```typescript
{
  email: string;
  role: "officer";
  department: string;
  createdAt: timestamp;
}
```

## 3. Firestore Security Rules

Deploy these security rules to protect your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow all reads
    match /{document=**} {
      allow read: if true;
    }

    // Users: Can only write their own profile
    match /users/{userId} {
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // Issues: Citizens can create, officers can update
    match /issues/{issueId} {
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
                       (request.auth.token.email.contains('@citygov.org') ||
                        request.auth.token.email.contains('@admin'));
    }

    // Comments: Authenticated users can create
    match /comments/{commentId} {
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Verifications: Authenticated users can create
    match /verifications/{verificationId} {
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }

    // Admins whitelist: Read only
    match /admins/{doc=**} {
      allow read: if request.auth != null;
    }

    // Officers whitelist: Read only
    match /officers/{doc=**} {
      allow read: if request.auth != null;
    }
  }
}
```

## 4. Google Authentication Setup

1. Go to Firebase Console → Authentication
2. Enable "Google" sign-in method
3. Add your domain to authorized redirect URIs:
   - Production: `https://your-domain.com`
   - Development: `http://localhost:5173`

## 5. Storage Setup (for images/videos)

Enable Firebase Storage for issue media:

```javascript
// Storage security rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /issues/{allPaths=**} {
      allow read: if true;
      allow create: if request.auth != null &&
                       request.resource.size < 50 * 1024 * 1024;  // 50MB max
      allow delete: if request.auth.uid == resource.metadata.uid;
    }
  }
}
```

## 6. Initial Data Migration

### Option A: Seed via Firebase Console
1. Go to Firebase Console → Firestore Database
2. Create collections and documents manually

### Option B: Use Firebase Admin SDK (Recommended)

Create `scripts/seedData.js`:
```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../path-to-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seedData() {
  const usersRef = db.collection('users');
  
  // Add sample users
  await usersRef.doc('user_1').set({
    name: 'Elena Rostova',
    email: 'elena@example.com',
    avatar: 'https://...',
    heroPoints: 340,
    role: 'citizen',
    reportsCount: 8,
    resolvedCount: 0,
    badges: ['First Report'],
    createdAt: new Date()
  });

  console.log('✅ Sample data seeded');
}

seedData().catch(console.error);
```

Run: `node scripts/seedData.js`

## 7. Testing Authentication

The app now implements proper Firebase authentication:

```typescript
// User signs in with Google
await loginWithGoogle();
// → Creates/updates user profile in Firestore
// → Automatically syncs user data
// → Sets Hero Points and badges

// User stays logged in across sessions (persistence enabled)

// Role-based access:
// - "citizen": Can report issues, vote, comment
// - "officer": Can update issue status, assign work
// - "admin": Full dashboard access
```

## 8. Production Deployment Checklist

- [ ] Update `.env.local` with production Firebase credentials
- [ ] Deploy security rules: `firebase deploy --only firestore:rules`
- [ ] Deploy storage rules: `firebase deploy --only storage`
- [ ] Add production domain to Google OAuth allowlist
- [ ] Enable authentication persistence
- [ ] Set up Cloud Backups
- [ ] Monitor Firestore usage via Firebase Console
- [ ] Configure Firebase logging and monitoring
- [ ] Test all auth flows in production
- [ ] Set up email verification for admin accounts

## 9. Common Issues & Fixes

**Issue: "Missing or insufficient permissions"**
- Check security rules match your collection structure
- Verify user is authenticated (check browser DevTools)

**Issue: "User profile not syncing"**
- Ensure `admins` and `officers` collections exist if using role-based access
- Check Firebase console for any errors in firebaseSync.ts

**Issue: "Images not uploading"**
- Verify Storage bucket is created
- Check storage security rules allow authenticated uploads
- Ensure image files are under 50MB

## 10. Monitoring

```bash
# Monitor Firestore usage
firebase emulators:start

# View logs
firebase functions:log

# Check auth state
firebase auth:export users.json
```

## Support

For issues with Firebase integration:
1. Check browser console for detailed error messages
2. Review Firebase Console activity logs
3. Verify all collections exist in Firestore
4. Confirm authentication is properly enabled

---

**Last Updated:** June 2026
**Version:** 2.0 Production Ready
