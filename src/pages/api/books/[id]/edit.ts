import type { NextApiRequest, NextApiResponse } from 'next';
import { validateBook } from '../../../../utils/validation';
import { prisma } from '../../../../utils/db';
import { uploadFile } from '../../../../utils/upload';
import { createSlug } from '../../../../utils/slug';
import { getServerAuthSession } from '../../../../utils/serverSession';

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
  const {
    method,
    query: { id },
  } = req;
  const session = await getServerAuthSession({ req, res });

  if (!session || !session.user) return res.redirect(401, '/api/auth/signin');
  if (method !== 'POST' || !id) return res.status(404).send('');

  try {
    const { fields, publicUrl } = await uploadFile(req);

    const { errors, valid } = validateBook(fields);
    if (!valid) return res.status(400).json(errors);

    const author = await prisma.author.findUnique({
      where: {
        id: parseInt(fields.author),
      },
    });
    const bookGenre = await prisma.bookGenres.findFirst({
      where: {
        genreId: parseInt(fields.genre),
        bookId: parseInt(id.toString()),
      },
    });

    if (!author)
      return res.status(400).json({ author: 'This author does not exist.' });

    const book = await prisma.book.update({
      where: {
        id: parseInt(id.toString()),
      },
      data: {
        title: fields.title,
        pageCount: parseInt(fields.pageCount),
        isbn13: fields.isbn13,
        slug: createSlug(fields.title),
        copiesCount: parseInt(fields.copiesCount),
        displayImage: publicUrl || '',
        publishedDate: new Date(Date.now()),
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
          upsert: {
            where: {
              id: bookGenre?.id,
            },
            create: {
              genreId: parseInt(fields.genre.toString()),
            },
            update: {
              genreId: parseInt(fields.genre.toString()),
            },
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
