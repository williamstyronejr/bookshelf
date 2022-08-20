import type { NextComponentType, NextPageContext } from 'next';
import 'next';

type Auth = {
  role?: string;
};

declare module 'next' {
  /**
   * `Page` type, use it as a guide to create `pages` with auth prop for protecting routes.
   */
  type NextPage<P = {}, IP = P> = NextComponentType<NextPageContext, IP, P> & {
    auth?: Auth;
  };
}
