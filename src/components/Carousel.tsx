import { FC, ReactNode, useRef } from 'react';

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

export default Carousel;
