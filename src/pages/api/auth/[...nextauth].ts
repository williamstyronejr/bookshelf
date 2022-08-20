import NextAuth, { NextAuthOptions } from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../utils/db';

const { EMAIL_FROM, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } =
  process.env;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      type: 'email',
      server: {
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        auth: {
          user: EMAIL_USER,
          pass: EMAIL_PASS,
        },
      },
      from: EMAIL_FROM,
    }),
  ],
  callbacks: {
    session: ({ user, session }) => {
      if (session.user) {
        session.user.id = user.id;
      }

      return session;
    },
  },
};

export default NextAuth(authOptions);
