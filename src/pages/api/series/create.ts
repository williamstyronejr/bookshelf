import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { getUserDataFromSession } from '../../../utils/serverSession';

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
    const { session, user } = await getUserDataFromSession({ req, res });
    if (!session || !user) {
      return res.redirect(401, '/api/auth/signin');
    } else if (user.role !== 'ADMIN') {
      return res.status(403).end();
    }

    const series = await prisma.series.create({
      data: {
        name: body.name.toString(),
      },
    });

    return res.status(200).json(series);
  } catch (err) {
    console.log(err);
    res.status(500).send('');
  }
}
