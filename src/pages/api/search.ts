// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
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
    query: { page, limit, q },
    method,
  } = req;

  if (method !== 'GET') return res.status(404).end();
  if (!page) return res.status(200).json({ results: [], nextPage: 0 });

  try {
    const numPage = page ? parseInt(page.toString()) : NaN;
    const take = limit ? parseInt(limit.toString()) : 10;

    if (!validatePagination(numPage, take))
      return res.status(200).json({ results: [], nextPage: 0 });

    const results = await prisma.book.findMany({
      take,
      skip: numPage * take,
      include: {
        author: true,
        BookGenres: true,
      },
      where: q
        ? {
            title: {
              contains: q.toString(),
              mode: 'insensitive',
            },
          }
        : {},
    });

    return res.status(200).json({
      nextPage: numPage + 1,
      results: JSON.parse(JSON.stringify(results)),
    });
  } catch (err) {
    return res.status(500).end();
  }
}
