// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  results: Array<any>;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { query } = req;

  console.log(query);
  res.status(200).json({ results: [] });
}
