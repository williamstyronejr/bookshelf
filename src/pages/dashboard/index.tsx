import type { NextPage } from 'next';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Carousel, { BookItem } from '../../components/Carousel';
import RefetchError from '../../components/RefetchError';
import LoadingWheel from '../../components/LoadingWheel';
import Section from '../../components/ui/Section';

const DashboardPage: NextPage = () => {
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery(
    ['dashboard'],
    async () => {
      const res = await fetch('/api/users/dashboard');

      if (res.ok) return await res.json();
      if (res.status === 401) return router.push('/api/auth/signin');
      throw new Error('An unexpected error occurred, please try again.');
    }
  );

  if (isLoading) return <LoadingWheel />;
  if (error) return <RefetchError refetch={refetch} />;

  return (
    <Section>
      <Head>
        <title>Dashboard</title>
      </Head>
      <h2 className="font-medium my-4">Dashboard</h2>

      <div className="shadow-md rounded p-6 mb-4 bg-custom-bg-off-light dark:bg-custom-bg-off-dark">
        <div className="flex mb-3">
          <h3 className="flex-grow font-medium">Books on Reserve</h3>

          <Link
            className="text-custom-text-light-subtle dark:text-custom-text-dark-subtle hover:text-custom-text-light dark:hover:text-custom-text-dark"
            href="/dashboard/reservations"
          >
            See more
          </Link>
        </div>

        <div className="">
          <Carousel>
            {data.current
              ? data.current.map((reservation: any) => (
                  <BookItem
                    key={`recent-book-${reservation.book.id}`}
                    book={reservation.book}
                  />
                ))
              : null}
          </Carousel>
        </div>
      </div>

      <div className="shadow-md rounded p-6 mb-4 bg-custom-bg-off-light dark:bg-custom-bg-off-dark">
        <h3 className="font-medium">Favorite Genre</h3>

        <ul className="flex flex-row flex-wrap ">
          {data.favoriteGenres.map((genreCount: any) => (
            <li
              className="bg-custom-bg-off-light dark:bg-custom-bg-off-dark py-2 px-4 mr-4 rounded-md"
              key={`favorite-genre-${genreCount.id}`}
            >
              <Link href={`/library/search?genre=${genreCount.id}`}>
                {genreCount.genre.name}
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

      <div className="shadow-md rounded p-6 bg-custom-bg-off-light dark:bg-custom-bg-off-dark">
        <h3 className="font-medium">Favorite Author</h3>

        <ul className="flex flex-row flex-wrap ">
          {data.favoriteAuthor.map((author: any) => (
            <li
              className="bg-custom-bg-off-light dark:bg-custom-bg-off-dark py-2 px-4 mr-4 rounded-md"
              key={`favorite-author-${author.id}`}
            >
              <Link href={`/author/${author.id}/${author.slug}`}>
                {author.name}
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
    </Section>
  );
};

DashboardPage.auth = {
  admin: false,
};

export default DashboardPage;
