import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Redis from 'ioredis';
import dayjs from 'dayjs';
import { prisma } from '../../../../utils/db';
import { getServerAuthSession } from '../../../../utils/serverSession';
import { signIn } from 'next-auth/react';

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

  function submitHandler(evt: React.SyntheticEvent<HTMLFormElement>) {
    evt.preventDefault();

    const formData = new FormData(evt.currentTarget);
    const fields: any = Object.fromEntries(formData.entries());

    mutate({ reserveLength: fields.time });
  }

  if (!book) return <div>Loading...</div>;
  if (!available) return <NotAvailable />;

  return (
    <section className="relative">
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
        <h3 className="text-center">Reservation</h3>
      </header>

      <div className="flex flex-row flex-nowrap px-4">
        <aside className="mr-4">
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

          <div className="">{book.title}</div>
          <div className="">{book.author.name}</div>
        </aside>

        <form className="" onSubmit={submitHandler}>
          <fieldset>
            <label>
              <span className="block">Reservation Length</span>

              <select id="time" name="time">
                <option value={7}>7 Days</option>
                <option value={10}>10 Days</option>
                <option value={20}>20 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </label>
          </fieldset>

          <button className="" disabled={isMutating}>
            Create Reservation
          </button>
        </form>
      </div>
    </section>
  );
}
