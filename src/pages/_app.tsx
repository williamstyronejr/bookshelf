import '../../styles/globals.css';
import type { AppProps } from 'next/app';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import React, { useRef, useState, FC, useEffect } from 'react';
import { useRouter } from 'next/router';
import { SessionProvider, useSession, signOut, signIn } from 'next-auth/react';
import Link from 'next/link';
import Loading from '../components/Loading';
import Image from 'next/image';
import useMenuToggle from '../components/useMenuToggle';

const isBrowserDefaultDark = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches;

const getDefaultTheme = (): string => {
  const localStorageTheme = localStorage.getItem('theme');
  const browserDefault = isBrowserDefaultDark() ? 'dark' : 'light';
  return localStorageTheme || browserDefault;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const ThemeToggle: FC<{ setTheme: Function }> = ({ setTheme }) => {
  return (
    <button
      className="my-4"
      onClick={() => {
        setTheme((curr: string) => (curr === 'light' ? 'dark' : 'light'));
      }}
    >
      <i className="text-3xl dark:text-white fas fa-moon" />
    </button>
  );
};

const UserOptions = () => {
  const router = useRouter();
  const { data, status } = useSession();
  const ref = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [menu, setMenu] = useMenuToggle(ref, false);

  const { data: userData } = useQuery(
    ['me'],
    async () => {
      const res = await fetch('/api/users/me');
      if (res.ok) return await res.json();
      throw new Error('Server error occurred during request.');
    },
    { enabled: status === 'authenticate' }
  );

  return (
    <div className="flex flex-row flex-nowrap mb-8 relative">
      <div className="flex-grow relative pr-6">
        <i className="focus-within:text-black absolute top-4 left-2 text-slate-400 fas fa-search" />

        <input
          className="py-3 pl-8 bg-transparent border w-full max-w-xs rounded-lg border-custom-text-light-subtle focus:shadow-[0_0_0_1px_rgba(59,93,214,1)]"
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
        <div ref={ref}>
          <button
            className=""
            type="button"
            onClick={() => {
              if (status === 'unauthenticated') {
                return signIn();
              }
              setMenu(!menu);
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
                    src={data ? data?.user?.image || '' : ''}
                    alt="Book covers"
                  />
                </div>

                <div className="hidden md:block">
                  {data?.user?.name || data?.user?.email}
                </div>
              </div>
            )}
          </button>

          <div
            className={`${
              menu ? 'block' : 'hidden'
            } absolute z-20 right-6 top-16 w-60 bg-custom-bg-light dark:bg-custom-bg-off-dark  py-4 px-2 rounded-lg shadow-md`}
          >
            <nav className="">
              <ul className="">
                <li>
                  <Link href="/user/settings/account">
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

                <hr />

                {userData && userData.user && userData.user.role === 'ADMIN' ? (
                  <>
                    <li>
                      <Link href="/admin/book/create">
                        <a className="block w-full text-left px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-custom-bg-off-dark">
                          Create Book
                        </a>
                      </Link>
                    </li>

                    <li>
                      <Link href="/admin/author/create">
                        <a className="block w-full text-left px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-custom-bg-off-dark">
                          Create Author
                        </a>
                      </Link>
                    </li>

                    <li>
                      <Link href="/admin/author/manage">
                        <a className="block w-full text-left px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-custom-bg-off-dark">
                          Manage Author
                        </a>
                      </Link>
                    </li>
                  </>
                ) : null}
              </ul>
            </nav>
          </div>
        </div>
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
          className={`block w-full text-center text-lg py-2 ${
            isMatch
              ? 'text-custom-text-light dark:text-custom-text-dark'
              : 'text-custom-text-light-subtle dark:text-custom-text-dark-subtle hover:text-custom-text-light dark:hover:text-custom-text-dark'
          }`}
          aria-current={isMatch ? 'page' : 'false'}
        >
          {label}
        </a>
      </Link>
    </li>
  );
};

const Header: FC<{ setTheme: Function }> = ({ setTheme }) => {
  const { status } = useSession();
  const [menu, setMenu] = useState(true);

  return (
    <header
      className={`flex flex-col flex-nowrap relative bg-custom-bg-light dark:bg-custom-bg-dark text-custom-text-light dark:text-custom-text-dark shrink-0 transition-width ${
        menu ? 'w-64' : 'w-14'
      }`}
    >
      <div className="mb-4 mt-4 flex items-center justify-center">
        <button type="button" className="" onClick={() => setMenu(!menu)}>
          <i className="text-3xl text-custom-text-light dark:text-custom-text-dark fas fa-bars" />
        </button>

        <h3
          className={`${
            menu ? '' : 'hidden'
          } ml-4 mr-10 text-center text-custom-text-light dark:text-custom-text-dark`}
        >
          Readly
        </h3>
      </div>

      <nav className={`flex-grow ${menu ? '' : 'hidden'}`}>
        <ul className="">
          <NavLink to="/" label="Home" />
          {status === 'authenticated' ? (
            <>
              <NavLink to="/dashboard" label="Dashboard" />
              <NavLink to="/user/lists/favorites" label="Favorites" />
              <NavLink to="/dashboard/reservations" label="Reservation" />
            </>
          ) : null}
        </ul>
      </nav>

      <ThemeToggle setTheme={setTheme} />
    </header>
  );
};

const Auth: React.FC<{
  auth: { admin?: boolean };
  children: React.ReactNode;
}> = ({ auth, children }) => {
  const router = useRouter();
  const { data, status } = useSession({ required: true });

  const {
    data: userData,
    isFetching,
    error,
  } = useQuery(
    ['me'],
    async () => {
      const res = await fetch('/api/users/me');
      if (res.ok) return await res.json();
      throw new Error('Server error occurred during request.');
    },
    { enabled: status !== 'loading' && auth.admin }
  );

  if (status === 'loading' || isFetching)
    return <Loading text="Checking Auth" />;

  if (!data || error) {
    router.replace('/api/auth/signin');
    return <Loading text="Checking auth" />;
  }

  if (auth.admin && userData.user.role !== 'ADMIN') {
    router.push('/permissions');
    return null;
  }

  return <>{children}</>;
};

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [theme, setTheme] = useState<string>('');

  useEffect(() => {
    if (theme !== '') {
      localStorage.setItem('theme', theme === 'light' ? 'light' : 'dark');
      const html = document.querySelector('html');
      if (html) html.className = theme;
    }
  }, [theme]);

  useEffect(() => {
    setTheme(getDefaultTheme());
  }, []);

  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        {(Component as any).auth ? (
          <>
            <Auth auth={(Component as any).auth}>
              <Header setTheme={setTheme} />

              <main className="flex-grow bg-custom-bg-light dark:bg-custom-bg-dark p-3 overflow-y-auto">
                <UserOptions />
                <Component {...pageProps} />
              </main>
            </Auth>
          </>
        ) : (
          <>
            <Header setTheme={setTheme} />
            <main className="flex-grow bg-custom-bg-light dark:bg-custom-bg-dark p-3 overflow-y-auto">
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
