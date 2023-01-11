import { FC, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import useMenuToggle from './useMenuToggle';

const AdminMenu: FC<{
  links: Array<{ title: string; href: string }>;
}> = ({ links }) => {
  const { status } = useSession();
  const ref = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useMenuToggle(ref, false);

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
    { enabled: status !== 'loading' }
  );

  if (
    error ||
    isFetching ||
    !userData ||
    !userData.user ||
    userData.user.role !== 'ADMIN'
  )
    return null;

  return (
    <div ref={ref} className="relative">
      <button
        data-cy="admin-menu"
        className="text-2xl"
        type="button"
        onClick={() => setMenu(!menu)}
      >
        <i className="fas fa-cog" />
      </button>

      <div
        className={`absolute w-32 right-0 z-10  bg-custom-bg-light dark:bg-custom-bg-off-dark  py-4 px-2 rounded-lg shadow-md ${
          menu ? 'block' : 'hidden'
        }`}
      >
        {links.map((item, index) => (
          <Link
            className="block w-full text-left px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-gray-400/30"
            key={`${item.title}-${index}`}
            href={item.href}
          >
            {item.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminMenu;
