# Business Circle

A playground for entrepreneurs (to be) from all kinds of fields. To play, help, pitch, converse, share, and celebrate. Together.

## Setup Guide

### 1. Firebase Setup (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"** → Name it "BusinessCircle" → Continue
3. Disable Google Analytics (optional) → Create Project
4. In the project dashboard, click the **web icon** `</>` to add a web app
5. Name it "BusinessCircle" → Register app
6. Copy the `firebaseConfig` object — you'll need it in step 2

#### Enable Authentication
1. In Firebase Console → **Authentication** → **Get Started**
2. Click **Email/Password** → Enable it → Save

#### Enable Firestore Database
1. In Firebase Console → **Firestore Database** → **Create Database**
2. Choose **Start in test mode** (we'll secure it later)
3. Select your region → Enable

#### Set Firestore Security Rules
Go to Firestore → Rules tab → paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read all profiles, but only edit their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    // Invites: anyone authenticated can read, create; only system updates on use
    match /invites/{inviteId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update: if true;
    }
  }
}
```

### 2. Add Firebase Config to the App

Edit `src/firebase.js` and replace the placeholder config with your actual Firebase config:

```js
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Create Your Admin Account

1. Deploy or run the app locally first
2. Go to Firebase Console → Firestore → invites collection
3. Manually add a document with ID `BC-ADMIN001`:
   - `createdBy`: `"root"`
   - `used`: `false`
   - `usedBy`: `null`
   - `createdAt`: (current timestamp)
   - `usedAt`: `null`
4. Sign up on the app using code `BC-ADMIN001`
5. In Firestore → users collection → find your user document → change `role` to `"admin"`

Now you have admin access and can generate invites from the Admin panel.

### 4. Deploy

```bash
npm install
npm run deploy
```

The site will be live at: `https://itsyouitsus.github.io/BusinessCircle/`

### Local Development

```bash
npm install
npm start
```

## Tech Stack

- React 18
- Firebase Auth + Firestore (free tier)
- GitHub Pages hosting (free)
- No server needed
