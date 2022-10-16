import type { NextPage } from 'next';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';
import Modal from '../../../components/Modal';
import { useRouter } from 'next/router';
import RefetchError from '../../../components/RefetchError';
import LoadingWheel from '../../../components/LoadingWheel';

const AuthorItem = ({ author, push }: { author: any; push: Function }) => {
  const [modal, setModal] = useState(false);
  const queryClient = useQueryClient();

  const { mutate } = useMutation(
    ['remove-author'],
    async () => {
      const res = await fetch(`/api/author/${author.id}`, {
        method: 'POST',
      });

      if (res.ok) return await res.json();
      if (res.status === 403) return push('/');
      if (res.status === 401) return push('/api/auth/signin');

      throw new Error('An unexpected error occurred, please try again.');
    },
    {
      onSuccess: (data) => {
        setModal(false);
        if (data.success) {
          queryClient.invalidateQueries(['author-manage']);
        }
      },
      onError: () => {
        setModal(false);
      },
    }
  );

  return (
    <li className="flex flex-row flex-nowrap w-full border-slate-200 border-2 rounded p-2 mb-4">
      {modal ? (
        <Modal onSuccess={() => mutate()} onClose={() => setModal(false)}>
          Are you sure you want to delete Author: {author.name}
        </Modal>
      ) : null}

      <div className="mr-4">{author.name}</div>

      <div className="flex-grow">
        <ul className="hidden md:flex flex-row flex-nowrap h-full">
          {author.books.map((book) => (
            <li
              key={`author-book-${book.id}`}
              className="relative h-full w-20"
              title={book.title}
            >
              <Image
                className="rounded-lg"
                priority={true}
                layout="fill"
                src={book.displayImage}
                alt="Book covers"
              />
            </li>
          ))}
        </ul>
      </div>

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
  const router = useRouter();
  const [page, setPage] = useState(0);

  const { data, isFetching, isLoading, error, refetch } = useQuery(
    ['author-manage', page],
    async () => {
      const res = await fetch(`/api/author?page=${page}&limit=10`);

      if (res.ok) return await res.json();
      throw new Error('An unexpected error occurred, please try again.');
    },
    {
      keepPreviousData: true,
    }
  );

  return (
    <section className="">
      <header></header>

      <div>
        {error ? <RefetchError refetch={refetch} /> : null}
        {isLoading ? <LoadingWheel /> : null}

        <ul className="flex flex-col flex-nowrap">
          {data
            ? data.results.map((author) => (
                <AuthorItem
                  push={router.push}
                  author={author}
                  key={`author-${author.id}`}
                />
              ))
            : null}
        </ul>

        <div className="w-full">
          <div className="flex justify-center">
            <button
              className="btn-submit mr-6"
              type="button"
              onClick={() => {
                if (page !== 0) setPage((old) => old - 1);
              }}
              disabled={isFetching || isLoading || page === 0}
            >
              Prev
            </button>

            <button
              className="btn-submit"
              type="button"
              onClick={() => {
                if (!data || data.nextPage) setPage((old) => old + 1);
              }}
              disabled={isFetching || isLoading || data?.nextPage === null}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

ManageAuthorsPage.auth = {
  admin: true,
};

export default ManageAuthorsPage;
