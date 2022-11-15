import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, SyntheticEvent } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { signIn } from 'next-auth/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Input from '../../../components/Input';
import FileInput from '../../../components/FileInput';
import LoadingWheel from '../../../components/LoadingWheel';
import RefetchError from '../../../components/RefetchError';
import { validateAccount } from '../../../utils/validation';
import { defaultProfileImage } from '../../../utils/default';

const AccountForm = ({
  initProfile,
  initUsername,
  initEmail,
}: {
  initProfile: string;
  initUsername: string;
  initEmail: string;
}) => {
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    profileImage?: string;
  }>({});

  const {
    data: success,
    mutate,
    error,
    isLoading,
  } = useMutation(['account', 'settings'], async (formData: FormData) => {
    const res = await fetch('/api/users/settings/account', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) return (await res.json()).success;
    if (res.status === 401) return signIn();
    if (res.status === 400) {
      const errors = await res.json();
      return setFieldErrors(errors);
    }
    throw new Error('Unexpected error occurred, please try again.');
  });

  const handleSubmit = (evt: SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setFieldErrors({});

    const formData = new FormData(evt.currentTarget);
    const fields: any = Object.fromEntries(formData.entries());
    const { valid, errors } = validateAccount(fields);
    if (!valid) return setFieldErrors(errors);

    mutate(formData);
  };

  return (
    <form className="" onSubmit={handleSubmit}>
      <Head>
        <title>Settings - Account</title>
      </Head>

      <header>
        {success ? (
          <div className="py-4 px-2 text-center rounded-md bg-green-500 text-white">
            Account has successfully been updated.
          </div>
        ) : null}

        {error ? (
          <div className="py-4 px-2 text-center rounded-md bg-red-500 text-white">
            Unexpected error occurred, please try again.
          </div>
        ) : null}
      </header>

      <fieldset>
        <FileInput
          name="profileImage"
          label="Profile Image"
          initialValue={initProfile}
          error={fieldErrors.profileImage}
          removable={true}
          defaultUrl={defaultProfileImage}
        />

        <Input
          name="username"
          type="text"
          label="Username"
          placeholder="Username"
          initialValue={initUsername}
          error={fieldErrors.username}
        />

        <Input
          name="email"
          type="text"
          label="Email"
          placeholder="Email"
          initialValue={initEmail}
          error={fieldErrors.email}
        />
      </fieldset>

      <button className="btn-submit" type="submit" disabled={isLoading}>
        Update Account
      </button>
    </form>
  );
};

const SettingsPage: NextPage<{}> = () => {
  const { query } = useRouter();

  const { data, isLoading, error, refetch } = useQuery(
    ['settings'],
    async () => {
      const res = await fetch('/api/users/settings');
      if (res.ok) return await res.json();
      if (res.status === 401) return signIn();
      throw new Error('Unexpected error occurred, please try again.');
    }
  );

  return (
    <section className="max-w-2xl mx-auto">
      <Head>
        <title>Settings</title>
      </Head>

      <header className="mb-4">
        <h4 className="font-medium">Settings</h4>
      </header>

      <div className="flex flex-col flex-nowrap md:flex-row border-[1px]">
        <aside className="w-full md:w-48 shrink-0 border-b-[1px] md:border-r-[1px] md:border-b-0">
          <ul className="w-full text-center md:shrink-0">
            <li
              className={`inline-block md:block w-3/6 md:w-full 
            md:border-l-2 ${
              query.type === 'account'
                ? 'md:border-black dark:md:border-white bg-custom-bg-off-light dark:bg-custom-bg-off-dark font-semibold'
                : 'md:border-transparent md:hover:border-gray-200 hover:bg-custom-bg-off-light hover:dark:bg-custom-bg-off-dark'
            }`}
            >
              <Link href="/user/settings/account">
                <a className="block w-full py-3 md:py-4">Account</a>
              </Link>
            </li>
          </ul>
        </aside>

        <div className="flex-grow mx-auto py-4 px-12">
          {isLoading ? <LoadingWheel /> : null}
          {error ? <RefetchError refetch={refetch} /> : null}

          {data ? (
            <>
              {query.type === 'account' ? (
                <AccountForm
                  initProfile={data.user.image}
                  initUsername={data.user.name}
                  initEmail={data.user.email}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
};

SettingsPage.auth = {
  admin: false,
};

export default SettingsPage;
