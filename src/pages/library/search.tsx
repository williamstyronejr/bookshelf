import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Image from 'next/image';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import Link from 'next/link';
import { useState } from 'react';
import RefetchError from '../../components/RefetchError';
import LoadingWheel from '../../components/LoadingWheel';

export default function SearchPage() {
  const { query, isReady } = useRouter();
  const [viewMode, setViewMode] = useState('grid');

  const {
    data,
    error,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    ['search'],
    async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/api/search?q=${query.q || ''}&genre=${
          query.genre || ''
        }&page=${pageParam}&limit=10`
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
      enabled: isReady,
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
      <header className="flex flex-row flex-nowrap h-20 mb-4 justify-center items-center shrink-0">
        <h3 className="flex-grow">Results</h3>
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
        {error ? <RefetchError refetch={refetch} /> : null}

        {isLoading ? (
          <div className="w-full" ref={sentryRef}>
            <LoadingWheel />
          </div>
        ) : null}

        <ul
          className={`${
            viewMode === 'grid'
              ? 'grid grid-cols-[repeat(auto-fit,_8rem)] gap-6'
              : 'flex flex-col flex-nowrap divide-y'
          }`}
        >
          {data &&
            data.pages.map((page) =>
              page.results.map((book: any) => (
                <li
                  key={book.id}
                  title={book.title}
                  className={`${
                    viewMode === 'grid' ? '' : 'flex flex-row flex-nowrap py-6'
                  }`}
                >
                  <Link href={`/book/${book.id}/${book.slug}`}>
                    <a>
                      <div
                        className={`relative w-32 h-44 ${
                          viewMode === 'list' ? 'mr-4' : ''
                        }`}
                      >
                        <Image
                          className="rounded-lg"
                          priority={true}
                          layout="fill"
                          src={book.displayImage}
                          alt="Book cover"
                        />
                      </div>
                    </a>
                  </Link>

                  <div>
                    <Link href={`/book/${book.id}/${book.slug}`}>
                      <a className="block font-medium whitespace-nowrap text-ellipsis overflow-hidden">
                        {book.title}
                      </a>
                    </Link>

                    <Link
                      href={`/author/${book.author.id}/${book.author.slug}`}
                    >
                      <a className="text-gray-600">{book.author.name}</a>
                    </Link>
                  </div>
                </li>
              ))
            )}

          {query.q && hasNextPage ? (
            <li className="h-40 flex-grow" ref={sentryRef}>
              <LoadingWheel />
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
