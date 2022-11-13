const Loading = ({ text }: { text?: string }) => {
  return (
    <div className="flex flex-col flex-nowrap w-full h-full items-center justify-center bg-custom-bg-light dark:bg-custom-bg-dark">
      <div className="relative h-40 [transform-style:preserve-3d]">
        <div className="w-32 h-full absolute top-0 left-0 rounded-r-lg [transform-style:preserve-3d] animate-book-back motion-reduce:animation-none origin-[left_center] bg-sky-500" />
        <div className="w-32 h-full absolute top-0 left-0 rounded-r-lg [transform-style:preserve-3d] animate-book-page-6 motion-reduce:animation-none origin-[left_center] bg-[#fdfdfd]" />
        <div className="w-32 h-full absolute top-0 left-0 rounded-r-lg [transform-style:preserve-3d] animate-book-page-5 motion-reduce:animation-none origin-[left_center] bg-[#fafafa]" />
        <div className="w-32 h-full absolute top-0 left-0 rounded-r-lg [transform-style:preserve-3d] animate-book-page-4 motion-reduce:animation-none origin-[left_center] bg-[#efefef]" />
        <div className="w-32 h-full absolute top-0 left-0 rounded-r-lg [transform-style:preserve-3d] animate-book-page-3 motion-reduce:animation-none origin-[left_center] bg-[#f5f5f5]" />
        <div className="w-32 h-full absolute top-0 left-0 rounded-r-lg [transform-style:preserve-3d] animate-book-page-2 motion-reduce:animation-none origin-[left_center] bg-[#efefef]" />
        <div className="w-32 h-full absolute top-0 left-0 rounded-r-lg [transform-style:preserve-3d] animate-book-page-1 motion-reduce:animation-none origin-[left_center] bg-[#efefef]" />
        <div className="w-32 h-full absolute top-0 left-0 rounded-r-lg [transform-style:preserve-3d] animate-book-front motion-reduce:animation-none origin-[left_center] bg-sky-500" />
      </div>

      <div className="block">
        {text ? (
          <div className="mt-8 text-center dark:text-white">{text}</div>
        ) : null}
      </div>
    </div>
  );
};

export default Loading;
