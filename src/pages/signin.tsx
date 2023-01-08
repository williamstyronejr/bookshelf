import { NextPageContext, InferGetServerSidePropsType } from 'next';
import { getCsrfToken } from 'next-auth/react';
import { useRouter } from 'next/router';
import Section from '../components/ui/Section';

const possibleErrors = [
  'OAuthSignin',
  'OAuthCallback',
  'OAuthCreateAccount',
  'EmailCreateAccount',
  'OAuthAccountNotLinked',
  'CredentialsSignin',
  'Default',
];

// 'EmailSignin',
// 'SessionRequired',

export async function getServerSideProps(context: NextPageContext) {
  const csrfToken = await getCsrfToken(context);
  return {
    props: { csrfToken },
  };
}
const SigninPage = ({
  csrfToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { query } = useRouter();

  const isError = query && query.error && query.error === '';
  return (
    <Section>
      <form
        className="flex flex-col flex-nowrap max-w-xl mx-auto px-4 mt-8"
        method="POST"
        action="/api/auth/signin/email"
      >
        <header>
          <h2 className="font-bold text-4xl text-center py-8">Sign in</h2>

          {query && query.error && query.error === 'SessionRequired' ? (
            <div className="px-4 py-4 text-center text-lg font-medium">
              Login Required
            </div>
          ) : null}

          {query &&
          query.error &&
          possibleErrors.includes(query.error.toString()) ? (
            <div className="w-full px-4 py-6 mb-6 rounded-lg bg-red-500">
              An error occurred during request, please try again.
            </div>
          ) : null}
        </header>

        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

        <label className="" htmlFor="email">
          <span className="block my-2">Email</span>

          <input
            className={`w-full bg-white text-black py-2 px-4 border rounded  ${
              query && query.error && query.error
                ? 'border-red-500 focus:shadow-[0_0_0_1px_rgba(244,33,46,1)]'
                : 'border-slate-500 focus:shadow-[0_0_0_1px_rgba(59,93,214,1)]'
            }  outline-0`}
            // type="email"
            id="email"
            name="email"
            placeholder="email@example.com"
          />

          {query.error && query.error === 'EmailSignin' ? (
            <span className="block text-red-500 text-sm">Invalid email</span>
          ) : null}
        </label>

        <button className="btn-submit mt-10" type="submit">
          Sign in with Email
        </button>
      </form>
    </Section>
  );
};

export default SigninPage;