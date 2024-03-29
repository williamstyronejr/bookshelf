import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

function useDebounce(value: string, time = 1000) {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceValue(value);
    }, time);

    return () => clearTimeout(timeout);
  }, [value, time]);

  return debounceValue;
}

const InputSuggestion = ({
  name,
  label,
  placeholder,
  url,
  initialValue,
  initialHiddenValue,
  error,
}: {
  name: string;
  label: string;
  url: string;
  initialValue?: string;
  initialHiddenValue?: string;
  placeholder?: string;
  error?: string | null;
}) => {
  const [value, setValue] = useState(initialValue || '');
  const [hiddenValue, setHiddenValue] = useState(initialHiddenValue || '');
  const [mouseOnList, setMouseOnList] = useState(false);
  const [focus, setFocus] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const debounceValue = useDebounce(value);

  const { data, isFetching } = useQuery(
    ['suggestion', debounceValue],
    async ({ signal }) => {
      const res = await fetch(`${url}/input?name=${debounceValue}`, { signal });

      if (res.ok) return (await res.json()).results;
      throw new Error('Error occurred during request, please try again.');
    },
    {
      enabled: !!debounceValue && focus,
      retry: false,
      onSuccess: () => {
        setRequestError(null);
      },
      onError: () => {
        setRequestError('Error occurred during request, please try again.');
      },
    }
  );

  const { mutate, isLoading: isMutating } = useMutation(
    ['create', name],
    async (inputName: string) => {
      const res = await fetch(`${url}/create`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ name: inputName }),
      });

      if (res.ok) {
        const body = await res.json();

        setValue(body.name);
        setHiddenValue(body.id);
        return body;
      }

      throw new Error(
        `Unexpected error occurred while creating ${name}, please try again.`
      );
    },
    {
      onSuccess: () => {
        setRequestError(null);
      },
      onError: () => {
        setRequestError(
          `Unexpected error occurred while creating ${name}, please try again.`
        );
      },
    }
  );

  return (
    <div className="relative">
      <label className="block my-5" htmlFor={`${name}-placeholder`}>
        <span className="block my-1">{label}</span>

        <input
          className={`w-full bg-white text-black py-2 px-4 border rounded ${
            error || requestError
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
          disabled={isMutating}
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

        {requestError ? (
          <span className="block text-red-500 text-sm">{requestError}</span>
        ) : null}
      </label>

      <div className="mt-2 absolute w-full top-16">
        <ul
          data-cy="input-suggestion-list"
          className="block relative bg-white text-black z-10 w-full max-h-40 overflow-y-auto"
          tabIndex={-1}
          onMouseEnter={() => setMouseOnList(true)}
          onMouseLeave={() => setMouseOnList(false)}
        >
          {data && focus
            ? data.map((author: any) => (
                <li key={`author-${author.id}`} data-cy="input-suggestion">
                  <button
                    className="block w-full px-4 py-2 text-left border-b-2 border-slate-500/50 hover:bg-slate-200 focus:bg-slate-200"
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

          {data && focus && !isFetching && value.trim() !== '' ? (
            <li>
              <button
                className="block w-full px-4 py-2 text-left border-b-2 border-slate-500/50 hover:bg-slate-200"
                type="button"
                onClick={() => {
                  mutate(value.trim());
                  setMouseOnList(false);
                  setFocus(false);
                }}
              >
                Create {name} &quot;{value.trim()}&quot;
              </button>
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
};

export default InputSuggestion;
