import { FC, ReactNode, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Carousel: FC<{ children: ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div className="flex flex-row relative w-full">
      <button
        type="button"
        className="shrink-0 px-2"
        onClick={() => {
          if (ref.current && ref.current.scrollLeft >= 0)
            ref.current.scrollLeft -=
              ref.current?.getBoundingClientRect().width;
        }}
      >
        <i className="fas fa-chevron-left text-3xl" />
      </button>

      <div
        ref={ref}
        className="flex flex-row flex-nowrap flex-grow overflow-x-hidden"
      >
        {children}
      </div>

      <button
        type="button"
        className="shrink-0 px-2"
        onClick={() => {
          if (ref.current && ref.current.scrollLeft >= 0)
            ref.current.scrollLeft +=
              ref.current?.getBoundingClientRect().width / 2;
        }}
      >
        <i className="fas fa-chevron-right text-3xl" />
      </button>
    </div>
  );
};

export const BookItem = ({ book }: { book: any }) => (
  <div className="relative shrink-0 w-40 mr-6 max-w-[175px]">
    <Link
      data-cy="carousel-book"
      href={`/book/${book.id}/${book.slug}`}
      className="hover:text-custom-text-link-light hover:text-custom-text-link-dark"
    >
      <>
        <div className="relative h-56 shadow-md mb-2">
          <Image
            className="rounded-lg"
            priority={true}
            fill={true}
            src={book.displayImage}
            alt="Book covers"
          />
        </div>

        <div className="font-medium whitespace-nowrap text-ellipsis overflow-hidden">
          {book.title}
        </div>
      </>
    </Link>

    {book.author ? (
      <Link
        className="block text-gray-600"
        href={`/author/${book.author.id}/${book.author.slug}`}
      >
        {book.author.name}
      </Link>
    ) : null}
  </div>
);

export const GenreItem = ({
  image,
  name,
  id,
}: {
  name: string;
  image: string;
  id: string;
}) => (
  <div className="relative h-52 shrink-0 w-40 mr-6 max-w-[175px]">
    <Image
      className="rounded-lg"
      priority={true}
      fill={true}
      alt="Genre Cover"
      src={image}
    />

    <Link
      className="flex flex-row flex-nowrap absolute top-0 right-0 w-full h-full justify-center items-center z-10 font-bold bg-black/70 text-white"
      href={`/library/search?genre=${id}`}
    >
      {name}
    </Link>
  </div>
);

export default Carousel;
