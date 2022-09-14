import { IncomingMessage, ServerResponse } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth/next';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { prisma } from './db';

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

export async function getUserDataFromSession(ctx: {
  req:
    | NextApiRequest
    | (IncomingMessage & {
        cookies: NextApiRequestCookies;
      });
  res: NextApiResponse | ServerResponse;
}) {
  const session = await getServerAuthSession(ctx);
  if (!session || !session.user) return { session: null, user: null };

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return { session, user };
}
