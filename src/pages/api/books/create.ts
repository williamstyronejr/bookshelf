import type { NextApiRequest, NextApiResponse } from 'next';
import { validateBook } from '../../../utils/validation';
import { prisma } from '../../../utils/db';
import { uploadFile } from '../../../utils/upload';
import { createSlug } from '../../../utils/slug';

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
        authorId: parseInt(fields.author),
        pageCount: parseInt(fields.pageCount),
        isbn13: fields.isbn13,
        publisherId: fields.publisher,
        languageId: fields.langauge,
        genreId: fields.genre,
        slug: createSlug(fields.title),
        copiesCount: parseInt(fields.copiesCount),
        displayImage: publicUrl || '',
        publishedDate: new Date(Date.now()),
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
