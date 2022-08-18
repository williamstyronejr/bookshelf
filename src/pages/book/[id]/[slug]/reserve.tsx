import { useMutation, useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

export default function ReservationPage() {
  const { query } = useRouter();

  const { data: book, isLoading } = useQuery(
    ['book-reservation'],
    async () => {
      const res = await fetch(`/api/books/${query.slug}/reservation`);

      if (res.statusText !== 'OK') {
        throw new Error('Invalid request');
      }

      const { book } = await res.json();
      return book;
    },
    {
      enabled: !!query.slug,
    }
  );

  const {
    data: mutatedData,
    mutate,
    isLoading: isMutating,
  } = useMutation(
    ['reservation'],
    async ({ reserveLength }: { reserveLength: string }) => {
      const res = await fetch(`/api/books/${query.slug}/reservation`, {
        method: 'POST',
        body: JSON.stringify({ reserveLength }),
      });

      if (res.statusText !== 'OK') {
        throw new Error('Invalid request');
      }

      const body = await res.json();
      console.log(body);
      return true;
    }
  );

  function submitHandler(evt: React.SyntheticEvent<HTMLFormElement>) {
    evt.preventDefault();

    mutate({ reserveLength: '30' });
  }

  if (isLoading && !book) return <div>Loading...</div>;

  return (
    <section className="relative h-full">
      <div
        className={`flex-col flex-nowrap w-full h-full absolute z-10 bg-custom-background items-center justify-center ${
          mutatedData ? 'flex' : 'hidden'
        }`}
      >
        <h3>Reservation Completed</h3>
        <p>Come pickup your book at the library.</p>
        <Link href="/dashboard">Go back to Dashboard</Link>
      </div>

      <form className="" onSubmit={submitHandler}>
        <header>
          <div className="relative w-32 h-40">
            <Image
              className="rounded-lg"
              priority={true}
              layout="fill"
              // objectFit="contain"
              src={book.displayImage}
              alt="Book covers"
            />
          </div>
        </header>

        <fieldset>
          <label>
            <select>
              <option value={7}>7</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>
          </label>
        </fieldset>

        <button className="" disabled={isMutating}>
          Create Reservation
        </button>
      </form>
    </section>
  );
}
