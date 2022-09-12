import type { NextPage } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

const DashboardPage: NextPage = () => {
  const { data, isLoading } = useQuery(['dashboard'], async () => {
    const res = await fetch('/api/users/dashboard');

    const body = await res.json();
    return body;
  });

  if (isLoading) return <div>loading</div>;

  return (
    <section className="">
      <h2 className="font-medium my-4">Dashboard</h2>
      <div className="bg-custom-background shadow-md rounded p-6 mb-4">
        <div className="flex mb-3">
          <h3 className="flex-grow font-medium">Currently Books</h3>

          <Link href="/dashboard/reservations">
            <a className="text-gray-400 hover:text-gray-600">See more</a>
          </Link>
        </div>

        <div className="">
          <ul className="flex flex-row flex-nowrap">
            {data.current.length ? (
              data.current.map((item) => (
                <li
                  key={`current-${item.id}`}
                  className="relative h-52 w-32 mr-4"
                >
                  <Link href={`/book/${item.book.id}/${item.book.slug}`}>
                    <a>
                      <div className="relative h-40 w-32 shadow-md mb-2">
                        <Image
                          className="rounded-lg"
                          priority={true}
                          layout="fill"
                          src={item.book.displayImage}
                          alt="Book covers"
                        />
                      </div>
                      <div className="font-medium">{item.book.title}</div>
                    </a>
                  </Link>

                  <Link href={`/author/${item.book.author.id}`}>
                    <a>
                      <div className="text-gray-600">
                        {item.book.author.name}
                      </div>
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

      <div className="bg-custom-background shadow-md rounded p-6 mb-4">
        <h3 className="font-medium">Favorite Genre</h3>

        <ul className="flex flex-row flex-wrap ">
          {data.favoriteGenres.map((genreCount) => (
            <li
              className="bg-custom-bg-off-light dark:bg-custom-bg-off-dark py-2 px-4 mr-4 rounded-md"
              key={`favorite-genre-${genreCount.id}`}
            >
              <Link href={`/library/search?genre=${genreCount.id}`}>
                <a className="">{genreCount.genre.name}</a>
              </Link>
            </li>
          ))}

          {data.favoriteGenres.length === 0 ? (
            <li className="flex-grow text-center m-8">
              <div>Start reading today to see favorite genres</div>
            </li>
          ) : null}
        </ul>
      </div>

      <div className="bg-custom-background shadow-md rounded p-6">
        <h3 className="font-medium">Favorite Author</h3>

        <ul className="flex flex-row flex-wrap ">
          {data.favoriteAuthor.map((author) => (
            <li
              className="bg-custom-bg-off-light dark:bg-custom-bg-off-dark py-2 px-4 mr-4 rounded-md"
              key={`favorite-author-${author.id}`}
            >
              <Link href={`/author/${author.id}/${author.slug}`}>
                <a className="">{author.name}</a>
              </Link>
            </li>
          ))}

          {data.favoriteAuthor.length === 0 ? (
            <li className="flex-grow text-center m-8">
              <div>Start reading today to see authors</div>
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
};

DashboardPage.auth = {
  admin: false,
};

export default DashboardPage;
