import '../../styles/globals.css';
import type { AppProps } from 'next/app';
import { useRef, useState, FC, useEffect, ReactNode } from 'react';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { SessionProvider, useSession, signOut } from 'next-auth/react';
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

const Search: FC<{}> = () => {
  const router = useRouter();
  const [search, setSearch] = useState('');

  return (
    <div className="flex-grow relative pr-6">
      <div className="w-full max-w-lg relative">
        <input
          className="py-3 pl-4 pr-12 bg-transparent border w-full rounded-lg border-custom-text-light-subtle focus:shadow-[0_0_0_1px_rgba(59,93,214,1)]"
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

        <button className="absolute top-4 right-4 text-slate-400 hover:text-slate-700">
          <i className="focus-within:text-black fas fa-search transition-colors" />
        </button>
      </div>
    </div>
  );
};

const UserOptions = () => {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const { data, status } = useSession();
  const [menu, setMenu] = useMenuToggle(ref, false);

  const { data: userData } = useQuery(
    ['me'],
    async () => {
      const res = await fetch('/api/users/me');
      if (res.ok) return await res.json();
      throw new Error('Server error occurred during request.');
    },
    { enabled: status === 'authenticated', refetchOnMount: false }
  );

  // Disable Menu on router switch (Eslint needs to be ignored)
  useEffect(() => {
    setMenu(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.pathname]);

  return (
    <div className="flex flex-row flex-nowrap relative">
      {status !== 'loading' ? (
        <div ref={ref}>
          <button
            className=""
            type="button"
            onClick={() => {
              if (status === 'unauthenticated') return router.push('/signin');
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
                    fill={true}
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
            } absolute z-20 right-6 top-16 w-60 bg-custom-bg-light dark:bg-custom-bg-dark py-4 px-2 rounded-lg shadow-md dark:shadow-white/20`}
          >
            <nav className="">
              <ul className="">
                <li>
                  <Link
                    className="block w-full text-left p-2 hover:bg-custom-bg-off-light dark:hover:bg-gray-400/30 transition-colors"
                    href="/user/settings/account"
                  >
                    Settings
                  </Link>
                </li>

                <li>
                  <button
                    type="button"
                    className="block w-full text-left p-2 hover:bg-custom-bg-off-light dark:hover:bg-gray-400/30 transition-colors"
                    onClick={() => signOut()}
                  >
                    Logout
                  </button>
                </li>

                {userData && userData.user && userData.user.role === 'ADMIN' ? (
                  <>
                    <hr />

                    <li>
                      <Link
                        className="block w-full text-left px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-custom-bg-off-dark"
                        href="/admin/book/create"
                      >
                        Create Book
                      </Link>
                    </li>

                    <li>
                      <Link
                        className="block w-full text-left px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-custom-bg-off-dark"
                        href="/admin/author/create"
                      >
                        Create Author
                      </Link>
                    </li>

                    <li>
                      <Link
                        className="block w-full text-left px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-custom-bg-off-dark"
                        href="/admin/author/manage"
                      >
                        Manage Author
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
    <li className={`mb-2 mt-2 md:my-0 md:px-4`}>
      <div
        className={`md:mx-6 border-b-2 ${
          isMatch ? 'border-b-blue-500' : 'border-b-transparent'
        }`}
      >
        <Link
          className="block w-full text-center text-lg py-2  transition-colors text-custom-text-light dark:text-custom-text-dark hover:text-custom-text-link-light dark:hover:text-custom-text-link-dark"
          aria-current={isMatch ? 'page' : 'false'}
          href={to}
        >
          {label}
        </Link>
      </div>
    </li>
  );
};

const Header: FC<{ setTheme: Function }> = ({ setTheme }) => {
  const [menu, setMenu] = useState(false);

  return (
    <header className="relative w-full px-8 bg-custom-bg-light dark:bg-custom-bg-dark text-custom-text-light dark:text-custom-text-dark">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-row flex-nowrap mb-4 pt-4 items-center justify-center align-middle">
          <button
            type="button"
            className="block md:hidden z-50"
            onClick={() => setMenu(!menu)}
          >
            <i className="text-3xl text-custom-text-light dark:text-custom-text-dark fas fa-bars" />
          </button>

          <Link
            href="/"
            className="ml-4 mr-10 text-center text-xl font-bold text-custom-text-light dark:text-custom-text-dark"
          >
            Readly
          </Link>

          <Search />

          <UserOptions />
        </div>

        <div
          className={`${
            menu ? 'block' : 'hidden'
          } md:hidden w-screen h-screen absolute top-0 left-0 bg-black/40 z-10`}
        />
        <nav
          className={`md:block ${
            menu ? '' : 'hidden'
          } fixed md:static top-0 left-0 w-44 md:w-full h-screen md:h-auto px-4 py-20 md:p-0 z-30 bg-custom-bg-light dark:bg-custom-bg-dark`}
        >
          <ul className="flex flex-col md:flex-row flex-nowrap relative md:justify-center md:divide-x-2 divide-solid divide-slate-500">
            <NavLink to="/library" label="Books" />
            <NavLink to="/dashboard" label="Dashboard" />
            <NavLink to="/user/lists/favorites" label="Favorites" />
            <NavLink to="/dashboard/reservations" label="Reservation" />
          </ul>
        </nav>
      </div>
    </header>
  );
};

const Auth: FC<{
  auth: { admin?: boolean };
  children: ReactNode;
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
    router.replace('/signin');
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

              <main className="flex-grow p-3 bg-custom-bg-light dark:bg-custom-bg-dark">
                <Component {...pageProps} />
              </main>
            </Auth>
          </>
        ) : (
          <>
            <Header setTheme={setTheme} />
            <main className="flex-grow pt-3 bg-custom-bg-light dark:bg-custom-bg-dark">
              <Component {...pageProps} />
            </main>
          </>
        )}
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
