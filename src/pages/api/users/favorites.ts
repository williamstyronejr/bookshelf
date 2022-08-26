import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '../../../utils/serverSession';
import { prisma } from '../../../utils/db';

type Data = {
  results: Array<any>;
  nextPage: Number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { query, method } = req;
  const session = await getServerAuthSession({ req, res });
  if (!session || !session.user) return res.redirect(401, '/api/auth/signin');

  switch (method) {
    case 'GET': {
      const page = query.page ? parseInt(query.page.toString()) : NaN;
      const take = query.limit ? parseInt(query.limit.toString()) : 10;

      if (isNaN(page) || page < 0 || take < 0)
        return res.status(200).json({ nextPage: 0, results: [] });

      const results = await prisma.favorite.findMany({
        where: {
          userId: session.user.id,
        },
      });

      res.status(200).json({
        nextPage: page + 1,
        results,
      });
      break;
    }
    default:
      return res.status(404);
  }
}
