import type { NextPage } from 'next';
import React, { FC, useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Redis from 'ioredis';
import dayjs from 'dayjs';
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import Section from '../../../../components/ui/Section';
import { getServerAuthSession } from '../../../../utils/serverSession';
import { prisma } from '../../../../utils/db';

const redisClient = new Redis(process.env.REDIS_URL?.toString() || '');

const NotAvailable: FC<{ title: string }> = ({ title }) => (
  <section className="flex flex-col flex-nowrap w-full flex-grow justify-center items-center">
    <i className="text-6xl mb-4 fas fa-exclamation" />
    {title} is not longer available
    <Link
      className="text-custom-text-link-light dark:text-custom-text-link-dark hover:text-custom-text-link-hover-light hover:dark:text-custom-text-link-hover-dark"
      href="/library"
    >
      Go back to Library
    </Link>
  </section>
);

const Timedout = ({ reload }: { reload: Function }) => {
  return (
    <section className="flex flex-col flex-nowrap w-full flex-grow justify-center items-center">
      <i className="text-6xl text-blue-600 my-8 fas fa-hourglass-end " />
      <div className="font-semibold text-xl text-center mb-4">
        Your reservation for this book has timed out.
      </div>

      <button
        className="text-custom-text-link-light dark:text-custom-text-link-dark hover:text-custom-text-link-hover-light dark:hover:text-custom-text-link-hover-dark"
        onClick={() => reload()}
      >
        Click to reload page
      </button>
    </section>
  );
};

const Completed = () => (
  <section
    data-cy="form-success"
    className="flex flex-col flex-nowrap w-full flex-grow justify-center items-center"
  >
    <i className="text-8xl text-blue-600 my-8 far fa-check-circle" />

    <h3 className="font-semibold text-2xl text-center">
      Reservation Completed!
    </h3>

    <p className="mb-4">Come pickup your book at the library.</p>

    <Link
      className="text-custom-text-link-light dark:text-custom-text-link-dark hover:text-custom-text-link-hover-light dark:hover:text-custom-text-link-hover-dark"
      href="/dashboard"
    >
      Go back to Dashboard
    </Link>
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

const ReservationPage: NextPage<{ book: any; available: any }> = ({
  book,
  available,
}) => {
  const { query, reload } = useRouter();
  const [reserveLength, setReserveLength] = useState('7');
  const [menu, setMenu] = useState(false);
  const [fieldError, setFieldError] = useState<{ reserveLength?: string }>({});
  const [timer, setTimer] = useState(900);

  const {
    data: mutatedData,
    mutate,
    isLoading: isMutating,
    error,
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

      if (res.ok) return await res.json();
      if (res.status === 401) return signIn();
      if (res.status === 400) {
        const body = await res.json();
        // Reload page to reset timer and get book availblity
        if (body.timeout) reload();
        if (body.reserveLength)
          setFieldError({ reserveLength: body.reserveLength });

        return false;
      }

      throw new Error('An unexpected error occurred, please try again.');
    }
  );

  useEffect(() => {
    let interval: any = null;

    if (timer > 0) {
      interval = setInterval(() => setTimer((old) => old - 1), 1000);
    }

    return () => (interval ? clearInterval(interval) : undefined);
  }, [timer]);

  if (!available) return <NotAvailable title={book.title} />;
  if (timer === 0) return <Timedout reload={reload} />;
  if (mutatedData) return <Completed />;

  return (
    <Section>
      <Head>
        <title>Reservation</title>
      </Head>

      <header className="flex flex-row flex-nowrap py-4">
        <h3 className="flex-grow">Reservation</h3>

        <div className="bg-blue-600 p-2 rounded-md text-white">
          <div className="text-sm">Time Remaining</div>
          <div className="text-center text-2xl py-1">
            {`${('0' + Math.floor(timer / 60)).slice(-2)}:${(
              '00' +
              (timer % 60)
            ).slice(-2)}`}
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-nowrap max-w-2xl mx-auto px-4 text-center md:text-left items-center md:items-start">
        <aside className="mr-4 mb-4 md:mb-0 flex-grow">
          <div className="relative w-52 h-60 mx-auto md:mx-0">
            <Image
              className="rounded-lg object-contain"
              priority={true}
              fill={true}
              src={book.displayImage}
              alt="Book covers"
            />
          </div>

          <div className="text-center md:text-left w-40 md:w-auto mx-auto md:mx-0 mt-4 md:mt-0">
            {book.title}
          </div>

          <Link
            className="text-custom-text-light-subtle dark:text-custom-text-dark-subtle hover:text-custom-text-light hover:dark:text-custom-text-dark"
            href={`/author/${book.author.id}/${book.author.slug}`}
          >
            {book.author.name}
          </Link>
        </aside>

        <div className="text-center w-64 md:text-left shrink-0">
          {error ? (
            <div className="w-full bg-red-500 py-6 px-4 rounded-md text-white mb-4">
              {(error as any).message}
            </div>
          ) : null}

          <input
            id="length"
            name="length"
            type="hidden"
            value={reserveLength}
            onChange={() => {}}
          />

          <button
            className={`w-full px-4 py-2 rounded-md mb-2 mx-auto bg-custom-bg-off-light dark:bg-custom-bg-off-dark border ${
              fieldError.reserveLength ? 'border-red-500' : ''
            }`}
            data-cy="reserve-length"
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
            } divide-y bg-custom-bg-off-light dark:bg-custom-bg-off-dark px-1 py-1 mb-2 rounded-md`}
          >
            <button
              className="w-full py-2 hover:bg-slate-300 dark:hover:bg-gray-700"
              type="button"
              data-cy="reserve-length-7"
              onClick={() => {
                setReserveLength('7');
                setMenu(false);
              }}
            >
              7 Days
            </button>

            <button
              className="w-full py-2 hover:bg-slate-300 dark:hover:bg-gray-700"
              type="button"
              data-cy="reserve-length-14"
              onClick={() => {
                setReserveLength('14');
                setMenu(false);
              }}
            >
              14 Days
            </button>

            <button
              className="w-full py-2 hover:bg-slate-300 dark:hover:bg-gray-700"
              type="button"
              data-cy="reserve-length-30"
              onClick={() => {
                setReserveLength('30');
                setMenu(false);
              }}
            >
              30 Days
            </button>
          </div>

          <button
            data-cy="reserve-book"
            className="text-white w-full py-2 px-4 mt-4 rounded-md bg-custom-btn-submit"
            onClick={() => mutate({ reserveLength })}
            type="button"
            disabled={isMutating}
          >
            Create Reservation
          </button>
        </div>
      </div>
    </Section>
  );
};

ReservationPage.auth = {
  admin: false,
};

export default ReservationPage;
