import Image from 'next/image';
import Link from 'next/link';
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

  const trendingGenres = await prisma.genre.findMany({
    take: 10,
    select: {
      id: true,
      name: true,
    },
  });

  // Hacky way of dealing with Date Object not having a toJSON
  mostRecentBooks = JSON.parse(JSON.stringify(mostRecentBooks));
  topBooks = JSON.parse(JSON.stringify(topBooks));

  return {
    props: {
      mostRecentBooks,
      topBooks,
      trendingGenres: JSON.parse(JSON.stringify(trendingGenres)),
    },
  };
};

const BookItem = ({ book }) => (
  <li className="relative flex-grow w-1/5 mr-6 max-w-[175px]">
    <Link href={`/book/${book.id}/${book.slug}`}>
      <a>
        <div className="relative h-56 shadow-md mb-2">
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

    <Link href={`/author/${book.author.id}/${book.author.slug}`}>
      <a>
        <div className="text-gray-600">{book.author.name}</div>
      </a>
    </Link>
  </li>
);

export default function LibraryPage({
  topBooks,
  mostRecentBooks,
  trendingGenres,
}) {
  return (
    <section>
      <header className="">
        <h4 className="py-4 text-xl">Most Popular</h4>
        <ul className="flex flex-row flex-nowrap w-full">
          {topBooks
            ? topBooks.map((book) => (
                <BookItem key={`popular-${book.id}`} book={book} />
              ))
            : null}
        </ul>
      </header>

      <div className="block">
        <h4 className="py-4 text-xl">New Releases</h4>
        <ul>
          {mostRecentBooks
            ? mostRecentBooks.map((book) => (
                <BookItem key={`recent-${book.id}`} book={book} />
              ))
            : null}
        </ul>
      </div>

      <div className="">
        <h4>Trending Genres</h4>

        <ul className="grid grid-cols-[repeat(auto-fit,_minmax(8rem,_1fr))] gap-4 divide">
          {trendingGenres
            ? trendingGenres.map((genre) => (
                <li
                  key={`trending-genre-${genre.id}`}
                  className="text-center py-4  rounded-lg"
                >
                  {genre.name}
                </li>
              ))
            : null}
        </ul>
      </div>
    </section>
  );
}
