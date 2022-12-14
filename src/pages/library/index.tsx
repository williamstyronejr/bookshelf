import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import Section from '../../components/ui/Section';
import Carousel, { BookItem } from '../../components/Carousel';
import { prisma } from '../../utils/db';

export const getServerSideProps = async () => {
  let mostRecentBooks = await prisma.book.findMany({
    take: 20,
    orderBy: [
      {
        createdAt: 'asc',
      },
    ],
    include: {
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  let topBooks = await prisma.book.findMany({
    take: 20,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  const trendingGenres = await prisma.bookGenres.findMany({
    take: 10,
    select: {
      genre: true,
      book: {
        select: {
          id: true,
          slug: true,
          displayImage: true,
        },
      },
    },
    distinct: ['genreId'],
  });

  // Hacky way of dealing with Date Object not having a toJSON
  return {
    props: {
      mostRecentBooks: JSON.parse(JSON.stringify(mostRecentBooks)),
      topBooks: JSON.parse(JSON.stringify(topBooks)),
      trendingGenres: JSON.parse(JSON.stringify(trendingGenres)),
    },
  };
};

export default function LibraryPage({
  topBooks,
  mostRecentBooks,
  trendingGenres,
}: {
  topBooks: any;
  mostRecentBooks: any;
  trendingGenres: any;
}) {
  return (
    <Section>
      <Head>
        <title>Home</title>
      </Head>
      <header className="">
        <h4 className="my-6 text-xl font-medium text-center">Most Popular</h4>
        <Carousel>
          {topBooks
            ? topBooks.map((book: any) => (
                <BookItem key={`popular-book-${book.id}`} book={book} />
              ))
            : null}
        </Carousel>
      </header>

      <div className="block">
        <h4 className="my-6 text-xl font-medium text-center">New Releases</h4>
        <Carousel>
          {mostRecentBooks
            ? mostRecentBooks.map((book: any) => (
                <BookItem key={`recent-book-${book.id}`} book={book} />
              ))
            : null}
        </Carousel>
      </div>

      <div className="">
        <h4 className="my-6 text-xl font-medium text-center">
          Trending Genres
        </h4>

        <ul className="grid grid-cols-[repeat(auto-fit,_minmax(min(100%/3,_max(8rem,_100%/5)),_1fr))] gap-4 max-w-2xl mx-auto divide">
          {trendingGenres
            ? trendingGenres.map((data: any) => (
                <li
                  key={`trending-genre-${data.genre.id}`}
                  className="w-32 text-center py-4 mx-auto"
                >
                  <div className="relative w-32 h-52 mx-auto mb-4 rounded-lg hover:scale-110 transition-transform">
                    <Link href={`/book/${data.book.id}/${data.book.slug}`}>
                      <Image
                        className="rounded-lg"
                        priority={true}
                        fill={true}
                        src={data.book.displayImage}
                        alt="Book cover"
                      />
                    </Link>
                  </div>

                  <div>
                    <Link
                      className="hover:underline hover:text-custom-text-link-light transition-colors"
                      href={`/library/search?genre=${data.genre.id}`}
                    >
                      {data.genre.name}
                    </Link>
                  </div>
                </li>
              ))
            : null}
        </ul>
      </div>
    </Section>
  );
}
