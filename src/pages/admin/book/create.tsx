import type { NextPage } from 'next';
import * as React from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import Input from '../../../components/Input';
import InputSuggestion from '../../../components/InputSuggestion';
import FileInput from '../../../components/FileInput';
import { validateBook } from '../../../utils/validation';

const CreateBookPage: NextPage = () => {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = React.useState<any>({});

  const { data, mutate, isLoading } = useMutation(
    ['create-book'],
    async ({ title, author }: { title: string; author: string }) => {
      const res = await fetch(`/api/books/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          author,
        }),
      });

      const body = await res.json();
      return res.status === 400 ? setFieldErrors(body) : body;
    }
  );

  const handleSubmit = (evt: React.SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const formData = new FormData(evt.currentTarget);
    const fields: any = Object.fromEntries(formData.entries());

    const { valid, errors } = validateBook(fields);
    if (!valid) return setFieldErrors(errors);
    mutate(fields);
  };

  if (data) router.push(`/book/${data.slug}`);

  return (
    <section>
      <header className="my-4">
        <h3 className="">Create Book</h3>
      </header>

      <form
        className="max-w-2xl bg-custom-background mx-auto px-10 py-4 mt-2"
        onSubmit={handleSubmit}
      >
        <fieldset className="">
          <FileInput
            name="displayImage"
            label="Click to Change Book Cover"
            error={fieldErrors.displayImage}
          />

          <Input
            type="text"
            name="title"
            placeholder="title"
            label="Title"
            error={fieldErrors.title}
          />

          <InputSuggestion
            name="author"
            placeholder="Author"
            label="Author"
            error={fieldErrors.author}
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
