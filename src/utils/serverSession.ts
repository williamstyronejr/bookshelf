import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { authOptions } from '../pages/api/auth/[...nextauth]';

export async function getServerAuthSession(ctx: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  return await unstable_getServerSession(ctx.req, ctx.res, authOptions);
}
