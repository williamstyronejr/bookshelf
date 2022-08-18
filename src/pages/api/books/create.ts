import type { NextApiRequest, NextApiResponse } from 'next';
import { validateBook } from '../../../utils/validation';

type Data = {
  id: string;
  slug: string;
};

type ErrorResponse = {
  title?: string;
  author?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse | String>
) {
  const { body, method } = req;

  if (method !== 'POST') return res.status(404).send('');

  const { errors, valid } = validateBook(body);
  if (!valid) return res.status(400).json(errors);

  try {
    res.status(200).json({
      id: 'test',
      slug: 'testslug',
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('');
  }
}
