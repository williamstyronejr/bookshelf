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
        className="w-20 h-20"
        type="button"
        onClick={() => (ref.current ? ref.current.click() : null)}
      >
        <span className="block my-1">{label}</span>
        {fileUrl ? (
          <div className="relative w-20 h-20">
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
