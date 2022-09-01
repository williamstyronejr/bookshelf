import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';

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
