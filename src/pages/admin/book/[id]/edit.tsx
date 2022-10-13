import type { GetServerSideProps, NextPage } from 'next';
import * as React from 'react';
import Input from '../../../../components/Input';
import InputSuggestion from '../../../../components/InputSuggestion';
import FileInput from '../../../../components/FileInput';
import { prisma } from '../../../../utils/db';
import { validateBook } from '../../../../utils/validation';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { query } = ctx;

  if (!query.id) return { props: { book: null } };
  try {
    const book = await prisma.book.findUnique({
      where: {
        id: parseInt(query.id.toString()),
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
    });

    if (!book)
      return {
        notFound: true,
        props: {},
      };

    return {
      props: {
        book: JSON.parse(JSON.stringify(book)),
      },
    };
  } catch (err) {
    return {
      notFound: true,
      props: {},
    };
  }
};

const EditBookPage: NextPage = ({ book }) => {
  const [fieldErrors, setFieldErrors] = React.useState<any>({});
  const router = useRouter();

  const { mutate, isLoading, error } = useMutation(
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

    const formData = new FormData(evt.currentTarget);
    const fields: any = Object.fromEntries(formData.entries());

    const { valid, errors } = validateBook(fields);
    if (!valid) return setFieldErrors(errors);
    console.log(fields);
    // mutate(formData);
  };

  return (
    <section>
      <form className="" onSubmit={handleSubmit}>
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
            initalValue={book.displayImage}
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
            name="isbn13"
            placeholder="ISBN"
            label="ISBN-13"
            initialValue={book.isbn13}
            error={fieldErrors.isbn13s}
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

        <button
          className="bg-custom-btn-submit text-white"
          type="submit"
          disabled={isLoading}
        >
          Update Book
        </button>
      </form>
    </section>
  );
};

EditBookPage.auth = {
  admin: true,
};

export default EditBookPage;
