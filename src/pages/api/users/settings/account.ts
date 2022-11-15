import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../utils/db';
import { defaultProfileImage } from '../../../../utils/default';
import { getServerAuthSession } from '../../../../utils/serverSession';
import { deleteFirebaseFile, uploadFile } from '../../../../utils/upload';
import { validateAccount } from '../../../../utils/validation';

type Data = {};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method } = req;

  if (method !== 'POST') return res.status(404).end();

  try {
    const session = await getServerAuthSession({ req, res });
    if (!session || !session.user || !session.user.id)
      return res.status(401).end();

    const { fields, publicUrl } = await uploadFile(req);
    const { errors, valid } = validateAccount(fields);
    if (!valid) return res.status(400).json(errors);

    let profileImage = undefined;
    if (fields.profileImage_remove === 'true' || publicUrl) {
      let oldProfileImage = session.user.image;
      if (typeof oldProfileImage !== 'string') {
        const oldUser = await prisma.user.findUnique({
          where: { id: session.user.id },
        });
        if (!oldUser) return res.status(500).end();
        oldProfileImage = oldUser.image as string;
      }

      if (oldProfileImage !== defaultProfileImage)
        await deleteFirebaseFile(oldProfileImage);
      profileImage = publicUrl || defaultProfileImage;
    }

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: fields.username || undefined,
        email: fields.email || undefined,
        image: profileImage,
      },
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
