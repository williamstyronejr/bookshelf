import { useMutation } from '@tanstack/react-query';
import type { GetServerSidePropsContext, NextPage } from 'next';
import { getCsrfToken } from 'next-auth/react';
import React from 'react';
import Input from '../../components/Input';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      csrfToken: await getCsrfToken(context),
    },
  };
}

const SigninPage: NextPage = ({ csrfToken }: { csrfToken: string }) => {
  const { mutate, isLoading } = useMutation(
    async ({ username, password }: { username: string; password: string }) => {
      const response = await fetch('/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer Token ${csrfToken}`,
        },
        body: JSON.stringify({ username, password, csrfToken }),
      });

      console.log(response);
      if (response.status === 400) {
        return null;
      }

      const data = await response.json();
      console.log({ data });
      return data;
    }
  );

  const onSubmit = (evt: React.SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const formData = new FormData(evt.currentTarget);
    const fields: any = Object.fromEntries(formData.entries());
    mutate(fields);
  };

  return (
    <section>
      <form className="" onSubmit={onSubmit}>
        <header className=""></header>

        <fieldset className="">
          <Input
            name="username"
            type="text"
            label="Username"
            placeholder="Username"
          />
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Password"
          />
        </fieldset>

        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
        <button className="" type="submit" disabled={isLoading}>
          Signin
        </button>
      </form>
    </section>
  );
};

export default SigninPage;
