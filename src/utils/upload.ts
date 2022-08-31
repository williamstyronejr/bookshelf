import { NextApiRequest } from 'next';
import admin from 'firebase-admin';
import crypto from 'crypto';
import internal from 'stream';
import formidable from 'formidable';

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

export const uploadFile = function (
  req: NextApiRequest
): Promise<{ fields: any; publicUrl: string | undefined; files: any }> {
  return new Promise((res, rej) => {
    let publicUrl: string | undefined;

    const form = formidable({
      multiples: true,
      uploadDir: __dirname,
      maxFiles: 1,
      filter: (part) => {
        return part.originalFilename !== '';
      },
      fileWriteStreamHandler: function () {
        const file = arguments[0] as any; // BUG WITH THEIR TYPING
        const { blobWriter, url } = uploadFirebaseFile(
          file.originalFilename,
          file.mimetype
        );

        publicUrl = url;
        return blobWriter;
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) rej(err);

      res({
        publicUrl,
        fields: Object.fromEntries(
          Object.entries(fields).map((kv) => [kv[0], kv[1].toString()])
        ),
        files,
      });
    });
  });
};
