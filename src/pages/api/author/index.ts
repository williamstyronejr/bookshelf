import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { validatePagination } from '../../../utils/validation';

type Data = {
  results: Array<any>;
  nextPage: Number | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  const { query, method } = req;

  if (method !== 'GET') return res.status(404).end();
  if (!query.page) return res.status(200).json({ results: [], nextPage: 0 });

  try {
    const page = query.page ? parseInt(query.page.toString()) : NaN;
    const take = query.limit ? parseInt(query.limit.toString()) : 10;
    if (!validatePagination(page, take))
      return res.status(200).json({ results: [], nextPage: 0 });

    const authors = await prisma.author.findMany({
      take,
      skip: page * take,
      include: {
        books: {
          take: 3,
        },
      },
    });

    return res.status(200).json({
      results: JSON.parse(JSON.stringify(authors)),
      nextPage: authors.length === take ? page + 1 : null,
    });
  } catch (err) {
    res.status(500);
  }
}
