import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const SearchBar = () => {
  const [search, setSearch] = useState('');
  const router = useRouter();

  return (
    <div className="relative">
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
  );
};

export const getServerSideProps = () => {
  return {
    props: {
      topBooks: [
        {
          id: 'test',
          title: 'Title',
          author: 'Author',
          displayImage:
            'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
        },
        {
          id: 'test2',
          title: 'Title 2',
          author: 'Author 2',
          displayImage:
            'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
        },
        {
          id: 'test3',
          title: 'Title 3',
          author: 'Author 3',
          displayImage:
            'https://edit.org/images/cat/book-covers-big-2019101610.jpg',
        },
      ],
    },
  };
};

export default function LibraryPage({ topBooks }) {
  return (
    <section>
      <header className="mb-8">
        <SearchBar />
      </header>

      <div className="">
        <ul className="flex flex-row flex-nowrap w-full">
          {topBooks.map((book) => (
            <li
              key={book.id}
              className="relative flex-grow h-56 w-1/5 mr-6 max-w-[175px]"
            >
              <div className="relative h-56 shadow-md mb-2">
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
          ))}
        </ul>
      </div>
    </section>
  );
}
