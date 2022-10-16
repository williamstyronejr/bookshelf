import type { NextComponentType, NextPageContext } from 'next';
import 'next';

declare module 'next' {
  /**
   * `Page` type, use it as a guide to create `pages` with auth prop for protecting routes.
   */
  // eslint-disable-next-line no-unused-vars
  type NextPage<P = {}, IP = P> = NextComponentType<NextPageContext, IP, P> & {
    auth?: {
      admin?: boolean;
    };
  };
}
