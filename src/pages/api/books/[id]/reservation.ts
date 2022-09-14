import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../utils/db';
import Redis from 'ioredis';
import dayjs from 'dayjs';

import { getServerAuthSession } from '../../../../utils/serverSession';

const redisClient = new Redis(process.env.REDIS_URL?.toString() || '');

type Data = {
  book?: any;
  reservation?: any;
};

type InputError = {
  reserveLength?: string;
  timeout?: boolean;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | InputError>
) {
  const {
    query: { id },
    body: { reserveLength },
    method,
  } = req;

  if (method !== 'POST') return res.status(404).end();
  if (!reserveLength || !id)
    return res
      .status(400)
      .json({ reserveLength: 'Length of reservation is required.' });

  try {
    const session = await getServerAuthSession({ req, res });
    if (!session || !session.user || !session.user.id)
      return res.status(401).end();

    const holdExists = await redisClient.zscore(
      `reserve-${id}`,
      session.user.id.toString()
    );

    if (!holdExists) {
      return res.status(400).json({
        timeout: true,
      });
    }

    const reservation = await prisma.reservation.create({
      data: {
        book: {
          connect: {
            id: parseInt(id.toString()),
          },
        },
        user: {
          connect: {
            id: session.user.id,
          },
        },
        dueDate: dayjs(Date.now()).add(reserveLength, 'days').toDate(),
      },
    });

    await redisClient.zrem(`reserve-${id}`, session.user.id);
    return res.status(200).json({
      reservation: JSON.parse(JSON.stringify(reservation)),
    });
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
}
