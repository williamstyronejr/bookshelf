import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { getServerAuthSession } from '../../../utils/serverSession';

type Data = {
  id: number;
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  const { method, body } = req;

  if (method !== 'POST') return res.status(404);

  try {
    const session = await getServerAuthSession({ req, res });
    if (!session || !session.user) return res.redirect(401, '/api/auth/signin');

    const publisher = await prisma.publisher.create({
      data: {
        name: body.name,
      },
      select: { id: true, name: true },
    });

    res.status(200).json(publisher);
  } catch (err) {
    console.log(err);
    res.status(500).send('');
  }
}
