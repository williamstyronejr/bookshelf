import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const InputSuggestion = ({
  name,
  label,
  placeholder,
  url,
  initialValue,
  initialHiddenValue,
  error,
  multiEntries = false,
}: {
  name: string;
  label: string;
  url: string;
  initialValue?: string;
  initialHiddenValue?: string;
  placeholder?: string;
  error?: string | null;
  multiEntries?: boolean;
}) => {
  const [value, setValue] = useState(initialValue || '');
  const [hiddenValue, setHiddenValue] = useState(initialHiddenValue || '');
  const [mouseOnList, setMouseOnList] = useState(false);
  const [focus, setFocus] = useState(false);

  const { data } = useQuery(
    ['suggestion', value],
    async ({ signal }) => {
      const res = await fetch(`${url}?name=${value}`, { signal });

      const body = await res.json();
      return body.results;
    },
    {
      enabled: !!value && focus,
    }
  );

  return (
    <div className="relative">
      <label className="block my-5" htmlFor={`${name}-placeholder`}>
        <span className="block my-1">{label}</span>

        <input
          className={`w-full bg-white py-2 px-4 border rounded ${
            error
              ? 'border-red-500 focus:shadow-[0_0_0_1px_rgba(244,33,46,1)]'
              : 'border-slate-500 focus:shadow-[0_0_0_1px_rgba(59,93,214,1)]'
          }  outline-0`}
          autoComplete="off"
          id={`${name}-placeholder`}
          name={`${name}-placeholder`}
          type="text"
          value={value}
          onChange={(evt) => setValue(evt.target.value)}
          placeholder={placeholder}
          onFocus={() => setFocus(true)}
          onBlur={() => {
            if (!mouseOnList) setFocus(false);
          }}
        />

        <input
          className="hidden"
          id={name}
          name={name}
          type="hidden"
          value={hiddenValue}
          onChange={(evt) => setHiddenValue(evt.target.value)}
        />

        {error ? (
          <span className="block text-red-500 text-sm">{error}</span>
        ) : null}
      </label>

      <div className="mt-2 absolute w-full top-16">
        <ul
          className="bg-white z-10"
          tabIndex={-1}
          onMouseEnter={() => setMouseOnList(true)}
          onMouseLeave={() => setMouseOnList(false)}
        >
          {data && focus
            ? data.map((author: any) => (
                <li key={`author-${author.id}`}>
                  <button
                    className="block w-full px-4 py-2 text-left border-b-2 border-slate-500/50 hover:bg-slate-200"
                    type="button"
                    onClick={() => {
                      setValue(author.name);
                      setHiddenValue(author.id);
                      setMouseOnList(false);
                      setFocus(false);
                    }}
                  >
                    {author.name}
                  </button>
                </li>
              ))
            : null}
        </ul>
      </div>
    </div>
  );
};

export default InputSuggestion;
