import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '../../../utils/serverSession';
import { prisma } from '../../../utils/db';

type Data = {
  current: Array<any>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method } = req;

  if (method !== 'GET') return res.status(404).end();

  try {
    const session = await getServerAuthSession({ req, res });
    if (!session || !session.user || !session.user.id)
      return res.status(401).end();

    const current = await prisma.reservation.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        book: {
          include: {
            author: true,
          },
        },
      },
    });

    res.status(200).json({
      current: JSON.parse(JSON.stringify(current)),
    });
  } catch (err) {
    res.status(500).end();
  }
}
