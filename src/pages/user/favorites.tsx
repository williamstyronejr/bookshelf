import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';

export default function UserFavoritesPage() {
  const { data, isLoading } = useQuery(['favorites-all'], async () => {
    const res = await fetch('/api/users/favorites');
    if (res.statusText !== 'OK') throw new Error('invalid request');

    const body = await res.json();
    return body.results;
  });

  return (
    <section>
      <header>
        <h2 className="">Favorites</h2>
      </header>

      <ul className="grid grid-cols-[repeat(auto-fit,_minmax(8rem,_1fr))] gap-4">
        {!isLoading
          ? data.map((book) => (
              <li key={book.id}>
                <div className="relative w-32 h-40">
                  <Image
                    className="rounded-lg"
                    priority={true}
                    layout="fill"
                    // objectFit="contain"
                    src={book.displayImage}
                    alt="Book covers"
                  />
                </div>
                <div className="font-medium">{book.title}</div>
                <div className="text-gray-600">{book.author}</div>
              </li>
            ))
          : null}
      </ul>
    </section>
  );
}
