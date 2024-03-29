import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';
import Section from '../../../components/ui/Section';
import LoadingWheel from '../../../components/LoadingWheel';
import RefetchError from '../../../components/RefetchError';

const UserListPage: NextPage = () => {
  const { query } = useRouter();
  const queryClient = useQueryClient();

  const {
    data,
    error,
    isFetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['list', query.slug],
    async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/api/users/favorites?page=${pageParam}&limit=10`
      );

      if (res.ok) return await res.json();
      throw new Error('An unexpected error occurred, please try again.');
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextPage === null ? lastPage.nextPage : undefined;
      },
      keepPreviousData: true,
      enabled: !!query.slug,
    }
  );

  const { mutate, isLoading: isUpdating } = useMutation(
    ['favorite', 'update'],
    async ({ bookId }: { bookId: string }) => {
      const res = await fetch(`/api/books/${bookId}/favorite`, {
        method: 'POST',
      });

      if (res.ok) return await res.json();
      throw new Error('An unexpected error occurred, please try again.');
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['list', query.slug]);
      },
    }
  );

  const [sentryRef] = useInfiniteScroll({
    loading: isFetchingNextPage || isFetching,
    hasNextPage: !!hasNextPage,
    onLoadMore: fetchNextPage,
    disabled: !!error,
    rootMargin: '0px 0px 200px 0px',
  });

  return (
    <Section>
      <Head>
        <title>Favorites</title>
      </Head>

      <header>
        <h4 className="font-semibold text-xl">Favorites</h4>
      </header>

      <div className="">
        <ul className="flex flex-col flex-nowrap">
          {data && data.pages
            ? data.pages.map((page) =>
                page.results.map(({ book }: { book: any }) => (
                  <li
                    key={book.id}
                    data-cy="favorite-item"
                    className="flex flex-col items-center md:flex-row flex-nowrap my-4 border py-2 px-2 rounded-lg"
                  >
                    <Link href={`/book/${book.id}/${book.slug}`}>
                      <div className="relative w-32 h-40 md:mr-6">
                        <Image
                          className="rounded-lg"
                          priority={true}
                          fill={true}
                          src={book.displayImage}
                          alt="Book covers"
                        />
                      </div>
                    </Link>

                    <div className="md:flex-grow">
                      <Link
                        className="font-medium"
                        href={`/book/${book.id}/${book.slug}`}
                      >
                        <div className="">{book.title}</div>
                      </Link>

                      <Link
                        className="text-gray-600"
                        href={`/author/${book.author.id}/${book.author.slug}`}
                      >
                        {book.author.name}
                      </Link>
                    </div>

                    <button
                      type="button"
                      className="text-lg md:mr-6 rounded-lg py-3 px-3 text-white bg-red-600"
                      disabled={isUpdating}
                      onClick={() => {
                        mutate({ bookId: book.id });
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))
              )
            : null}

          {data &&
          data.pages &&
          data.pages.length === 1 &&
          data.pages[0].results.length === 0 ? (
            <li className="font-semibold text-3xl text-center py-8">
              There are no items in this list
            </li>
          ) : null}

          {error ? <RefetchError refetch={refetch} /> : null}

          {isFetching || hasNextPage ? (
            <div ref={sentryRef} className="py-20">
              <LoadingWheel />
            </div>
          ) : null}
        </ul>
      </div>
    </Section>
  );
};

UserListPage.auth = {
  admin: false,
};

export default UserListPage;
