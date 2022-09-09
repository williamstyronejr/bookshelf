import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import * as React from 'react';
import Link from 'next/link';
import Input from '../../../components/Input';
import { validateNewPassword, validateUser } from '../../../utils/validation';

const PasswordForm = () => {
  const [fieldErrors, setFieldErrors] = React.useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const handleSubmit = (evt: React.SyntheticEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const formData = new FormData(evt.currentTarget);
    const fields: any = Object.fromEntries(formData.entries());

    const { valid, errors } = validateNewPassword(fields);
    if (!valid) return setFieldErrors(errors);
  };

  return (
    <form className="" onSubmit={handleSubmit}>
      <fieldset>
        <Input
          name="oldPassword"
          type="password"
          label="Old Password"
          placeholder=""
          error={fieldErrors.oldPassword}
        />

        <Input
          name="newPassword"
          type="password"
          label="New Password"
          placeholder=""
          error={fieldErrors.newPassword}
        />

        <Input
          name="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder=""
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

const AccountForm = () => {
  const [fieldErrors, setFieldErrors] = React.useState<{
    username?: string;
    email?: string;
  }>({});

  const handleSubmit = (evt: React.SyntheticEvent<HTMLFormElement>) => {
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
      <header>
        <h3>Account</h3>
      </header>
      <fieldset className="">
        <Input
          name="username"
          type="text"
          label="Username"
          placeholder="Username"
          error={fieldErrors.username}
        />

        <Input
          name="email"
          type="text"
          label="Email"
          placeholder="Email"
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

const SettingsPage: NextPage = () => {
  const { query } = useRouter();

  return (
    <section className="">
      <header className="mb-4">
        <h4 className="font-medium">Settings</h4>
      </header>

      <aside>
        <ul>
          <li>
            <Link href="/user/settings/account">
              <a>Account</a>
            </Link>
          </li>

          <li>
            <Link href="/user/settings/password">
              <a>Password</a>
            </Link>
          </li>
        </ul>
      </aside>

      <div className="bg-custom-background max-w-xl mx-auto py-4 px-12">
        {query.type === 'account' ? <AccountForm /> : null}

        {query.type === 'password' ? <PasswordForm /> : null}
      </div>
    </section>
  );
};

SettingsPage.auth = {
  admin: false,
};

export default SettingsPage;