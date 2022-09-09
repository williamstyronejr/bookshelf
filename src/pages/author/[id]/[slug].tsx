import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useInfiniteQuery } from '@tanstack/react-query';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { prisma } from '../../../utils/db';
import Link from 'next/link';
import { NextPage } from 'next/types';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const {
      query: { slug, id },
    } = ctx;

    if (!slug || !id) return { notFound: true };

    const authorData = await prisma.author.findUnique({
      where: { id: parseInt(id.toString()) },
      select: {
        name: true,
        slug: true,
        id: true,
        bio: true,
        profileImage: true,
      },
    });

    if (!authorData) {
      return {
        notFound: true,
      };
    }

    if (authorData.slug !== slug) {
      return {
        redirect: {
          destination: `/author/${id}/${authorData.slug}`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        authorData,
      },
    };
  } catch (err) {
    return { notFound: true };
  }
};

const AuthorPage: NextPage<{ authorData: any }> = ({ authorData }) => {
  const { query } = useRouter();

  const {
    data,
    error,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(
    ['author'],
    async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/api/author/${query.id}/books?page=${pageParam}&limit=10`
      );
      if (res.statusText !== 'OK') {
        throw new Error('Invalid request');
      }

      const body = await res.json();
      return body;
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.nextPage ? lastPage.nextPage : undefined,
      keepPreviousData: true,
      enabled: !!query.id,
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
    <section className="">
      <header className="w-full py-6">
        <h3>{authorData.name}</h3>
      </header>

      <div className="flex flex-row flex-nowrap">
        <aside className="w-42 shrink-0 mr-10">
          <div className="relative w-32 h-32">
            <Image
              className="rounded-full"
              priority={true}
              layout="fill"
              src={authorData.profileImage || ''}
              alt="User Profile"
            />
          </div>

          <div className="">
            <h4 className="font-semibold text-sm py-4">
              About {authorData.name}
            </h4>
            <p>{authorData.bio || 'This author has no biography'}</p>
          </div>
        </aside>

        <div className="flex-grow">
          <ul className="flex flex-col flex-nowrap">
            {data &&
              data.pages.map((page) =>
                page.results.map((book: any) => (
                  <li
                    key={book.id}
                    className="flex flex-row flex-nowrap flex-grow w-full py-2 my-4 border-b-2"
                  >
                    <div className="relative w-32 h-40 mr-4">
                      <Image
                        className="rounded-lg"
                        priority={true}
                        layout="fill"
                        src={book.displayImage}
                        alt="Book covers"
                      />
                    </div>

                    <div className="flex-grow">
                      <Link href={`/book/${book.id}/${book.slug}`}>
                        <a className="font-medium">{book.title}</a>
                      </Link>

                      <Link
                        href={`/author/${book.author.id}/${book.author.slug}`}
                      >
                        <a className="block text-gray-600">
                          {book.author.name}
                        </a>
                      </Link>
                    </div>

                    <div className="shrink-0">
                      <Link href={`/book/${book.id}/${book.slug}/reserve`}>
                        <a className="">Reserve</a>
                      </Link>
                    </div>
                  </li>
                ))
              )}

            {query.id && hasNextPage ? <li ref={sentryRef}>Loading</li> : null}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AuthorPage;
