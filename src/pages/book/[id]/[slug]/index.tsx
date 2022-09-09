import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '../../../../utils/db';
import { getServerAuthSession } from '../../../../utils/serverSession';

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

  if (book.slug !== ctx.params.slug)
    return {
      redirect: { destination: `/book/${book.id}/${book.slug}` },
      props: { book },
    };

  return {
    props: { book },
  };
};

export default function BookPage({ book }) {
  const queryClient = useQueryClient();
  const { status } = useSession();

  const { data: isFavorited } = useQuery(
    ['favorite', book.id, 'fetch'],
    async () => {
      const res = await fetch(`/api/books/${book.id}/favorite`);
      const body = await res.json();
      return body.favorite;
    }
  );

  const { mutate } = useMutation(
    ['favorite', book.id, 'update'],
    async () => {
      const res = await fetch(`/api/books/${book.id}/favorite`, {
        method: 'POST',
      });

      const body = await res.json();
      return body.favorite;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['favorite', book.id, 'fetch'], data);
      },
    }
  );

  return (
    <section className="">
      <header className="flex flex-col flex-nowrap items-center">
        <div className="relative w-20 h-20">
          <Image
            className="rounded-lg"
            priority={true}
            layout="fill"
            // objectFit="contain"
            src={book.displayImage}
            alt="Book covers"
          />
        </div>

        <div className="">
          <h3>{book.title}</h3>

          <div>
            <Link href={`/author/${book.author.id}/${book.author.slug}`}>
              <a>By {book.author.name}</a>
            </Link>
          </div>

          <div>
            <h4>Description</h4>

            <div>{book.description}</div>
          </div>

          <div>
            <h4>Details</h4>

            <div>{book.publisher.name}</div>
            <div>{book.isbn13}</div>
            <div>{book.publishedDate}</div>
            <div>{book.pageCount} Pages</div>
          </div>

          <div>
            <div>{book.copiesCount} Book Left</div>

            <Link href={`/book/${book.id}/${book.slug}/reserve`}>
              <a className="rounded-3xl px-4 py-4 bg-[#21a953] text-white">
                Reserve Today!
              </a>
            </Link>

            {status === 'authenticated' ? (
              <button
                type="button"
                className=""
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

      <div>Reviews</div>
    </section>
  );
}
