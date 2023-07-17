import type { NextPage } from 'next';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { prisma } from '../../utils/db';
import Section from '../../components/ui/Section';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { Book } from '@prisma/client';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.params || !ctx.params.id)
    return {
      notFound: true,
    };

  const series = await prisma.series.findUnique({
    where: { id: parseInt(ctx.params.id.toString() || '') },
    include: {
      BookSeries: {
        include: {
          book: {
            include: {
              author: true,
            },
          },
        },
      },
    },
  });

  if (series === null) return { notFound: true };
  const author =
    series.BookSeries.length > 0 ? series.BookSeries[0].book.author : null;

  return {
    props: {
      series: JSON.parse(JSON.stringify(series)),
      author: JSON.parse(JSON.stringify(author)),
    },
  };
};

const SeriesPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ series, author }) => {
  return (
    <Section>
      <Head>
        <title>{series.name}</title>
      </Head>

      <header className="my-8">
        <h3 className="md:px-8 text-xl text-center md:text-left font-semibold">
          {series.name}
        </h3>
      </header>

      <div className="flex flex-col md:flex-row flex-nowrap max-w-5xl mx-auto items-start">
        {author ? (
          <aside className="flex flex-row flex-nowrap md:block shrink-0 mb-10 md:w-52 md:pr-4">
            <Link
              className="block relative w-32 h-32 mr-4 md:mx-auto"
              href={`/author/${author.id}/${author.slug}`}
            >
              <Image
                className="rounded-full"
                priority={true}
                fill={true}
                src={author.profileImage || ''}
                alt="User Profile"
              />
            </Link>

            <div className="">
              <h4 className="font-semibold text-sm py-4">
                About{' '}
                <Link
                  className="text-blue-700"
                  href={`/author/${author.id}/${author.slug}`}
                >
                  {author.name}
                </Link>
              </h4>
              <p className="pt-2 pb-8">
                {author.bio || 'This author has no biography'}
              </p>
            </div>
          </aside>
        ) : null}

        <div className="grow">
          {series.BookSeries.length === 0 ? (
            <div className="">No Books listed in this series</div>
          ) : (
            series.BookSeries.map(({ book }: { book: Book }) => (
              <div
                key={`book-${book.id}`}
                className="md:flex md:flex-row md:flex-nowrap mb-8 md:h-64"
              >
                <Link
                  className="block relative shrink-0 w-44 h-64 md:w-44 md:h-64 mx-auto md:ml-0 md:mr-5 mb-5"
                  href={`/book/${book.id}/${book.slug}`}
                  title={book.title}
                >
                  <Image
                    className="rounded-lg"
                    fill={true}
                    src={book.displayImage}
                    alt="Book Cover"
                  />
                </Link>

                <div className="md:flex md:flex-col md:flex-nowrap md:h-full">
                  <div className="shrink-0 text-xl text-center md:text-left mt-1 mb-2 font-medium">
                    <Link
                      className="text-blue-700 px-4 md:px-0"
                      href={`/book/${book.id}/${book.slug}`}
                      title={book.title}
                    >
                      {book.title}
                    </Link>
                  </div>

                  <div className="relative h-20 md:grow overflow-y-hidden">
                    <div className="px-4 md:px-0">{book.description}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Section>
  );
};

export default SeriesPage;
