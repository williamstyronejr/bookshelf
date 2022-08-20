import { useState, createRef, useEffect } from 'react';
import Image from 'next/image';

const FileInput = ({
  name,
  label,
  error,
  initalValue,
}: {
  name: string;
  label: string;
  error?: string | null;
  initalValue?: string | null;
}) => {
  const [value, setValue] = useState<File | undefined>();
  const [fileUrl, setFileUrl] = useState<string | undefined>(initalValue || '');
  const ref = createRef<HTMLInputElement>();

  useEffect(() => {
    if (value) {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target) setFileUrl(e.target.result?.toString());
      };

      reader.readAsDataURL(value);
    }
  }, [value]);

  return (
    <label className="block my-5" htmlFor={name}>
      <button
        className="group w-full h-32 relative border-2 border-dashed rounded-lg hover:border-slate-900"
        type="button"
        onClick={() => (ref.current ? ref.current.click() : null)}
      >
        <span
          className={`${
            fileUrl !== ''
              ? 'flex invisible group-hover:visible h-full w-full items-center justify-center bg-neutral-500/50 top-0 left-0'
              : 'block top-2/4 left-2/4 translate-x-[-50%] translate-y-[-50%]'
          } absolute z-10 `}
        >
          {label}
        </span>

        {fileUrl ? (
          <div className="relative h-full w-32 mx-auto">
            <Image
              className="rounded-lg"
              priority={true}
              layout="fill"
              src={fileUrl}
              alt="Preview Cover"
            />
          </div>
        ) : null}
      </button>

      <input
        className="hidden"
        type="file"
        name={name}
        ref={ref}
        onChange={(evt) =>
          setValue(evt.target.files ? evt.target.files[0] : undefined)
        }
      />

      {error ? (
        <span className="block text-red-500 text-sm">{error}</span>
      ) : null}
    </label>
  );
};

export default FileInput;
