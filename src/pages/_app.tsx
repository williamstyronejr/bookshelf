import '../../styles/globals.css';
import type { AppProps } from 'next/app';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { SessionProvider, useSession, signOut, signIn } from 'next-auth/react';
import Link from 'next/link';
import Loading from '../components/Loading';
import Image from 'next/image';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const NoPermissionPage = ({ linkBack }: { linkBack?: string }) => {
  return (
    <main className="">
      <Link href={linkBack || '/'}>Go back</Link>
    </main>
  );
};

const UserOptions = () => {
  const { data, status } = useSession();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  return (
    <div className="flex flex-row flex-nowrap mb-8">
      <div className="flex-grow">
        <i className="focus-within:text-black absolute top-3.5 left-2 text-slate-400 fas fa-search " />

        <input
          className="bg-white py-2 pr-4 pl-8 border rounded-lg border-slate-500 focus:shadow-[0_0_0_1px_rgba(59,93,214,1)]"
          name="search"
          type="text"
          placeholder="Search by title, author, tags, etc"
          value={search}
          onChange={(evt) => setSearch(evt.target.value)}
          onKeyDown={(evt) => {
            if (evt.key === 'Enter' && search !== '')
              router.push(`/library/search?q=${search}`);
          }}
        />
      </div>

      {status !== 'loading' ? (
        <>
          <button
            className=""
            type="button"
            onClick={() => {
              if (status === 'unauthenticated') {
                return signIn();
              }
              setMenu((old) => !old);
            }}
          >
            {status === 'unauthenticated' ? (
              'Signin'
            ) : (
              <div className="flex flex-row flex-nowrap items-center">
                <div className="relative w-10 h-10 mr-2">
                  <Image
                    className="rounded-lg"
                    priority={true}
                    layout="fill"
                    src={data.user.image || ''}
                    alt="Book covers"
                  />
                </div>

                <div>{data.user.name || data.user.email}</div>
              </div>
            )}
          </button>

          <div
            className={`${
              menu ? 'block' : 'hidden'
            } absolute z-20 right-6 top-16 w-60 bg-custom-background py-4 px-2 rounded-lg shadow-md`}
          >
            <nav className="">
              <ul className="">
                <li>
                  <Link href="/user/settings">
                    <a className="block w-full text-left px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-custom-bg-off-dark">
                      Settings
                    </a>
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="block w-full text-left px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-custom-bg-off-dark"
                    onClick={() => signOut()}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
};

const NavLink = ({ to, label }: { to: string; label: string }) => {
  const router = useRouter();
  const isMatch = router.pathname === to;

  return (
    <li
      className={`mb-2 mt-2 border-l-2 ${
        isMatch ? 'border-blue-500' : 'border-transparent'
      }`}
    >
      <Link href={to}>
        <a
          className={`text-center text-lg py-2 w-full block ${
            isMatch ? 'text-black' : 'text-gray-600'
          } hover:text-black`}
          aria-current={isMatch ? 'page' : 'false'}
        >
          {label}
        </a>
      </Link>
    </li>
  );
};

const Header = () => {
  const router = useRouter();
  const { status } = useSession();
  const [menu, setMenu] = useState(true);

  useEffect(() => {
    // setMenu(false);
  }, [router.pathname]);

  return (
    <header
      className={`flex flex-col flex-nowrap relative bg-custom-background text-black shrink-0 transition-width shadow-lg ${
        menu ? 'w-64' : 'w-14'
      }`}
    >
      <div className="mb-4 mt-4 flex items-center justify-center">
        <button type="button" className="" onClick={() => setMenu(!menu)}>
          <i className="text-3xl dark:text-white fas fa-bars" />
        </button>

        <h3
          className={`${
            menu ? '' : 'hidden'
          } ml-4 mr-10 text-center text-black dark:text-white`}
        >
          Readly
        </h3>
      </div>

      <nav className={`flex-grow ${menu ? '' : 'hidden'}`}>
        <ul className="">
          <NavLink to="/" label="Home" />
          <NavLink to="/library" label="Library" />
          {status === 'authenticated' ? (
            <>
              <NavLink to="/user" label="Dashboard" />
              <NavLink to="/user/lists/favorites" label="Favorites" />
              <NavLink to="/dashboard/reservations" label="Reservation" />
            </>
          ) : null}
        </ul>
      </nav>

      <button
        className="my-4"
        onClick={() => {
          const html = document.querySelector('html');
          if (html) {
            html.className = html.className === 'dark' ? '' : 'dark';
          }
        }}
      >
        <i className="text-3xl dark:text-white fas fa-moon" />
      </button>
    </header>
  );
};

const Auth: React.FC<{
  auth: { admin?: boolean };
  children: React.ReactNode;
}> = ({ auth, children }) => {
  const router = useRouter();
  const { data, status } = useSession({ required: true });

  const { data: userData, isFetching } = useQuery(
    ['me'],
    async () => {
      const res = await fetch('/api/users/me');
      const body = res.json();
      return body;
    },
    { enabled: status !== 'loading' && auth.admin }
  );

  if (status === 'loading' || isFetching)
    return <Loading text="Checking Auth" />;

  if (!data) {
    router.replace('/api/auth/signin');
    return <Loading text="Checking auth" />;
  }

  if (auth.admin && userData.user.role !== 'ADMIN') return <NoPermissionPage />;

  return <>{children}</>;
};

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {(Component as any).auth ? (
          <>
            <Auth auth={(Component as any).auth}>
              <Header />

              <main className="flex-grow bg-custom-bg-off-light dark:bg-custom-bg-off-dark p-3 overflow-y-auto">
                <UserOptions />
                <Component {...pageProps} />
              </main>
            </Auth>
          </>
        ) : (
          <>
            <Header />
            <main className="flex-grow bg-custom-bg-off-light dark:bg-custom-bg-off-dark p-3 overflow-y-auto">
              <UserOptions />
              <Component {...pageProps} />
            </main>
          </>
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
