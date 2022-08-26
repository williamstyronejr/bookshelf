import Image from 'next/image';
import Link from 'next/link';

export const getServerSideProps = () => {
  return {
    props: {
      topBooks: [
        {
          id: 'test',
          slug: 'test',
          title: 'Title',
          author: {
            name: 'author name',
            id: 1,
            slug: 'author slug',
          },
          displayImage:
            'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
        },
        {
          id: 'test2',
          title: 'Title 2',
          slug: 'test',
          author: {
            name: 'author name',
            id: 1,
            slug: 'author slug',
          },
          displayImage:
            'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
        },
        {
          id: 'test3',
          title: 'Title 3',
          slug: 'test',
          author: {
            name: 'author name',
            id: 1,
            slug: 'author slug',
          },
          displayImage:
            'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
        },
      ],
    },
  };
};

export default function LibraryPage({ topBooks }) {
  return (
    <section>
      <div className="">
        <ul className="flex flex-row flex-nowrap w-full">
          {topBooks.map((book) => (
            <li
              key={book.id}
              className="relative flex-grow h-56 w-1/5 mr-6 max-w-[175px]"
            >
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
          ))}
        </ul>
      </div>
    </section>
  );
}
