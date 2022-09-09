import { Author } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../utils/db';

type Data = {
  success: boolean;
  author: Author | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    method,
    query: { id },
  } = req;
  console.log(method);

  switch (method) {
    case 'DELETE': {
      if (!id) return res.status(404).end();

      const author = await prisma.author.delete({
        where: {
          id: parseInt(id.toString()),
        },
      });

      return res.status(200).json({
        success: !!author,
        author: JSON.parse(JSON.stringify(author)),
      });
    }
    default:
      res.status(500).end();
  }
}
