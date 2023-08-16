import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../utils/db';
import { getUserDataFromSession } from '../../../../utils/serverSession';

type Data = {
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method, query } = req;

  if (method !== 'POST' || !query.id || query.id === '')
    return res.status(404).end();

  try {
    const { session, user } = await getUserDataFromSession({ req, res });
    if (!session || !user) {
      return res.redirect(401, '/api/auth/signin');
    } else if (user.role !== 'ADMIN') {
      return res.status(403).end();
    }

    const deleteAuthor = await prisma.author.delete({
      where: {
        id: parseInt(query.id.toString()),
      },
    });

    if (!deleteAuthor) return res.status(404).end();

    res.json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}
