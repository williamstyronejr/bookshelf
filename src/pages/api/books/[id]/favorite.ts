import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerAuthSession } from '../../../../utils/serverSession';
import { prisma } from '../../../../utils/db';
import { Favorite } from '@prisma/client';

type Data = {
  favorite: boolean;
  data: Favorite | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { id },
    method,
  } = req;

  if (!id) return res.status(400).end();
  const bookId = parseInt(id.toString());

  try {
    const session = await getServerAuthSession({ req, res });

    if (!session || !session.user || !session.user.id)
      return res.status(401).redirect('/api/auth/signin');

    switch (method) {
      case 'GET': {
        const favorite = await prisma.favorite.findUnique({
          where: {
            userId_bookId: {
              userId: session.user.id,
              bookId: bookId,
            },
          },
        });

        return res.status(200).json({ favorite: !!favorite, data: favorite });
      }

      case 'POST': {
        let initialFavorite = await prisma.favorite.findUnique({
          where: {
            userId_bookId: {
              userId: session.user.id,
              bookId: bookId,
            },
          },
        });

        if (initialFavorite) {
          await prisma.favorite.delete({ where: { id: initialFavorite.id } });
          return res.status(200).json({ favorite: false, data: null });
        } else {
          const favorite = await prisma.favorite.create({
            data: {
              book: {
                connect: {
                  id: bookId,
                },
              },
              user: {
                connect: {
                  id: session.user.id,
                },
              },
            },
          });
          return res.status(200).json({ favorite: true, data: favorite });
        }
      }

      default:
        return res.status(404).end();
    }
  } catch (err) {
    return res.status(500).end();
  }
}
