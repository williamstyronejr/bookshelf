import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Image from 'next/image';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Link from 'next/link';

export default function SearchPage() {
  const { query } = useRouter();

  const {
    data,
    error,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['search'],
    async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/api/search?q=${query.q}&page=${pageParam}&limit=10`
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
      enabled: !!query.q,
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
    <section className="flex flex-col flex-nowrap h-full">
      <header className="h-20 shrink-0"></header>

      <div className="flex-grow h-1 max-w-[800px]">
        <ul className="grid grid-cols-[repeat(auto-fit,_minmax(8rem,_1fr))] gap-4">
          {data &&
            data.pages.map((page) =>
              page.results.map((book) => (
                <li key={book.id}>
                  <Link href={`/book/${book.slug}`}>
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

                  <Link href={`/author/${book.author}`}>
                    <a className="text-gray-600">{book.author}</a>
                  </Link>
                </li>
              ))
            )}

          {query.q && hasNextPage ? (
            <li className="h-40" ref={sentryRef}>
              <i className="fas fa-spinner" />
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
