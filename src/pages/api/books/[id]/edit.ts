import type { NextApiRequest, NextApiResponse } from 'next';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { validateBook } from '../../../../utils/validation';
import { prisma } from '../../../../utils/db';
import { uploadFile, deleteFirebaseFile } from '../../../../utils/upload';
import { createSlug } from '../../../../utils/slug';
import { getUserDataFromSession } from '../../../../utils/serverSession';
import { defaultBookImage } from '../../../../utils/default';
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
  const {
    method,
    query: { id },
  } = req;
  if (method !== 'POST' || !id) return res.status(404).send('');

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

    let displayImage = undefined;
    if (fields.displayImage_remove === 'true' || publicUrl) {
      const oldBook = await prisma.book.findUnique({
        where: { id: parseInt(id.toString()) },
      });

      if (
        oldBook &&
        oldBook.displayImage &&
        oldBook.displayImage !== defaultBookImage
      ) {
        await deleteFirebaseFile(oldBook.displayImage);
      }
      displayImage = publicUrl || defaultBookImage;
    }

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
        displayImage: displayImage,
        publishedDate: dayjs(fields.publishedDate, 'MM/DD/YYYY').toDate(),
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
      include: {
        BookSeries: true,
      },
    });

    if (fields.series) {
      if (book) {
        const series = await prisma.series.findUnique({
          where: {
            id: parseInt(fields.series),
          },
        });

        if (series) {
          if (book.BookSeries.length > 0) {
            if (book.BookSeries[0].seriesId !== parseInt(fields.series)) {
              await Promise.all([
                prisma.bookSeries.create({
                  data: {
                    bookId: book.id,
                    seriesId: series.id,
                    order: parseInt(fields.order),
                  },
                }),
                prisma.bookSeries.delete({
                  where: {
                    id: book.BookSeries[0].id,
                  },
                }),
              ]);
            } else {
              // Order was changed
              await prisma.bookSeries.update({
                where: {
                  id: book.BookSeries[0].id,
                },
                data: {
                  order: parseInt(fields.order),
                },
              });
            }
          } else {
            await prisma.bookSeries.create({
              data: {
                bookId: book.id,
                seriesId: series.id,
                order: parseInt(fields.order),
              },
            });
          }
        }
      }
    }

    res.status(200).json({
      id: book.id.toString(),
      slug: book.slug,
    });
  } catch (err) {
    res.status(500).send('');
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
