import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useInfiniteQuery } from '@tanstack/react-query';
import useInfiniteScroll from 'react-infinite-scroll-hook';

const UserListPage: NextPage = () => {
  const { query } = useRouter();

  return (
    <section>
      <header></header>

      <div>User list items</div>
    </section>
  );
};

UserListPage.auth = {
  admin: false,
};

export default UserListPage;
