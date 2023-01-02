import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { prisma } from '../utils/db';
import Carousel, { BookItem, GenreItem } from '../components/Carousel';

export const getServerSideProps = async () => {
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

  const genreList = await prisma.bookGenres.findMany({
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
      topBooks: JSON.parse(JSON.stringify(topBooks)),
      genreList: JSON.parse(JSON.stringify(genreList)),
    },
  };
};

export default function HomePage({
  topBooks,
  genreList,
}: {
  topBooks: any;
  genreList: any;
}) {
  console.log(genreList);
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <section className="relative py-10 h-[600px]">
        <div className="flex flex-col md:flex-row flex-nowrap items-center h-full relative max-w-4xl mx-auto px-4">
          <header className="order-2 md:order-1 md:w-1/2 pr-4 text-center md:text-left">
            <h3 className="font-bold text-4xl">Newest Releases</h3>

            <p className="py-4">
              Come visit today to reserve the newest releases and particate in
              our local activities!
            </p>

            <Link
              className="inline-block my-6 px-6 py-2 rounded text-white transition-colors bg-custom-text-link-light hover:bg-custom-text-link-hover-light "
              href="/library"
            >
              Visit Library
            </Link>
          </header>

          <div className="md:order-2 md:w-1/2 h-80">
            <div className="absolute w-44 h-72 z-[2] right-56 border-8 border-slate-50 bg-slate-50">
              <Image className="" fill={true} src="/book2.png" alt="" />
            </div>

            <div className="absolute w-44 h-72 z-[3] right-40 -translate-y-5 border-8 border-slate-50 bg-slate-50">
              <Image className="" fill={true} src="/book1.jpeg" alt="" />
            </div>

            <div className="absolute w-44 h-72 z-[1] right-24  translate-y-5 border-8 border-slate-50 bg-slate-50">
              <Image className="" fill={true} src="/book3.jpeg" alt="" />
            </div>
          </div>
        </div>

        {/* <svg
          className="absolute top-0 right-0 h-96"
          viewBox="0 60 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className=""
            fill="#FF0066"
            d="M28.3,-34.9C33.5,-23.1,32.5,-11.5,32,-0.5C31.5,10.6,31.7,21.2,26.4,28.9C21.2,36.6,10.6,41.4,-5.7,47.1C-21.9,52.7,-43.9,59.3,-59.9,51.6C-76,43.9,-86.3,21.9,-80.6,5.7C-74.9,-10.6,-53.4,-21.2,-37.3,-33C-21.2,-44.9,-10.6,-57.9,0.5,-58.4C11.5,-58.8,23.1,-46.7,28.3,-34.9Z"
            transform="translate(100 100)"
          />
        </svg> */}
      </section>

      <section className="max-w-4xl mx-auto my-20 px-4">
        <header className="flex flex-row flex-nowrap justify-between items-center py-6">
          <h3 className="font-bold text-3xl">Genres</h3>

          <Link
            className="text-custom-text-link-light hover:text-custom-text-link-hover-light dark:text-custom-text-link-dark dark:hover:text-custom-text-link-hover-dark"
            href="/library/genres"
          >
            See All
          </Link>
        </header>

        <div className="">
          <Carousel>
            {genreList.map(({ genre, book }) => (
              <GenreItem
                key={`genre-${genre.id}`}
                name={genre.name}
                id={genre.id}
                image={book.displayImage}
              />
            ))}
          </Carousel>
        </div>
      </section>

      <section className="max-w-4xl mx-auto my-20 px-4">
        <header className="flex flex-row flex-nowrap justify-between py-4">
          <h3 className="font-bold text-3xl">Popular Books</h3>

          <Link
            className="text-custom-text-link-light hover:text-custom-text-link-hover-light dark:text-custom-text-link-dark dark:hover:text-custom-text-link-hover-dark"
            href="/library"
          >
            See All
          </Link>
        </header>

        <div className="">
          <Carousel>
            {topBooks
              ? topBooks.map((book: any) => (
                  <BookItem key={`popular-book-${book.id}`} book={book} />
                ))
              : null}
          </Carousel>
        </div>
      </section>

      <section className="relative py-4 h-[500px] bg-black">
        <header className="relative z-20 py-6">
          <h4 className="w-1/2 text-center font-semibold text-3xl text-white  mx-auto py-5">
            Discovery New Fantasy Worlds With These Books
          </h4>

          <div className="flex flex-row flex-nowrap justify-center pt-10">
            <div className="relative w-36 h-52">
              <Image className="" fill={true} src="/book2.png" alt="" />
            </div>

            <div className="relative w-36 h-52 scale-125 mx-8">
              <Image className="" fill={true} src="/book1.jpeg" alt="" />
            </div>

            <div className="relative w-36 h-52">
              <Image className="" fill={true} src="/book3.jpeg" alt="" />
            </div>
          </div>
        </header>

        <div className="absolute w-full h-full top-0 left-0 z-10 bg-black/30" />

        <Image
          className="rounded-lg"
          priority={true}
          fill={true}
          src="/fantasyBackdrop.png"
          alt=""
        />
      </section>

      <section className="max-w-4xl mx-auto pt-20">
        <header className="text-center">
          <h3 className="text-4xl font-bold text-center">
            Reserve Your Books Today
          </h3>

          <Link
            className="inline-block my-6 px-10 py-2 rounded text-white transition-colors bg-custom-text-link-light hover:bg-custom-text-link-hover-light "
            href="/library"
          >
            Visit Library
          </Link>
        </header>
      </section>

      <div className="relative w-full h-80 mt-20">
        <Image
          className="object-cover top-0"
          fill={true}
          src="/footer2.jpeg"
          alt=""
        />
      </div>
    </>
  );
}
