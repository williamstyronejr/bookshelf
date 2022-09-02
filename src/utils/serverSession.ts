import { IncomingMessage, ServerResponse } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { authOptions } from '../pages/api/auth/[...nextauth]';

export async function getServerAuthSession(ctx: {
  req:
    | NextApiRequest
    | (IncomingMessage & {
        cookies: NextApiRequestCookies;
      });
  res: NextApiResponse | ServerResponse;
}) {
  return await unstable_getServerSession(ctx.req, ctx.res, authOptions);
}
