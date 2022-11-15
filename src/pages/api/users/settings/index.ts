import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '../../../../utils/serverSession';
import { prisma } from '../../../../utils/db';
import { User } from '@prisma/client';

type Data = {
  user: User;
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    res.status(200).json({
      user: JSON.parse(JSON.stringify(user)),
    });
  } catch (err) {
    res.status(500).end();
  }
}
