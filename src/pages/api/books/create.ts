import type { NextApiRequest, NextApiResponse } from 'next';
import { validateBook } from '../../../utils/validation';
import { prisma } from '../../../utils/db';
import { uploadFile } from '../../../utils/upload';
import { createSlug } from '../../../utils/slug';
import { getUserDataFromSession } from '../../../utils/serverSession';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { defaultBookImage } from '../../../utils/default';
dayjs.extend(customParseFormat);

type Data = {
  id: string;
  slug: string;
};

type ErrorResponse = {
  title?: string;
  author?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | ErrorResponse | String>
) {
  const { method } = req;

  if (method !== 'POST') return res.status(404).send('');

  try {
    const { session, user } = await getUserDataFromSession({ req, res });
    if (!session || !user) {
      return res.redirect(401, '/api/auth/signin');
    } else if (user.role !== 'ADMIN') {
      return res.status(403).end();
    }

    const { fields, publicUrl } = await uploadFile(req);

    const { errors, valid } = validateBook(fields);
    if (!valid) return res.status(400).json(errors);

    const author = await prisma.author.findUnique({
      where: {
        id: parseInt(fields.author),
      },
    });

    if (!author)
      return res.status(400).json({ author: 'This author does not exist.' });

    const book = await prisma.book.create({
      data: {
        title: fields.title,
        pageCount: parseInt(fields.pageCount),
        isbn13: fields.isbn13,
        slug: createSlug(fields.title),
        copiesCount: parseInt(fields.copiesCount),
        displayImage: publicUrl || defaultBookImage,
        publishedDate: dayjs(fields.publishedDate, 'MM/DD/YYYY').toDate(),
        description: fields.description,
        author: {
          connect: { id: parseInt(fields.author) },
        },
        publisher: {
          connect: { id: parseInt(fields.publisher) },
        },
        language: {
          connect: { id: parseInt(fields.language) },
        },
        BookGenres: {
          create: {
            genreId: parseInt(fields.genre),
          },
        },
      },
    });

    res.status(200).json({
      id: book.id.toString(),
      slug: book.slug,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('');
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
