import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

type Data = {
  book: any;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {
    query: { page },
  } = req;

  if (!page) return;

  res.status(200).json({
    book: {
      id: crypto.pseudoRandomBytes(10).toString('hex'),
      title: 'Title',
      author: 'Author',
      displayImage:
        'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
    },
  });
}
