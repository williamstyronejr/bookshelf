import type { NextApiRequest, NextApiResponse } from 'next';
import { Prisma } from '@prisma/client';
import { prisma } from '../../../../utils/db';
import { validateAuthor } from '../../../../utils/validation';
import { deleteFirebaseFile, uploadFile } from '../../../../utils/upload';
import { createSlug } from '../../../../utils/slug';
import { getUserDataFromSession } from '../../../../utils/serverSession';
import { defaultProfileImage } from '../../../../utils/default';

type Data = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  const { method, query } = req;

  if (method !== 'POST' || !query.id || query.id === '')
    return res.status(404).send('');

  try {
    const { session, user } = await getUserDataFromSession({ req, res });
    if (!session || !user) {
      return res.redirect(401, '/api/auth/signin');
    } else if (user.role !== 'ADMIN') {
      return res.status(403).end();
    }

    const { fields, publicUrl } = await uploadFile(req);
    const { errors, valid } = validateAuthor(fields, true);
    if (!valid) return res.status(400).json(errors);

    const data: Prisma.AuthorUpdateInput = {};
    if (fields.bio) data.bio = fields.bio;
    if (fields.name) {
      data.name = fields.name;
      data.slug = createSlug(fields.name);
    }
    if (publicUrl || fields.profileImage_remove === 'true') {
      const oldAuthor = await prisma.author.findUnique({
        where: { id: parseInt(query.id.toString()) },
      });

      if (
        oldAuthor &&
        oldAuthor.profileImage &&
        oldAuthor.profileImage !== defaultProfileImage
      ) {
        await deleteFirebaseFile(oldAuthor.profileImage);
      }
      data.profileImage = publicUrl || defaultProfileImage;
    }

    const author = await prisma.author.update({
      where: {
        id: parseInt(query.id.toString()),
      },
      data,
    });

    res.status(200).json({ author });
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
