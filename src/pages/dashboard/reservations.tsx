import { useQuery } from '@tanstack/react-query';
import type { NextPage } from 'next';
import Image from 'next/image';
import LoadingWheel from '../../components/LoadingWheel';
import { getRemainingTime } from '../../utils/date';

const ReservationsPage: NextPage = () => {
  const { data, isLoading, error, refetch } = useQuery(
    ['reservation'],
    async () => {
      const res = await fetch('/api/users/reservations');

      if (res.ok) return await res.json();
      throw new Error('An unexpected error occurred, please try again.');
    }
  );

  return (
    <section>
      <header className="my-4">
        <h2 className="font-semibold text-xl">Your Books</h2>
      </header>

      <div>
        <ul className="flex flex-col flex-nowrap">
          {isLoading ? <LoadingWheel /> : null}

          {data
            ? data.current.map((item: any) => (
                <li
                  key={`reservation-${item.id}`}
                  className="flex flex-col items-center md:flex-row flex-nowrap my-4 border py-2 px-2 rounded-lg"
                >
                  <div className="relative w-full h-32 md:w-20 md:h-20 mr-4">
                    <Image
                      className="rounded-lg"
                      priority={true}
                      layout="fill"
                      objectFit="contain"
                      src={item.book.displayImage}
                      alt="Book cover"
                    />
                  </div>

                  <div className="flex-grow mt-2 md:mt-0 text-center md:text-left">
                    <div className="font-medium">{item.book.title}</div>
                    <div className="text-gray-600">{item.book.author.name}</div>
                  </div>

                  <div className="">
                    <div>{getRemainingTime(item.dueDate)}</div>
                  </div>
                </li>
              ))
            : null}

          {error ? (
            <li className="w-full text-center py-2">
              <div className="text-8xl text-blue-600">
                <i className="fas fa-exclamation-circle" />
              </div>

              <div className="my-2">An error occurred during request.</div>
              <button
                className="mt-4 py-2 px-5 rounded-md text-white bg-blue-500"
                type="button"
                onClick={() => refetch()}
              >
                Retry
              </button>
            </li>
          ) : null}

          {data && data.current.length === 0 ? (
            <li className="">You are not borrowing any books.</li>
          ) : null}
        </ul>
      </div>
    </section>
  );
};

ReservationsPage.auth = {
  admin: false,
};

export default ReservationsPage;
