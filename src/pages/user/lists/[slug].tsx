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

const UserListPage: NextPage = () => {
  const { query } = useRouter();
  const queryClient = useQueryClient();

  const {
    data,
    error,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['list', query.slug],
    async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/api/users/favorites?page=${pageParam}&limit=10`
      );

      if (res.statusText !== 'OK') {
        throw new Error('Invalid request');
      }

      const body = await res.json();
      return body;
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.results.length === 10 ? lastPage.nextPage : undefined;
      },
      keepPreviousData: true,
      enabled: !!query.slug,
    }
  );

  const { mutate } = useMutation(
    ['favorite', 'update'],
    async ({ bookId }: { bookId: string }) => {
      const res = await fetch(`/api/books/${bookId}/favorite`, {
        method: 'POST',
      });

      const body = await res.json();
      return body;
    },
    {
      onSuccess: (data) => {
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
    <section>
      <header></header>

      <div>
        <ul className="grid grid-cols-[repeat(auto-fit,_minmax(8rem,_1fr))] gap-4">
          {data && data.pages
            ? data.pages.map((page) =>
                page.results.map(({ book }) => (
                  <li key={book.id}>
                    <Link href={`/book/${book.id}/${book.slug}`}>
                      <a>
                        <div className="relative w-32 h-40">
                          <Image
                            className="rounded-lg"
                            priority={true}
                            layout="fill"
                            src={book.displayImage}
                            alt="Book covers"
                          />
                        </div>
                        <div className="font-medium">{book.title}</div>
                      </a>
                    </Link>

                    <Link
                      href={`/author/${book.author.id}/${book.author.slug}`}
                    >
                      <a className="text-gray-600">{book.author.name}</a>
                    </Link>

                    <button
                      className=""
                      type="button"
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
            <li>List is empty</li>
          ) : null}

          {hasNextPage ? <div ref={sentryRef}>Loading</div> : null}
        </ul>
      </div>
    </section>
  );
};

UserListPage.auth = {
  admin: false,
};

export default UserListPage;
