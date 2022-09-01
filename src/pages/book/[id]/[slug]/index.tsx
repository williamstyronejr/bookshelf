import { GetServerSideProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '../../../../utils/db';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
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
      Favorite: true,
      Review: true,
      BookGenres: {
        include: {
          genre: true,
        },
      },
    },
  });

  book = JSON.parse(JSON.stringify(book));
  if (!book) return { notFound: true };

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
  console.log(book);
  return (
    <section className="">
      <header className="flex flex-row flex-nowrap">
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

        <div>
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
            <Link href={`/books/${book.id}/${book.slug}/reserve`}>
              <a>Reserve Today!</a>
            </Link>
          </div>
        </div>
      </header>

      <div>Reviews</div>
    </section>
  );
}
