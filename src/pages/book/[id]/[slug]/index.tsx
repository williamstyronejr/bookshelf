import { GetServerSideProps } from 'next';
import Image from 'next/image';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.params || !ctx.params.slug)
    return {
      notFound: true,
    };

  const test = {
    id: 'test',
    title: 'Title',
    author: 'Author',
    displayImage: 'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
  };

  return {
    props: { book: test },
  };
};

export default function BookPage({ book }) {
  return (
    <section className="">
      <aside className="relative">
        <Image
          className="rounded-lg"
          priority={true}
          layout="fill"
          // objectFit="contain"
          src={book.displayImage}
          alt="Book covers"
        />
      </aside>

      <div>
        <h4>Reviews</h4>
      </div>
    </section>
  );
}
