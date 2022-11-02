import type { NextApiRequest, NextApiResponse } from 'next';
import { validatePagination } from '../../utils/validation';
import { prisma } from '../../utils/db';

type Data = {
  results: Array<any>;
  nextPage: Number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { page, limit, q, genre },
    method,
  } = req;

  if (method !== 'GET') return res.status(404).end();
  if (!page) return res.status(200).json({ results: [], nextPage: 0 });

  try {
    const numPage = page ? parseInt(page.toString()) : NaN;
    const take = limit ? parseInt(limit.toString()) : 10;

    if (!validatePagination(numPage, take))
      return res.status(200).json({ results: [], nextPage: 0 });

    const where: any = {};
    if (q) {
      where.title = {
        contains: q.toString(),
        mode: 'insensitive',
      };
    }

    if (genre) {
      where.BookGenres = {
        some: {
          genreId: parseInt(genre?.toString()),
        },
      };
    }

    const results = await prisma.book.findMany({
      take,
      skip: numPage * take,
      include: {
        author: true,
        BookGenres: true,
      },
      where,
    });

    return res.status(200).json({
      nextPage: numPage + 1,
      results: JSON.parse(JSON.stringify(results)),
    });
  } catch (err) {
    console.log(err);
    return res.status(500).end();
  }
}
