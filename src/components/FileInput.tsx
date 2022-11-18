import { useState, createRef, useEffect } from 'react';
import Image from 'next/image';

const FileInput = ({
  name,
  label,
  error,
  initialValue,
  removable = false,
  defaultUrl = '',
}: {
  name: string;
  label: string;
  error?: string | null;
  initialValue?: string | null;
  removable?: boolean;
  defaultUrl?: string;
}) => {
  const ref = createRef<HTMLInputElement>();
  const [remove, setRemove] = useState(false);
  const [value, setValue] = useState<File | undefined>();
  const [fileUrl, setFileUrl] = useState<string | undefined>(
    initialValue || ''
  );

  useEffect(() => {
    if (value) {
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target) setFileUrl(e.target.result?.toString());
      };

      reader.readAsDataURL(value);
      setRemove(false);
    }
  }, [value]);

  return (
    <label className="block my-5" htmlFor={name}>
      <button
        className="group w-full h-52 relative border-2 border-dashed border-slate-400 dark:border-slate-400 rounded-lg hover:border-slate-900 hover:dark:border-slate-100"
        type="button"
        onClick={() => (ref.current ? ref.current.click() : null)}
      >
        <span
          className={`${
            fileUrl !== ''
              ? 'flex invisible group-hover:visible h-full w-full items-center justify-center bg-neutral-500/50 top-0 left-0'
              : 'block top-2/4 left-2/4 translate-x-[-50%] translate-y-[-50%]'
          } absolute z-10 text-white`}
        >
          {label}
        </span>

        {fileUrl ? (
          <div className="relative h-full w-auto mx-auto">
            <Image
              className="rounded-lg"
              priority={true}
              objectFit="contain"
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

      {removable ? (
        <>
          <input
            id={`${name}_remove`}
            name={`${name}_remove`}
            type="hidden"
            value={remove ? 'true' : 'false'}
            onChange={() => {}}
          />

          <button
            className="block w-full text-center pt-5 hover:text-slate-800 dark:hover:text-slate-300 disabled:text-gray-500 disabled:hover:text-gray-500 disabled:dark:hover:text-gray-500 transition-colors"
            type="button"
            disabled={
              remove || initialValue === fileUrl || fileUrl === defaultUrl
            }
            onClick={() => {
              setRemove(true);
              setFileUrl(defaultUrl);
              setValue(undefined);
              if (ref.current) ref.current.value = '';
            }}
          >
            Remove Image
          </button>
        </>
      ) : null}
    </label>
  );
};

export default FileInput;
