import type { NextPage } from 'next';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Head from 'next/head';
import useDeleteAuthor from '../../../hooks/api/DeleteAuthor';
import Section from '../../../components/ui/Section';
import RefetchError from '../../../components/RefetchError';
import LoadingWheel from '../../../components/LoadingWheel';
import Modal from '../../../components/Modal';

const AuthorItem = ({ author }: { author: any }) => {
  const [modal, setModal] = useState(false);
  const queryClient = useQueryClient();

  const { mutate } = useDeleteAuthor({
    onSuccess: (data: any) => {
      setModal(false);
      if (data.success) {
        queryClient.invalidateQueries(['author-manage']);
      }
    },
    onError: () => {
      setModal(false);
    },
  });

  return (
    <li className="flex flex-row flex-nowrap w-full p-2 py-6 rounded">
      {modal ? (
        <Modal
          onSuccess={() => mutate({ id: author.id })}
          onClose={() => setModal(false)}
        >
          Are you sure you want to delete Author:
          <span className="block text-center pt-3">{author.name}</span>
        </Modal>
      ) : null}

      <div className="flex flex-col flex-nowrap flex-grow mr-4">
        <div className="mb-2">{author.name}</div>
        {author.books.length === 0 ? (
          <div className="hidden md:block text-center">Author Has no books</div>
        ) : (
          <ul className="hidden md:flex flex-row flex-nowrap h-32">
            {author.books.map((book: any) => (
              <li
                key={`author-book-${book.id}`}
                className="relative h-full w-20 mr-4"
                title={book.title}
              >
                <Image
                  className="rounded-lg"
                  priority={true}
                  fill={true}
                  src={book.displayImage}
                  alt="Book covers"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col flex-nowrap justify-around shrink-0">
        <Link
          className="block bg-custom-btn-submit text-center text-white px-4 py-2 rounded-lg"
          href={`/admin/author/${author.id}/edit`}
        >
          Edit
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
    <Section>
      <Head>
        <title>Manage Authors</title>
      </Head>

      <header>
        <h3 className="my-4 font-semibold text-xl">Manage Authors</h3>
      </header>

      {error ? <RefetchError refetch={refetch} /> : null}

      <ul
        data-cy="author-manage-list"
        className="flex flex-col flex-nowrap divide-y-2"
      >
        {data
          ? data.results.map((author: any) => (
              <AuthorItem author={author} key={`author-${author.id}`} />
            ))
          : null}
      </ul>

      {isLoading || isFetching ? <LoadingWheel /> : null}
      {data && data.results.length === 0 ? (
        <div className="text-center py-20 font-medium">No authors found</div>
      ) : null}
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
    </Section>
  );
};

ManageAuthorsPage.auth = {
  admin: true,
};

export default ManageAuthorsPage;
