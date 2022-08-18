// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

type Data = {
  results: Array<any>;
  nextPage: Number;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | string>
) {
  const {
    query: { page },
    method,
  } = req;

  if (method !== 'GET') return res.status(404).send('');
  if (!page) return res.status(200).json({ results: [], nextPage: 0 });

  res.status(200).json({
    nextPage: parseInt(page.toString()) + 1,
    results: [
      {
        id: crypto.pseudoRandomBytes(10).toString('hex'),
        name: 'Title',
        slug: 'Author',
        bio: '',
        profileImage:
          'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
      },
      {
        id: crypto.pseudoRandomBytes(10).toString('hex'),
        name: 'Title',
        slug: 'Author',
        bio: '',
        profileImage:
          'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
      },
    ],
  });
}
