import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '../../../utils/serverSession';
import { prisma } from '../../../utils/db';
import { validatePagination } from '../../../utils/validation';

type Data = {
  results: Array<any>;
  nextPage: Number | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { query, method } = req;

  if (method !== 'GET') return res.status(404).end();

  try {
    const session = await getServerAuthSession({ req, res });
    if (!session || !session.user) return res.redirect(401, '/api/auth/signin');

    const page = query.page ? parseInt(query.page.toString()) : NaN;
    const take = query.limit ? parseInt(query.limit.toString()) : 10;

    if (!validatePagination(page, take))
      return res.status(200).json({ results: [], nextPage: 0 });

    const results = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        book: {
          include: {
            author: true,
            publisher: true,
          },
        },
      },
    });

    res.status(200).json({
      nextPage: results.length === take ? page + 1 : null,
      results,
    });
  } catch (err) {
    return res.status(500).end();
  }
}
