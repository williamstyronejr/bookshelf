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
  <div className="relative shrink-0 w-32 mr-6 max-w-[175px]">
    <Link href={`/book/${book.id}/${book.slug}`}>
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

    <Link
      className="block text-gray-600"
      href={`/author/${book.author.id}/${book.author.slug}`}
    >
      {book.author.name}
    </Link>
  </div>
);

export default Carousel;
