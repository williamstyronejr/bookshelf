// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '../../../utils/serverSession';
import { prisma } from '../../../utils/db';

type Data = {
  user: {
    role: string;
  } | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const session = await getServerAuthSession({ req, res });

  if (!session || !session.user) return res.status(200).json({ user: null });

  const userData = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
    },
  });

  return res.status(200).json({ user: userData });
}
