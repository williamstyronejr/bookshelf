import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

type Data = {
  book?: any;
  reservation?: any;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { body, method } = req;

  if (method === 'GET') {
    return res.status(200).json({
      book: {
        id: crypto.pseudoRandomBytes(10).toString('hex'),
        title: 'Title',
        author: 'Author',
        displayImage:
          'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
      },
    });
  } else if (method === 'POST') {
    // Save reservation
    const { reserveLength } = JSON.parse(body);
    console.log(reserveLength);

    return res.status(200).json({
      reservation: {
        id: '1234',
      },
    });
  }
}
