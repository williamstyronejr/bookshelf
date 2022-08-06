import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const SearchPage = () => {
  const [page, setPage] = useState(0);

  const { data } = useQuery(['search', page], async () => {
    const response = await fetch(`/api/search?page=${page}`);
    const data = await response.json();
    console.log(data);
    setPage(page + 1);
    return data.results;
  });

  return (
    <section className="">
      <div>
        <ul>
          {data
            ? data.map((book: any) => (
                <li key={book.id} className="">
                  <div className="">{book.title}</div>
                </li>
              ))
            : null}
        </ul>
      </div>
    </section>
  );
};

export default SearchPage;
