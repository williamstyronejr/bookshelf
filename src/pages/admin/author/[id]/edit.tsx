import { GetServerSideProps } from 'next';
import type { NextPage } from 'next';
import { prisma } from '../../../../utils/db';
import { useState, SyntheticEvent } from 'react';
import Input from '../../../../components/Input';
import FileInput from '../../../../components/FileInput';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const {
    query: { id },
  } = ctx;

  if (!id) return { notFound: true };
  const authorData = await prisma.author.findUnique({
    where: { id: parseInt(id.toString()) },
    select: {
      id: true,
      slug: true,
      name: true,
      profileImage: true,
      bio: true,
    },
  });

  if (!authorData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      authorData,
    },
  };
};

const AuthorEditPage: NextPage = ({ authorData }) => {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<any>({});

  const { mutate, data, isLoading } = useMutation(
    ['author-edit'],
    async (formData: FormData) => {
      const res = await fetch(`/api/author/${authorData.slug}/edit`, {
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
    if (formData.get('name') === authorData.name) formData.delete('name');
    if (formData.get('bio') === authorData.bio) formData.delete('bio');
    if ((formData.get('profileImage') as File).name === '')
      formData.delete('profileImage');

    mutate(formData);
  };

  if (data) router.push(`/author/${data.author.slug}`);

  return (
    <section>
      <header className="my-4">
        <h3>Edit Author</h3>
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
            initalValue={authorData.profileImage}
          />

          <Input
            name="name"
            label="Name"
            type="text"
            initialValue={authorData.name}
            error={fieldErrors.name}
          />

          <Input
            name="bio"
            label="Description"
            type="textarea"
            initialValue={authorData.bio}
            error={fieldErrors.bio}
          />
        </fieldset>

        <button className="btn-submit" type="submit" disabled={isLoading}>
          Update Author
        </button>
      </form>
    </section>
  );
};

AuthorEditPage.auth = {
  role: 'ADMIN',
};

export default AuthorEditPage;
