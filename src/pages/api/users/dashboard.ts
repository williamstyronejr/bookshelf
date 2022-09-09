import { Genre, GenreUserCount } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/db';
import { getServerAuthSession } from '../../../utils/serverSession';

type Data = {
  current: Array<any>;
  favoriteAuthor: Array<{ name: string; slug: string }>;
  favoriteGenres: Array<
    GenreUserCount & {
      genre: Genre;
    }
  >;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { method } = req;

  if (method !== 'GET') return res.status(404).end();

  try {
    const session = await getServerAuthSession({ req, res });

    if (!session || !session.user || !session.user.id)
      return res.status(401).end();

    const currentBooks = await prisma.reservation.findMany({
      where: {
        userId: session.user.id,
        status: {
          notIn: ['OVERDUE', 'RETURN'],
        },
      },
      include: {
        book: {
          include: {
            author: true,
          },
        },
      },
    });

    const mostVisitedGenres = await prisma.genreUserCount.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        {
          count: 'asc',
        },
      ],
      include: {
        genre: true,
      },
      take: 10,
    });

    res.status(200).json({
      current: JSON.parse(JSON.stringify(currentBooks)),
      favoriteGenres: mostVisitedGenres,
      favoriteAuthor: [
        {
          name: 'Author 1',
          slug: 'testing',
        },
        {
          name: 'Author 2',
          slug: 'testing2',
        },
      ],
    });
  } catch (err) {
    res.status(500).end();
  }
}
