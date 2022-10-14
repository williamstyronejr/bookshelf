import type { NextPage } from 'next';
import { useState, SyntheticEvent } from 'react';
import Input from '../../../components/Input';
import FileInput from '../../../components/FileInput';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';

const AuthorCreatePage: NextPage = () => {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<any>({});

  const { mutate, data, isLoading, error } = useMutation(
    ['author-create'],
    async (formData: FormData) => {
      const res = await fetch('/api/author/create', {
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

  const submitHandler = (evt: SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setFieldErrors({});
    const formData = new FormData(evt.currentTarget);
    mutate(formData);
  };

  if (data) {
    router.push(`/author/${data.id}/${data.slug}`);
  }

  return (
    <section>
      <header className="my-4">
        <h3>Create Author</h3>
      </header>

      <form
        className="max-w-2xl mx-auto px-10 py-4 mt-2"
        onSubmit={submitHandler}
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
            name="profileImage"
            label="Author Image"
            error={fieldErrors.profileImage}
          />

          <Input
            name="name"
            label="Name"
            type="text"
            error={fieldErrors.name}
          />

          <Input
            name="bio"
            label="Description"
            type="textarea"
            error={fieldErrors.bio}
          />
        </fieldset>

        <div className="text-center">
          <button className="btn-submit" type="submit" disabled={isLoading}>
            Create Author
          </button>
        </div>
      </form>
    </section>
  );
};

AuthorCreatePage.auth = {
  admin: true,
};

export default AuthorCreatePage;
