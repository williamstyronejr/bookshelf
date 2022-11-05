import Redis from 'ioredis';
import { prisma } from './db';
import dayjs from 'dayjs';

const redisClient = new Redis(process.env.REDIS_URL?.toString() || '');

export async function getCurrentReservationHolds(bookId: number) {
  const reserveKey = `reserve-${bookId}`;
  const currentTime = dayjs(Date.now());
  const expireTime = currentTime.subtract(15, 'minute');

  const results = await redisClient.zrange(
    reserveKey,
    expireTime.unix(),
    Infinity,
    'BYSCORE',
    'WITHSCORES'
  );

  return results.length / 2;
}

export async function getTakenBookCount(bookId: number): Promise<number> {
  const activeReservation = await prisma.reservation.findMany({
    where: { bookId: bookId, status: { not: 'RETURN' } },
  });

  const currentHolds = await getCurrentReservationHolds(bookId);

  console.log(activeReservation);
  console.log(currentHolds);

  return activeReservation.length + currentHolds;
}
