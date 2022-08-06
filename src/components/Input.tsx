import { useState } from 'react';

const Input = ({
  name,
  label,
  type,
  placeholder,
  error,
  defaultValue,
}: {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  error?: string | null;
  defaultValue?: string | null;
}) => {
  const [value, setValue] = useState(defaultValue || '');

  return (
    <label className="">
      <span className="">{label}</span>
      {error ? <div className="">{error}</div> : null}

      {type !== 'textarea' ? (
        <input
          className=""
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(evt) => setValue(evt.target.value)}
        />
      ) : (
        <textarea value={value} />
      )}
    </label>
  );
};

export default Input;
