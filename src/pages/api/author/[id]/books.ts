import type { NextApiRequest, NextApiResponse } from 'next';
import { validatePagination } from '../../../../utils/validation';
import { prisma } from '../../../../utils/db';

type Data = {
  results: Array<any>;
  nextPage: Number | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { page, limit, id },
    method,
  } = req;

  if (method !== 'GET' || !id || id === '') return res.status(404).end();
  if (!page) return res.status(200).json({ results: [], nextPage: 0 });

  try {
    const numPage = page ? parseInt(page.toString()) : NaN;
    const take = limit ? parseInt(limit.toString()) : 10;

    if (!validatePagination(numPage, take))
      return res.status(200).json({ results: [], nextPage: 0 });

    const results = await prisma.book.findMany({
      take,
      skip: numPage * take,
      where: {
        authorId: parseInt(id.toString()),
      },
      include: {
        author: true,
      },
    });

    return res.status(200).json({
      nextPage: results.length === take ? numPage + 1 : null,
      results: JSON.parse(JSON.stringify(results)),
    });
  } catch (err) {
    return res.status(500).end();
  }
}
