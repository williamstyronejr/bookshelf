import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';

type Data = {
  results: Array<{
    id: number;
    name: string;
  }>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  const {
    query: { name },
  } = req;

  try {
    const results = await prisma.publisher.findMany({
      where: {
        name: {
          contains: name?.toString() || '',
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    res.status(200).json({
      results,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('');
  }
}
