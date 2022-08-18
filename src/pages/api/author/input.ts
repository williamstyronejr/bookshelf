// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';

type Data = {
  authors: Array<{
    name: string;
    slug: string;
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
    const authors = await prisma.author.findMany({
      where: {
        name: {
          contains: name?.toString() || '',
          mode: 'insensitive',
        },
      },
      select: { name: true, slug: true },
    });

    res.status(200).json({
      authors,
    });
  } catch (err) {
    res.status(500).send('');
  }
}
