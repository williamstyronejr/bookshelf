import type { NextPage } from 'next';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import AdminMenu from '../../../../components/AdminMenu';
import { prisma } from '../../../../utils/db';
import { getServerAuthSession } from '../../../../utils/serverSession';
import { getTakenBookCount } from '../../../../utils/reservations';

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

  book = JSON.parse(JSON.stringify(book));
  if (!book) return { notFound: true };

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

  return {
    props: {
      book,
      availableCount: Math.max(0, book.copiesCount - onHoldCount),
    },
  };
};

const BookPage: NextPage<{ book: any; availableCount: number }> = ({
  book,
  availableCount,
}) => {
  const queryClient = useQueryClient();
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

  return (
    <section className="">
      <Head>
        <title>{book.title}</title>
      </Head>

      <header className="flex flex-col flex-nowrap items-center md:items-start mb-4 md:flex-row">
        <div className="relative w-full md:w-50 h-48 md:h-60 mb-10 md:mb-0 md:mr-4">
          <Image
            className="rounded-lg object-contain"
            priority={true}
            fill={true}
            src={book.displayImage}
            alt="Book covers"
          />
        </div>

        <div className="w-full">
          <div className="text-right">
            <AdminMenu
              links={[
                {
                  title: 'Edit Book',
                  href: `/admin/book/${book.id}/edit`,
                },
              ]}
            />
          </div>

          <h3 className="text-xl text-center mb-2 md:text-left">
            {book.title}
          </h3>

          <div className="mb-6 text-sm text-center md:text-left">
            <span>by </span>
            <Link href={`/author/${book.author.id}/${book.author.slug}`}>
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

            <div className="py-4 text-lg">{availableCount} Books Left </div>

            <div className="py-2 flex flex-row flex-nowrap justify-center md:block">
              <Link
                className="rounded-3xl px-4 py-4 mr-4 bg-[#21a953] text-white"
                href={`/book/${book.id}/${book.slug}/reserve`}
              >
                Reserve Today!
              </Link>

              {status === 'authenticated' ? (
                <button
                  type="button"
                  className=" text-2xl"
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
        </div>
      </header>

      <hr />

      <div className="md:text-center md:w-80 mx-auto">
        <h4 className="font-medium text-2xl my-4">Product Details</h4>

        <div>
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
    </section>
  );
};

export default BookPage;
