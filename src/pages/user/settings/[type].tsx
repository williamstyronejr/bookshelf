import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState, SyntheticEvent } from 'react';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Input from '../../../components/Input';
import { validateNewPassword, validateUser } from '../../../utils/validation';
import { getServerAuthSession } from '../../../utils/serverSession';
import Head from 'next/head';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession({ req: ctx.req, res: ctx.res });
  if (!session || !session.user) {
    return {
      props: {},
      redirect: '/',
    };
  }

  return {
    props: {
      user: session.user,
    },
  };
};

const PasswordForm = () => {
  const [fieldErrors, setFieldErrors] = useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const handleSubmit = (evt: SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const formData = new FormData(evt.currentTarget);
    const fields: any = Object.fromEntries(formData.entries());

    const { valid, errors } = validateNewPassword(fields);
    if (!valid) return setFieldErrors(errors);
  };

  return (
    <form className="" onSubmit={handleSubmit}>
      <Head>
        <title>Settings - Password</title>
      </Head>
      <fieldset>
        <Input
          name="oldPassword"
          type="password"
          label="Old Password"
          placeholder="Old Password ..."
          error={fieldErrors.oldPassword}
        />

        <Input
          name="newPassword"
          type="password"
          label="New Password"
          placeholder="New Password ..."
          error={fieldErrors.newPassword}
        />

        <Input
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Confirm New Password ..."
          error={fieldErrors.confirmPassword}
        />
      </fieldset>

      <button
        className="block bg-custom-btn-submit py-2 px-4 mx-auto rounded text-white"
        type="submit"
      >
        Update Password
      </button>
    </form>
  );
};

const AccountForm = ({
  initUsername,
  initEmail,
}: {
  initUsername: string;
  initEmail: string;
}) => {
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
  }>({});

  const handleSubmit = (evt: SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const formData = new FormData(evt.currentTarget);
    const fields: any = Object.fromEntries(formData.entries());
    const inputs: any = {};
    if (fields.username !== '') inputs.username = fields.username;
    if (fields.email !== '') inputs.email = fields.email;
    const { valid, errors } = validateUser(fields);
    if (!valid) return setFieldErrors(errors);

    if (Object.keys(inputs).length === 0) return;
  };

  return (
    <form className="" onSubmit={handleSubmit}>
      <Head>
        <title>Settings - Account</title>
      </Head>

      <fieldset className="">
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

      <button
        className="block bg-custom-btn-submit py-2 px-4 mx-auto rounded text-white"
        type="submit"
      >
        Update Account
      </button>
    </form>
  );
};

const SettingsPage: NextPage<{ user: any }> = ({ user }) => {
  const { query } = useRouter();

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

            <li
              className={`inline-block md:block w-3/6 md:w-full 
            md:border-l-2 ${
              query.type === 'password'
                ? 'md:border-black dark:md:border-white bg-custom-bg-off-light dark:bg-custom-bg-off-dark font-semibold'
                : 'md:border-transparent md:hover:border-gray-200 hover:bg-custom-bg-off-light hover:dark:bg-custom-bg-off-dark'
            }`}
            >
              <Link href="/user/settings/password">
                <a className="block w-full py-3 md:py-4">Password</a>
              </Link>
            </li>
          </ul>
        </aside>

        <div className="flex-grow mx-auto py-4 px-12">
          {query.type === 'account' ? (
            <AccountForm initUsername={user.username} initEmail={user.email} />
          ) : null}
          {query.type === 'password' ? <PasswordForm /> : null}
        </div>
      </div>
    </section>
  );
};

SettingsPage.auth = {
  admin: false,
};

export default SettingsPage;
