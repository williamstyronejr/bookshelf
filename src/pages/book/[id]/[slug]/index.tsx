import type { NextPage } from 'next';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import AdminMenu from '../../../../components/AdminMenu';
import Section from '../../../../components/ui/Section';
import { prisma } from '../../../../utils/db';
import { getServerAuthSession } from '../../../../utils/serverSession';
import { getTakenBookCount } from '../../../../utils/reservations';
import Carousel, { BookItem } from '../../../../components/Carousel';
import { Book } from '@prisma/client';
import useDeleteBook from '../../../../hooks/api/DeleteBook';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession({ req: ctx.req, res: ctx.res });

  if (!ctx.params || !ctx.params.slug)
    return {
      notFound: true,
    };

  let book = await prisma.book.findUnique({
    where: {
      id: parseInt(ctx.params.id?.toString() || ''),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      publisher: true,
      Review: true,
      BookGenres: {
        include: {
          genre: true,
        },
      },
      Favorite:
        session && session.user && session.user.id
          ? {
              where: {
                userId: session.user.id,
              },
            }
          : undefined,
    },
  });

  if (book === null) return { notFound: true };

  // Stats logging for users visits
  if (session && session.user && session.user.id) {
    // Add genres to user count
    await prisma.genreUserCount.upsert({
      where: {
        userId_genreId: {
          userId: session.user.id,
          genreId: book.BookGenres[0].genreId,
        },
      },
      update: {
        count: {
          increment: 1,
        },
      },
      create: {
        count: 1,
        user: {
          connect: { id: session.user.id },
        },
        genre: {
          connect: { id: book.BookGenres[0].genreId },
        },
      },
    });
  }

  const onHoldCount = await getTakenBookCount(book.id);

  if (book.slug !== ctx.params.slug)
    return {
      redirect: { destination: `/book/${book.id}/${book.slug}` },
      props: {
        book,
        availableCount: Math.max(0, book.copiesCount - onHoldCount),
      },
    };

  const booksInGenre = await prisma.book.findMany({
    take: 8,
    where: {
      id: {
        not: book.id,
      },
      BookGenres: {
        some: {
          genreId: book.BookGenres[0].genreId,
        },
      },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      publisher: true,
      Review: true,
      BookGenres: {
        include: {
          genre: true,
        },
      },
    },
  });

  const booksByAuthor = await prisma.book.findMany({
    take: 8,
    where: {
      author: {
        id: book.author.id,
      },
      id: { not: book.id },
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      publisher: true,
    },
  });

  const booksInSeries = await prisma.series.findFirst({
    where: {
      BookSeries: {
        some: { bookId: book.id },
      },
    },
    include: {
      BookSeries: {
        orderBy: [{ order: 'asc' }],
        include: {
          book: true,
        },
      },
    },
  });

  return {
    props: {
      book: JSON.parse(JSON.stringify(book)),
      booksInGenre: JSON.parse(JSON.stringify(booksInGenre)),
      booksInSeries: JSON.parse(JSON.stringify(booksInSeries)),
      booksByAuthor: JSON.parse(JSON.stringify(booksByAuthor)),
      availableCount: Math.max(0, book.copiesCount - onHoldCount),
    },
  };
};

const BookPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ book, availableCount, booksInGenre, booksByAuthor, booksInSeries }) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { status } = useSession();
  const [infoExpand, setInfoExpand] = useState(false);

  const { data: isFavorited } = useQuery(
    ['favorite', book.id, 'fetch'],
    async () => {
      const res = await fetch(`/api/books/${book.id}/favorite`);
      if (res.ok) return (await res.json()).favorite;
      return false;
    },
    {
      enabled: status === 'authenticated',
      placeholderData: false,
    }
  );

  const { mutate } = useMutation(
    ['favorite', book.id, 'update'],
    async () => {
      const res = await fetch(`/api/books/${book.id}/favorite`, {
        method: 'POST',
      });

      if (res.ok) return (await res.json()).favorite;
      return false;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['favorite', book.id, 'fetch'], data);
      },
    }
  );

  const { mutate: deleteBook, data: deletionData } = useDeleteBook();

  useEffect(() => {
    if (deletionData) {
      if (deletionData.success) router.push('/');
    }
  }, [deletionData, router]);

  return (
    <Section>
      <Head>
        <title>{book.title}</title>
      </Head>

      <header className="flex flex-col md:flex-row flex-nowrap max-w-5xl items-center md:items-start mb-4 mx-auto px-4">
        <div className="relative w-full md:w-44 h-48 md:h-60 mb-10 md:mb-0 md:mr-4 grow-0 shrink-0">
          <Image
            className="rounded-lg object-contain"
            priority={true}
            fill={true}
            src={book.displayImage}
            alt="Book covers"
          />
        </div>

        <div className="flex-grow mx-4 mb-6 md:mb-0">
          <div className="text-right">
            <AdminMenu>
              <>
                <Link
                  className="block w-full text-left px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-gray-400/30"
                  href={`/admin/book/${book.id}/edit`}
                >
                  Edit Book
                </Link>

                <button
                  type="button"
                  className="block w-full text-left text-red-500 px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-gray-400/30"
                  onClick={() => deleteBook({ id: book.id })}
                >
                  Delete Book
                </button>
              </>
            </AdminMenu>
          </div>

          <h3 className="text-xl text-center md:text-left mb-2 font-semibold">
            {book.title}
          </h3>

          <div className="mb-6 text-sm text-center md:text-left">
            <span>by </span>
            <Link
              className="hover:text-custom-text-link-light dark:hover:text-custom-text-link-dark"
              href={`/author/${book.author.id}/${book.author.slug}`}
            >
              {book.author.name}
            </Link>
            <hr />
          </div>

          <div className="">
            <div
              className={`relative ${
                infoExpand ? 'h-auto' : 'h-20 overflow-y-hidden'
              }`}
            >
              <div className="">{book.description}</div>
            </div>

            <button
              className="text-blue-700 hover:underline"
              onClick={() => setInfoExpand((old) => !old)}
            >
              {infoExpand ? 'Read Less' : 'Read More'}
            </button>
          </div>
        </div>

        <div className="w-full md:w-auto shrink-0 py-2 border-2 rounded">
          <div className="py-4 text-lg px-4 border-b-2 text-center md:text-left">
            <h3 className="py-2 font-semibold text-2xl">Available now</h3>
            <span className="font-bold">{availableCount}</span> Books Left{' '}
          </div>

          <div className="my-4 px-4">
            <Link
              data-cy="reserve"
              className="block rounded-md px-6 py-2 bg-[#21a953] hover:bg-[#149b19] text-white"
              href={`/book/${book.id}/${book.slug}/reserve`}
            >
              Reserve Today!
            </Link>

            {status === 'authenticated' ? (
              <button
                aria-label={isFavorited ? 'Favorited' : 'Favorite'}
                type="button"
                data-cy="favorite"
                className="block text-2xl mt-4 mx-auto"
                onClick={() => {
                  mutate();
                }}
              >
                {isFavorited ? (
                  <i className="fas fa-heart" />
                ) : (
                  <i className="far fa-heart" />
                )}
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <hr className="my-10" />

      {booksInSeries ? (
        <div className="md:flex md:flex-row flex-nowrap max-w-3xl text-center md:text-left mx-auto mb-6 px-4">
          <h4 className="font-semibold text-blue-700 md:w-40 mb-4 md:mb-0 text-2xl">
            <Link href={`/series/${booksInSeries.id}`}>Series</Link>
          </h4>

          <div className="flex flex-col md:flex-row md:flex-wrap md:w-0 grow items-center md:items-start">
            <Carousel>
              {booksInSeries.BookSeries.map(({ book }: { book: Book }) => (
                <BookItem key={`series-${book.id}`} book={book} />
              ))}
            </Carousel>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col md:flex-row flex-nowrap max-w-3xl text-center md:text-left mx-auto px-4">
        <h4 className="font-semibold md:w-60 mb-4 md:mb-0 text-2xl">
          Product Details
        </h4>

        <div className="flex-grow">
          <div className="my-2">
            <div className="w-3/6 inline-block">Publisher:</div>
            <div className="w-3/6 inline-block">{book.publisher.name}</div>
          </div>

          <div className="my-2">
            <div className="w-3/6 inline-block">ISBN-13:</div>
            <div className="w-3/6 inline-block">{book.isbn13}</div>
          </div>

          <div className="my-2">
            <div className="w-3/6 inline-block">Publication Date:</div>
            <div className="w-3/6 inline-block">
              {dayjs(book.publishedDate).format('MMMM DD, YYYY')}
            </div>
          </div>

          <div className="my-2">
            <div className="w-3/6 inline-block">Page Count:</div>
            <div className="w-3/6 inline-block">{book.pageCount} Pages</div>
          </div>
        </div>
      </div>
      <hr className="my-10" />

      {booksByAuthor.length > 0 ? (
        <div className="md:flex md:flex-row flex-nowrap max-w-3xl text-center md:text-left mx-auto px-4 pb-10">
          <h4 className="font-semibold md:w-60 mb-4 md:mb-0 text-2xl">
            Author Books
          </h4>

          <div className="flex flex-col md:flex-row md:flex-wrap md:w-0 grow items-center md:items-start">
            {booksByAuthor.map((book: any) => (
              <Link
                key={`author-books-${book.id}`}
                className="block relative shrink-0 w-44 h-64 md:w-32 md:h-52 md:mr-5 mb-5"
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
            ))}
          </div>
        </div>
      ) : null}

      <div className="md:flex md:flex-row flex-nowrap max-w-3xl text-center md:text-left mx-auto px-4 pb-10">
        <h4 className="font-semibold md:w-60 mb-4 md:mb-0 text-2xl">
          Recommend Titles
        </h4>

        <div className="flex flex-col md:flex-row md:flex-wrap md:w-0 grow items-center md:items-start">
          {booksInGenre.map((book: any) => (
            <Link
              key={`recommend-${book.id}`}
              className="block relative shrink-0 w-44 h-64 md:w-32 md:h-52 md:mr-5 mb-5"
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
          ))}
        </div>
      </div>
    </Section>
  );
};

export default BookPage;
