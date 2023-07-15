import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { Series } from '@prisma/client';

type Data = {
  results: Array<Series>;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  const {
    query: { name },
  } = req;

  try {
    const series = await prisma.series.findMany({
      where: {
        name: {
          contains: name?.toString() || '',
          mode: 'insensitive',
        },
      },
    });

    res.status(200).json({
      results: series,
    });
  } catch (err) {
    res.status(500).send('');
  }
}
