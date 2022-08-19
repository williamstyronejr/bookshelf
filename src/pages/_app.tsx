import '../../styles/globals.css';
import type { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

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
          <NavLink to="/auth/signin" label="Signin" />
          <NavLink to="/auth/signup" label="Signup" />
        </ul>
      </nav>

      <ul className={`${menu ? '' : 'hidden'}`}>
        <NavLink to="/user/settings" label="Settings" />
      </ul>

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

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <QueryClientProvider client={queryClient}>
        <Header />

        <main className="flex-grow bg-custom-bg-off-light dark:bg-custom-bg-off-dark p-3 overflow-y-auto">
          <Component {...pageProps} />
        </main>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
