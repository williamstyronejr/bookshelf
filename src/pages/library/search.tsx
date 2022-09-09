import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Image from 'next/image';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Link from 'next/link';
import { useState } from 'react';

export default function SearchPage() {
  const { query } = useRouter();
  const [viewMode, setViewMode] = useState('grid');

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
    <section className="flex flex-col flex-nowrap">
      <header className="h-20 shrink-0">
        <button
          className="disabled:text-gray-500 mr-4"
          disabled={viewMode === 'grid'}
          onClick={() => setViewMode('grid')}
        >
          <i className="fas fa-th-large text-2xl" />
          <span className="block text-sm">Grid</span>
        </button>

        <button
          className="disabled:text-gray-500"
          type="button"
          disabled={viewMode === 'list'}
          onClick={() => setViewMode('list')}
        >
          <i className="fas fa-list text-2xl" />
          <span className="block text-sm">List</span>
        </button>
      </header>

      <div className="flex-grow h-1 max-w-[800px]">
        <ul
          className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-[repeat(auto-fit,_minmax(8rem,_1fr))] gap-4'
              : 'flex flex-col flex-nowrap'
          }`}
        >
          {data &&
            data.pages.map((page) =>
              page.results.map((book) => (
                <li
                  key={book.id}
                  className={`${
                    viewMode === 'list' ? 'flex flex-row flex-nowrap my-2' : ''
                  }`}
                >
                  <Link href={`/book/${book.id}/${book.slug}`}>
                    <a>
                      <div
                        className={`relative w-32 h-40 ${
                          viewMode === 'list' ? 'mr-4' : ''
                        }`}
                      >
                        <Image
                          className="rounded-lg"
                          priority={true}
                          layout="fill"
                          src={book.displayImage}
                          alt="Book covers"
                        />
                      </div>
                    </a>
                  </Link>

                  <div>
                    <Link href={`/book/${book.id}/${book.slug}`}>
                      <div className="font-medium">{book.title}</div>
                    </Link>

                    <Link href={`/author/${book.author}`}>
                      <a className="text-gray-600">{book.author.name}</a>
                    </Link>
                  </div>
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
