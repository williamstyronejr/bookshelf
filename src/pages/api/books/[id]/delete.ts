import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../utils/db';
import { getUserDataFromSession } from '../../../../utils/serverSession';

type Data = {
  success: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    method,
    query: { id },
  } = req;

  if (method !== 'POST' || !id) return res.status(404).end();

  try {
    const { session, user } = await getUserDataFromSession({ req, res });
    if (!session || !user) {
      return res.redirect(401, '/api/auth/signin');
    } else if (user.role !== 'ADMIN') {
      return res.status(403).end();
    }

    const deleteBook = await prisma.book.delete({
      where: {
        id: parseInt(id.toString()),
      },
    });

    if (!deleteBook) return res.status(404).end();

    return res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).end();
  }
}
