// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

type Data = {
  current: Array<any>;
  favoriteAuthor: Array<{ name: string; slug: string }>;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  res.status(200).json({
    current: [
      {
        id: crypto.pseudoRandomBytes(10).toString('hex'),
        title: 'Title',
        author: 'Author',
        displayImage:
          'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
      },
      {
        id: crypto.pseudoRandomBytes(10).toString('hex'),
        title: 'Title 2',
        author: 'Author 3',
        displayImage:
          'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
      },
    ],
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
}
