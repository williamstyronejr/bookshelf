import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../utils/db';
import { validateAuthor } from '../../../utils/validation';
import { uploadFirebaseFile } from '../../../utils/upload';
import { createSlug } from '../../../utils/slug';

type Data = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  const { method } = req;
  let publicUrl = '';

  if (method !== 'POST') return res.status(404).send('');

  try {
    const { fields } = await new Promise<{ fields: any; files: any }>(
      (resolve, rej) => {
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

          resolve({
            fields: Object.fromEntries(
              Object.entries(fields).map((kv) => [kv[0], kv[1].toString()])
            ),
            files,
          });
        });
      }
    );

    const { errors, valid } = validateAuthor(fields);
    if (valid) return res.status(400).json(errors);

    const data: Prisma.AuthorCreateInput = {
      slug: createSlug(fields.name),
      name: fields.name,
    };
    if (publicUrl) data.profileImage = publicUrl;
    if (fields.bio) data.bio = fields.bio;

    const author = await prisma.author.create({
      data,
    });

    res.status(200).json(author);
  } catch (err) {
    console.log(err);
    res.status(500).send('');
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
