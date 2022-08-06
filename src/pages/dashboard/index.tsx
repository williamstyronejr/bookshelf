import Image from 'next/image';

export default function DashboardPage() {
  const data: { current: Array<Record<string, string>> } = {
    current: [],
  };

  return (
    <section className="">
      <div className="bg-custom-background shadow-md rounded p-6">
        <div className="flex mb-3">
          <h3 className="flex-grow font-semibold">Currently Books</h3>

          <select>
            <option>Title</option>
            <option>Date</option>
          </select>
        </div>

        <div className="flex">
          <ul className="">
            {data.current.length ? (
              data.current.map((book) => (
                <li key={book.id}>
                  <Image
                    width="200px"
                    objectFit="fill"
                    src={book.displayImage}
                    alt="Book covers"
                  />
                </li>
              ))
            ) : (
              <li className=" ">You have no current book</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
