import admin from 'firebase-admin';
import crypto from 'crypto';
import internal from 'stream';

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL,
} = process.env;

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert({
      // ENV adds \ to \n, need to replace otherwise error in format
      privateKey: `${FIREBASE_PRIVATE_KEY?.replaceAll('\\n', '\n')}`,
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const storage = admin.storage().bucket(FIREBASE_STORAGE_BUCKET);

export const uploadFirebaseFile = function (
  fileName: string,
  contentType: string
): {
  blobWriter: internal.Writable;
  url: string;
  blob: any;
} {
  if (!fileName) throw new Error('Filename not provided.');
  const newFileName = `${crypto.pseudoRandomBytes(8).toString('hex')}.${
    fileName.split('.').slice(-1)[0]
  }`;

  const blob = storage.file(newFileName);
  const blobWriter = blob.createWriteStream({
    metadata: {
      contentType,
    },
  });

  return {
    blobWriter,
    url: `https://firebasestorage.googleapis.com/v0/b/${storage.name}/o/${newFileName}?alt=media`,
    blob,
  };
};
