import type { NextPage } from 'next';
import { useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '../../../components/Modal';

const AuthorItem = ({ author }: { author: any }) => {
  const [modal, setModal] = useState(false);

  return (
    <li className="flex flex-row flex-nowrap w-full border-slate-200 border-2 rounded p-2 mb-4">
      {modal ? (
        <Modal
          onSuccess={() => console.log('deleteing author')}
          onClose={() => setModal(false)}
        >
          Are you sure you want to delete Author: {author.name}
        </Modal>
      ) : null}

      <div className="shrink-0 relative w-20 h-20 mr-4">
        <Image
          className="rounded-lg"
          priority={true}
          layout="fill"
          src={author.profileImage}
          alt="Book covers"
        />
      </div>

      <div className="flex-grow">{author.name}</div>

      <div className="flex flex-col flex-nowrap justify-around shrink-0">
        <Link href={`/admin/author/${author.id}/edit`}>
          <a className="block bg-custom-btn-submit text-center text-white px-4 py-2 rounded-lg">
            Edit
          </a>
        </Link>

        <button
          className="bg-red-500 text-center text-white px-4 py-2 mt-2 rounded-lg"
          type="button"
          onClick={() => setModal(!modal)}
        >
          Remove
        </button>
      </div>
    </li>
  );
};

const ManageAuthorsPage: NextPage = () => {
  const limit = 10;
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery(
      ['author-manage'],
      async ({ pageParam = 0 }) => {
        const res = await fetch(`/api/author?page=${pageParam}&limit=${limit}`);

        const body = await res.json();
        return body;
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.results.length === limit
            ? lastPage.nextPage
            : undefined;
        },
        keepPreviousData: true,
      }
    );

  return (
    <section className="">
      <header></header>

      <div>
        <ul className="flex flex-col flex-nowrap">
          {data &&
            data.pages.map((page) =>
              page.results.map((author) => (
                <AuthorItem author={author} key={`author-${author.id}`} />
              ))
            )}
        </ul>

        <div>
          <button className="" type="button">
            Prev
          </button>

          <button
            className=""
            type="button"
            onClick={() => fetchNextPage()}
            disabled={hasNextPage || isFetchingNextPage}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

ManageAuthorsPage.auth = {
  admin: true,
};

export default ManageAuthorsPage;
