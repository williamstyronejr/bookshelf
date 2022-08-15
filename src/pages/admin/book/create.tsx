import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import * as React from 'react';
import Input from '../../../components/Input';
import { validateBook } from '../../../utils/validation';

export default function CreateBookPage() {
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
      <form className="" onSubmit={handleSubmit}>
        <header></header>

        <fieldset className="">
          <Input
            type="text"
            name="title"
            placeholder="title"
            label="Title"
            error={fieldErrors.title}
          />

          <Input
            type="text"
            name="author"
            placeholder="Author"
            label="Author"
            error={fieldErrors.author}
          />
        </fieldset>
        <button
          className="bg-custom-btn-submit text-white"
          type="submit"
          disabled={isLoading}
        >
          Create Book
        </button>
      </form>
    </section>
  );
}
