import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import dayjs from 'dayjs';
import Head from 'next/head';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import Section from '../../../../components/ui/Section';
import Input from '../../../../components/Input';
import InputSuggestion from '../../../../components/InputSuggestion';
import FileInput from '../../../../components/FileInput';
import { prisma } from '../../../../utils/db';
import { validateBook } from '../../../../utils/validation';
import { defaultBookImage } from '../../../../utils/default';
dayjs.extend(customParseFormat);

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { query } = ctx;

  if (!query.id) return { props: { book: null } };
  try {
    const bookId = parseInt(query.id.toString());
    const [book, bookSeries] = await Promise.all([
      prisma.book.findUnique({
        where: {
          id: bookId,
        },
        include: {
          author: true,
          publisher: true,
          language: true,
          BookGenres: {
            include: {
              genre: true,
            },
          },
        },
      }),
      prisma.bookSeries.findFirst({
        where: {
          bookId,
        },
        include: {
          series: true,
        },
      }),
    ]);

    if (!book)
      return {
        notFound: true,
        props: {},
      };

    return {
      props: {
        book: JSON.parse(JSON.stringify(book)),
        bookSeries: bookSeries,
      },
    };
  } catch (err) {
    return {
      notFound: true,
      props: {},
    };
  }
};

const EditBookPage: NextPage<{ book: any; bookSeries: any }> = ({
  book,
  bookSeries,
}) => {
  const [fieldErrors, setFieldErrors] = React.useState<any>({});
  const router = useRouter();

  const { data, mutate, isLoading, error } = useMutation(
    ['edit-book', book.id],
    async (formData: FormData) => {
      const res = await fetch(`/api/books/${book.id}/edit`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) return await res.json();
      if (res.status === 403) return router.push('/');
      if (res.status === 401) return router.push('/api/auth/signin');
      if (res.status === 400) {
        const errors = await res.json();
        return setFieldErrors(errors);
      }

      throw new Error('An unexpected error occurred, please try again.');
    }
  );

  const handleSubmit = (evt: React.SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setFieldErrors({});

    const formData = new FormData(evt.currentTarget);
    const fields: any = Object.fromEntries(formData.entries());

    const { valid, errors } = validateBook(fields);
    if (!valid) return setFieldErrors(errors);

    mutate(formData);
  };

  if (data) router.push(`/book/${data.id}/${data.slug}`);

  return (
    <Section>
      <Head>
        <title>{book.title} - Edit</title>
      </Head>

      <header className="my-4">
        <h3 className="">Edit Book</h3>
      </header>

      <form
        className="max-w-2xl mx-auto px-10 py-4 mt-2"
        onSubmit={handleSubmit}
      >
        <header>
          {error ? (
            <div className="w-full bg-red-500 py-6 px-4 rounded-md text-white">
              {(error as any).message}
            </div>
          ) : null}
        </header>

        <fieldset>
          <FileInput
            name="displayImage"
            label="Click to Change Book Cover"
            error={fieldErrors.displayImage}
            initialValue={book.displayImage}
            removable={true}
            defaultUrl={defaultBookImage}
          />

          <Input
            type="text"
            name="title"
            placeholder="title"
            label="Title"
            initialValue={book.title}
            error={fieldErrors.title}
          />

          <Input
            type="textarea"
            name="description"
            placeholder="Description"
            label="Description"
            initialValue={book.description}
            error={fieldErrors.description}
          />

          <InputSuggestion
            name="author"
            placeholder="Author"
            label="Author"
            url="/api/author"
            initialHiddenValue={book.author.id}
            initialValue={book.author.name}
            error={fieldErrors.author}
          />

          <InputSuggestion
            name="genre"
            placeholder="Genre"
            label="Genre"
            url="/api/genre"
            initialHiddenValue={
              book.BookGenres[0] ? book.BookGenres[0].genre.id : ''
            }
            initialValue={
              book.BookGenres[0] ? book.BookGenres[0].genre.name : ''
            }
            error={fieldErrors.genre}
          />

          <InputSuggestion
            name="language"
            placeholder="Language"
            label="Language"
            url="/api/language"
            initialHiddenValue={book.language.id}
            initialValue={book.language.name}
            error={fieldErrors.language}
          />

          <InputSuggestion
            name="publisher"
            placeholder="Publisher"
            label="Publisher"
            url="/api/publisher"
            initialHiddenValue={book.publisher.id}
            initialValue={book.publisher.name}
            error={fieldErrors.language}
          />

          <Input
            type="text"
            name="publishedDate"
            placeholder="Publication Date (MM/DD/YYYY)"
            label="Publication Date (MM/DD/YYYY)"
            initialValue={dayjs(book.publishedDate).format('MM/DD/YYYY')}
            error={fieldErrors.publishedDate}
          />

          <Input
            type="text"
            name="isbn13"
            placeholder="ISBN"
            label="ISBN-13"
            initialValue={book.isbn13}
            error={fieldErrors.isbn13}
          />

          <Input
            type="text"
            name="copiesCount"
            placeholder="# of Copies"
            label="# of copies"
            initialValue={book.copiesCount}
            error={fieldErrors.copiesCount}
          />

          <Input
            type="text"
            name="pageCount"
            placeholder="Page Count"
            label="Page Count"
            initialValue={book.pageCount}
            error={fieldErrors.pageCount}
          />
        </fieldset>

        <fieldset>
          <h3 className="">Book Series (Optional)</h3>

          <div className="px-4">
            <InputSuggestion
              name="series"
              placeholder="Series Name"
              label="Name"
              url="/api/series"
              error={fieldErrors.series}
              initialHiddenValue={bookSeries ? bookSeries.series.id : undefined}
              initialValue={bookSeries ? bookSeries.series.name : ''}
            />

            <Input
              type="text"
              name="order"
              placeholder="Book # in Series"
              label="Series Order"
              error={fieldErrors.order}
              initialValue={bookSeries ? bookSeries.order : ''}
            />
          </div>
        </fieldset>

        <div className="text-center">
          <button className="btn-submit" type="submit" disabled={isLoading}>
            Update Book
          </button>
        </div>
      </form>
    </Section>
  );
};

EditBookPage.auth = {
  admin: true,
};

export default EditBookPage;
