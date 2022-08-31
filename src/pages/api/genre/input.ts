import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';

type Data = {
  results: Array<{
    id: bigint;
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
    const genres = await prisma.genre.findMany({
      where: {
        name: {
          contains: name?.toString() || '',
          mode: 'insensitive',
        },
      },
    });

    res.status(200).json({
      results: genres,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('');
  }
}
