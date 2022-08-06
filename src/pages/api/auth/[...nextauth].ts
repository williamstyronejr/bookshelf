import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '../../../utils/db';

export default NextAuth({
  // Configure one or more authentication providers
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  jwt: {
    maxAge: 60 * 60 * 24 * 30,
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // return {};
        console.log(credentials);

        return null;
      },
    }),
  ],
  pages: {
    signIn: 'auth/signin',
    error: 'auth/error',
  },
});
