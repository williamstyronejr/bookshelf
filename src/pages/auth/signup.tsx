import { useMutation } from '@tanstack/react-query';
import type { NextPage } from 'next';
import React, { useState } from 'react';
import Input from '../../components/Input';

const SignupPage: NextPage = () => {
  const [fieldError, setFieldError] = useState<Record<string, string>>({});

  const { mutate, isLoading } = useMutation(
    async ({
      username,
      password,
      email,
      confirmPassword,
    }: {
      username: string;
      password: string;
      email: string;
      confirmPassword: string;
    }) => {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email, confirmPassword }),
      });

      const data = await response.json();
      if (response.status === 400) {
        return setFieldError(data);
      }

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
        <header></header>

        <fieldset>
          <Input
            name="email"
            type="text"
            label="Email"
            placeholder="Email"
            error={fieldError.email || null}
          />

          <Input
            name="username"
            type="text"
            label="Username"
            placeholder="Username"
            error={fieldError.username || null}
          />

          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Password"
            error={fieldError.password || null}
          />

          <Input
            name="confirmPassword"
            type="password"
            label="Confirm Password"
            placeholder="Confirm Password"
            error={fieldError.confirmPassword || null}
          />
        </fieldset>

        <button className="" type="submit" disabled={isLoading}>
          Create Account
        </button>
      </form>
    </section>
  );
};

export default SignupPage;
