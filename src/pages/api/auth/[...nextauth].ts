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
    session: async ({ user, session }) => {
      if (session.user) {
        session.user.id = user.id;

        if (session.user.image) {
          // Grab base url for images
          const results = await prisma.storageSettings.findMany({
            where: { current: true },
          });

          if (results.length === 0 || results.length > 1) {
            // Error with storage base url
          } else {
            session.user.image = `${results[0].baseUrl}${session.user.image}?alt=media`;
          }
        }
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
