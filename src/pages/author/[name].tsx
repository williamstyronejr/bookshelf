import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useInfiniteQuery } from '@tanstack/react-query';
import useInfiniteScroll from 'react-infinite-scroll-hook';

export const getServerSideProps: GetServerSideProps = async () => {
  // const {
  //   query: { name },
  // } = ctx;

  // const authorData = await prisma.author.findUnique({
  //   where: { slug: name?.toString() },
  // });

  // if (!authorData) {
  //   return {
  //     notFound: true,
  //   };
  // }

  return {
    props: {
      // authorData,
      authorData: {
        id: 'test',
        slug: 'test',
        bio: 'This is a bio',
        name: 'Author Name',
        profileImage:
          'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
      },
    },
  };
};

export default function AuthorPage({ authorData }: { authorData: any }) {
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
        `/api/author/${query.name}?page=${pageParam}&limit=10`
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
      enabled: !!query.name,
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
              src={authorData.profileImage}
              alt="Book covers"
            />
          </div>

          <div className="">
            <h4 className="font-semibold text-sm py-4">
              About {authorData.name}
            </h4>
            <p>{authorData.bio}</p>
          </div>
        </aside>

        <div className="flex-grow">
          <ul className="flex flex-row flex-wrap">
            {data &&
              data.pages.map((page) =>
                page.results.map((book: any) => (
                  <li
                    key={book.id}
                    className="flex-grow h-56 w-1/5 mr-6 max-w-[175px]"
                  >
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
                    <div className="text-gray-600">{book.author}</div>
                  </li>
                ))
              )}

            {query.name && hasNextPage ? (
              <li ref={sentryRef}>Loading</li>
            ) : null}
          </ul>
        </div>
      </div>
    </section>
  );
}
