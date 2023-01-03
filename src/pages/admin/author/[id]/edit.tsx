import type { NextPage } from 'next';
import { useState, SyntheticEvent } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMutation } from '@tanstack/react-query';
import Section from '../../../../components/ui/Section';
import Input from '../../../../components/Input';
import FileInput from '../../../../components/FileInput';
import { prisma } from '../../../../utils/db';
import { validateAuthor } from '../../../../utils/validation';
import { defaultProfileImage } from '../../../../utils/default';

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

const AuthorEditPage: NextPage<{ authorData: any }> = ({ authorData }) => {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<any>({});

  const { mutate, data, isLoading, error } = useMutation(
    ['author-edit'],
    async (formData: FormData) => {
      const res = await fetch(`/api/author/${authorData.id}/edit`, {
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
    if ((formData.get('profileImage') as File).name === '')
      formData.delete('profileImage');

    const { valid, errors } = validateAuthor({
      name: formData.get('name') as string,
      bio: formData.get('bio') as string,
    });

    if (!valid) return setFieldErrors(errors);
    mutate(formData);
  };

  if (data) router.push(`/author/${data.author.id}/${data.author.slug}`);

  return (
    <Section>
      <Head>
        <title>{authorData.name} - Edit</title>
      </Head>

      <header className="my-4">
        <h3>Edit Author</h3>
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
            initialValue={authorData.profileImage}
            removable={true}
            defaultUrl={defaultProfileImage}
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
    </Section>
  );
};

AuthorEditPage.auth = {
  admin: true,
};

export default AuthorEditPage;
