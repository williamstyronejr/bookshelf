import type { NextPage } from 'next';
import { useState, SyntheticEvent } from 'react';
import Head from 'next/head';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Input from '../../../components/Input';
import FileInput from '../../../components/FileInput';
import InputSuggestion from '../../../components/InputSuggestion';
import { validateBook } from '../../../utils/validation';
import { defaultBookImage } from '../../../utils/default';

const CreateBookPage: NextPage = () => {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<any>({});

  const { data, mutate, isLoading, error } = useMutation(
    ['create-book'],
    async (formData: FormData) => {
      const res = await fetch(`/api/books/create`, {
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

  const handleSubmit = (evt: SyntheticEvent<HTMLFormElement>) => {
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
    <section>
      <Head>
        <title>Create Book</title>
      </Head>
      <header className="my-4">
        <h3 className="">Create Book</h3>
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

        <fieldset className="">
          <FileInput
            name="displayImage"
            label="Click to Change Book Cover"
            error={fieldErrors.displayImage}
            removable={true}
            initialValue={defaultBookImage}
            defaultUrl={defaultBookImage}
          />

          <Input
            type="text"
            name="title"
            placeholder="title"
            label="Title"
            error={fieldErrors.title}
          />

          <Input
            type="textarea"
            name="description"
            placeholder="Description"
            label="Description"
            error={fieldErrors.description}
          />

          <InputSuggestion
            name="author"
            placeholder="Author"
            label="Author"
            url="/api/author"
            error={fieldErrors.author}
          />

          <InputSuggestion
            name="genre"
            placeholder="Genre"
            label="Genre"
            url="/api/genre"
            error={fieldErrors.genre}
          />

          <InputSuggestion
            name="language"
            placeholder="Language"
            label="Language"
            url="/api/language"
            error={fieldErrors.language}
          />

          <InputSuggestion
            name="publisher"
            placeholder="Publisher"
            label="Publisher"
            url="/api/publisher"
            error={fieldErrors.language}
          />

          <Input
            type="text"
            name="publishedDate"
            placeholder="Publication Date (MM/DD/YYYY)"
            label="Publication Date (MM/DD/YYYY)"
            error={fieldErrors.publishedDate}
          />

          <Input
            type="text"
            name="isbn13"
            placeholder="ISBN"
            label="ISBN-13"
            error={fieldErrors.isbn13s}
          />

          <Input
            type="text"
            name="copiesCount"
            placeholder="# of Copies"
            label="# of copies"
            error={fieldErrors.copiesCount}
          />

          <Input
            type="text"
            name="pageCount"
            placeholder="Page Count"
            label="Page Count"
            error={fieldErrors.pageCount}
          />
        </fieldset>

        <button className="btn-submit" type="submit" disabled={isLoading}>
          Create Book
        </button>
      </form>
    </section>
  );
};

CreateBookPage.auth = {
  admin: true,
};

export default CreateBookPage;
