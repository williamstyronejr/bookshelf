import { Author } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../utils/db';
import { getUserDataFromSession } from '../../../../utils/serverSession';

type Data = {
  success: boolean;
  author: Author | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    method,
    query: { id },
  } = req;

  if (method !== 'DELETE') return res.status(404).end();
  if (!id) return res.status(404).end();

  try {
    const { session, user } = await getUserDataFromSession({ req, res });
    if (!session || !user) {
      return res.redirect(401, '/api/auth/signin');
    } else if (user.role !== 'ADMIN') {
      return res.status(403).end();
    }

    const author = await prisma.author.delete({
      where: {
        id: parseInt(id.toString()),
      },
    });

    return res.status(200).json({
      success: !!author,
      author: JSON.parse(JSON.stringify(author)),
    });
  } catch (err) {
    return res.status(500).end();
  }
}
