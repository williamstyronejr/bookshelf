import { Genre } from '@prisma/client';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import Section from '../../../components/ui/Section';
import { prisma } from '../../../utils/db';

export const getServerSideProps: GetServerSideProps<{
  genreList: {
    genre: Genre;
    book: { id: number; slug: string; displayImage: string };
  }[];
}> = async () => {
  const genreList = await prisma.bookGenres.findMany({
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
    orderBy: { genre: { name: 'asc' } },
    distinct: ['genreId'],
  });

  return {
    props: {
      genreList: genreList,
    },
  };
};

const GenresPage = ({
  genreList,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [search, setSearch] = useState('');
  return (
    <Section>
      <Head>
        <title>Genres</title>
      </Head>

      <header className="">
        <h3 className="text-center text-3xl font-bold">Genres</h3>
      </header>

      <div className="flex flex-col flex-nowrap md:flex-row md:flex-wrap relative w-full px-4">
        <div className="sticky md:static top-0 md:top-auto z-10">
          <input
            placeholder="Search by name ..."
            className="w-full sticky px-2 py-2 top-0 border-2 rounded bg-white"
            value={search}
            onChange={(evt) => {
              setSearch(evt.target.value.toLowerCase());
            }}
          />
        </div>

        <div className="flex flex-col md:flex-row flex-nowrap md:flex-wrap md:w-0 flex-grow md:px-8 ">
          {genreList
            ? genreList
                .filter(({ genre }) =>
                  genre.name.toLowerCase().includes(search)
                )
                .map(({ genre, book }) => (
                  <div key={genre.id} className="py-4 md:px-4">
                    <Link
                      href={`/library/search?genre=${genre.id}`}
                      className="block w-40 mx-auto group"
                    >
                      <>
                        <div className="relative w-44 h-60 mx-auto">
                          <Image
                            className="group-hover:scale-110 transition-transform rounded-lg"
                            fill={true}
                            src={book.displayImage}
                            alt=""
                          />
                        </div>

                        <div className="text-center my-2 group-hover:text-custom-text-link-light transition-colors">
                          {genre.name}
                        </div>
                      </>
                    </Link>
                  </div>
                ))
            : null}
        </div>
      </div>
    </Section>
  );
};

export default GenresPage;
