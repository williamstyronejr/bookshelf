import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Redis from 'ioredis';
import dayjs from 'dayjs';
import { signIn } from 'next-auth/react';
import { prisma } from '../../../../utils/db';
import { getServerAuthSession } from '../../../../utils/serverSession';

const redisClient = new Redis(process.env.REDIS_URL?.toString() || '');

const NotAvailable = () => (
  <section className="flex flex-col flex-nowrap w-full flex-grow justify-center items-center">
    Not avail
  </section>
);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession({ req: ctx.req, res: ctx.res });
  if (!session || !session.user || !session.user.id)
    return { redirect: { destination: '/api/auth/signin' }, props: {} };

  if (!ctx.params?.id || !ctx.params?.slug)
    return {
      notFound: true,
    };

  let book = await prisma.book.findUnique({
    where: {
      id: parseInt(ctx.params.id.toString()),
    },
    include: {
      author: true,
    },
  });

  if (!book)
    return {
      notFound: true,
      props: {},
    };

  const activeReservations = await prisma.reservation.findMany({
    where: {
      bookId: book.id,
    },
  });

  const reserveKey = `reserve-${book.id}`;
  const currentTime = dayjs(Date.now());
  const expireTime = currentTime.subtract(15, 'minute');
  const ttlTime = currentTime.add(15, 'minute');

  await redisClient.zremrangebyscore(reserveKey, -Infinity, expireTime.unix());
  const onHoldReserves = await redisClient.zrange(
    reserveKey,
    expireTime.unix(),
    Infinity,
    'BYSCORE',
    'WITHSCORES'
  );
  const available =
    onHoldReserves.length / 2 + activeReservations.length < book.copiesCount;
  if (available)
    await redisClient.zadd(reserveKey, ttlTime.unix(), session.user.id);

  return {
    props: {
      book: JSON.parse(JSON.stringify(book)),
      available: available,
    },
  };
};

export default function ReservationPage({ book, available }) {
  const { query, push, reload } = useRouter();
  const [reserveLength, setReserveLength] = useState('7');
  const [menu, setMenu] = useState(false);

  const {
    data: mutatedData,
    mutate,
    isLoading: isMutating,
  } = useMutation(
    ['reservation'],
    async ({ reserveLength }: { reserveLength: string }) => {
      const res = await fetch(`/api/books/${query.id}/reservation`, {
        method: 'POST',
        body: JSON.stringify({ reserveLength }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.status !== 200 && res.status !== 400 && res.status !== 401) {
        throw new Error('');
      }

      const body = await res.json();
      if (res.status === 400) {
        if (body.timeout) {
          // Reload page to reset timer and get book availblity
          reload();
        }

        return false;
      } else if (res.status === 401) {
        signIn();
      }

      return true;
    }
  );

  if (!book) return <div>Loading...</div>;
  if (!available) return <NotAvailable />;

  return (
    <section className="relative max-w-2xl md:mx-auto">
      <div
        className={`flex-col flex-nowrap w-full h-full absolute z-10 bg-custom-background items-center justify-center ${
          mutatedData ? 'flex' : 'hidden'
        }`}
      >
        <span className="text-8xl">
          <i className="far fa-check-circle" />
        </span>
        <h3 className="text-2xl my-4">Reservation Completed!</h3>
        <p>Come pickup your book at the library.</p>
        <Link href="/dashboard">
          <a className="">Go back to Dashboard</a>
        </Link>
      </div>

      <header>
        <h3 className="">Reservation</h3>
      </header>

      <div className="flex flex-col md:flex-row flex-nowrap px-4 text-center md:text-left">
        <aside className="mr-4 mb-4 md:mb-0 flex-grow">
          <div className="relative w-52 h-60 mx-auto md:mx-0">
            <Image
              className="rounded-lg"
              priority={true}
              layout="fill"
              objectFit="contain"
              src={book.displayImage}
              alt="Book covers"
            />
          </div>

          <div className="text-center md:text-left w-40 md:w-auto mx-auto md:mx-0 mt-4 md:mt-0">
            {book.title}
          </div>

          <Link href={`/author/${book.author.id}/${book.author.slug}`}>
            <a className="text-custom-text-light-subtle dark:text-custom-text-dark-subtle hover:text-custom-text-light hover:dark:text-custom-text-dark">
              {book.author.name}
            </a>
          </Link>
        </aside>

        <div className="text-center w-full md:w-auto md:text-left shrink-0">
          <input
            id="length"
            name="length"
            type="hidden"
            value={reserveLength}
            onChange={() => {}}
          />

          <button
            className="w-full px-4 py-2 rounded-md mb-2 mx-auto bg-custom-bg-off-light dark:bg-custom-bg-off-dark"
            aria-label="menu"
            type="button"
            onClick={() => setMenu((old) => !old)}
          >
            {reserveLength} Days
            <i
              className={`fas fa-arrow-down ml-4 transition ${
                menu ? 'rotate-180' : 'rotate-0'
              } `}
            />
          </button>

          <div
            className={`${
              menu ? 'block' : 'hidden'
            } bg-custom-bg-off-light dark:bg-custom-bg-off-dark px-1 py-1 mb-2 rounded-md`}
          >
            <button
              className="w-full py-1"
              type="button"
              onClick={() => {
                setReserveLength('7');
                setMenu(false);
              }}
            >
              7 Days
            </button>
          </div>

          <button
            className="text-white bg-custom-btn-submit py-2 px-4 mt-4 rounded-md"
            onClick={() => mutate({ reserveLength })}
            disabled={isMutating}
          >
            Create Reservation
          </button>
        </div>
      </div>
    </section>
  );
}
