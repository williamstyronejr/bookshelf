import type { NextPage } from 'next';
import { useState, SyntheticEvent } from 'react';
import Input from '../../../components/Input';
import FileInput from '../../../components/FileInput';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';

const AuthorCreatePage: NextPage = () => {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<any>({});

  const { mutate, data, isLoading } = useMutation(
    ['author-create'],
    async (formData: FormData) => {
      const res = await fetch('/api/author/create', {
        method: 'POST',
        body: formData,
      });

      const body = await res.json();
      return res.status === 400 ? setFieldErrors(body) : body;
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
        className="max-w-2xl bg-custom-background mx-auto px-10 py-4 mt-2"
        onSubmit={submitHandler}
      >
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

        <button className="btn-submit" type="submit" disabled={isLoading}>
          Create Author
        </button>
      </form>
    </section>
  );
};

AuthorCreatePage.auth = {
  admin: true,
};

export default AuthorCreatePage;
