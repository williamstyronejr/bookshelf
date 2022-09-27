import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '../../utils/db';
import Carousel from '../../components/Carousel';

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

const BookItem = ({ book }) => (
  <div className="relative shrink-0 w-32 mr-6 max-w-[175px]">
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
        <div className="font-medium whitespace-nowrap text-ellipsis overflow-hidden">
          {book.title}
        </div>
      </a>
    </Link>

    <Link href={`/author/${book.author.id}/${book.author.slug}`}>
      <a>
        <div className="text-gray-600">{book.author.name}</div>
      </a>
    </Link>
  </div>
);

export default function LibraryPage({
  topBooks,
  mostRecentBooks,
  trendingGenres,
}) {
  return (
    <section className="max-w-7xl mx-auto">
      <header className="">
        <h4 className="my-6 text-xl font-medium text-center">Most Popular</h4>
        <Carousel>
          {topBooks
            ? topBooks.map((book) => (
                <BookItem key={`popular-book-${book.id}`} book={book} />
              ))
            : null}
        </Carousel>
      </header>

      <div className="block">
        <h4 className="my-6 text-xl font-medium text-center">New Releases</h4>
        <Carousel>
          {mostRecentBooks
            ? mostRecentBooks.map((book) => (
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
            ? trendingGenres.map((data) => (
                <li
                  key={`trending-genre-${data.genre.id}`}
                  className="w-32 text-center py-4"
                >
                  <div className="relative w-32 h-52 mx-auto mb-4 border-2 border-transparent hover:border-black rounded-lg">
                    <Link href={`/book/${data.book.id}/${data.book.slug}`}>
                      <a>
                        <Image
                          className="rounded-lg"
                          priority={true}
                          layout="fill"
                          src={data.book.displayImage}
                          alt="Book cover"
                        />
                      </a>
                    </Link>
                  </div>

                  <div>
                    <Link href={`/search?genre=${data.genre.id}`}>
                      <a className="hover:underline hover:text-custom-text-highlight-light dark:hover:text-custom-text-highlight-dark">
                        {data.genre.name}
                      </a>
                    </Link>
                  </div>
                </li>
              ))
            : null}
        </ul>
      </div>
    </section>
  );
}
