import Link from 'next/link';
import Image from 'next/image';

export default function DashboardPage() {
  const data: { current: Array<Record<string, string>> } = {
    current: [
      {
        id: 'test',
        title: 'Title',
        author: 'Author',
        displayImage:
          'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
      },
      {
        id: 'test2',
        title: 'Title 2',
        author: 'Author 3',
        displayImage:
          'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
      },
    ],
  };

  return (
    <section className="">
      <h2 className="font-medium my-4">Dashboard</h2>
      <div className="bg-custom-background shadow-md rounded p-6 mb-4">
        <div className="flex mb-3">
          <h3 className="flex-grow font-medium">Currently Books</h3>

          <Link href="/dashboard">
            <a className="text-gray-400 hover:text-gray-600">See more</a>
          </Link>
        </div>

        <div className="">
          <ul className="flex flex-row flex-nowrap">
            {data.current.length ? (
              data.current.map((book) => (
                <li key={book.id} className="relative h-52 w-32 mr-4">
                  <Link href={`/books/${book.slug}`}>
                    <a>
                      <div className="relative h-40 w-32 shadow-md mb-2">
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

                  <Link href={`/author/${book.author}`}>
                    <a>
                      <div className="text-gray-600">{book.author}</div>
                    </a>
                  </Link>
                </li>
              ))
            ) : (
              <li className=" ">You have no current book</li>
            )}
          </ul>
        </div>
      </div>

      <div className="bg-custom-background shadow-md rounded p-6">
        <h3 className="font-medium">Favorite Author</h3>

        <ul className="flex flex-row flex-wrap ">
          <li className="flex-grow text-center m-8">
            <div>Start reading today to see authors</div>
          </li>
        </ul>
      </div>
    </section>
  );
}
