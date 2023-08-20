import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { NextPage } from 'next/types';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import useInfiniteScroll from 'react-infinite-scroll-hook';
import { useInfiniteQuery } from '@tanstack/react-query';
import useDeleteAuthor from '../../../hooks/api/DeleteAuthor';
import AdminMenu from '../../../components/AdminMenu';
import RefetchError from '../../../components/RefetchError';
import Section from '../../../components/ui/Section';
import Modal from '../../../components/Modal';
import { prisma } from '../../../utils/db';
import LoadingWheel from '../../../components/LoadingWheel';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const {
      query: { slug, id },
    } = ctx;

    if (!slug || !id) return { notFound: true };

    const authorData = await prisma.author.findUnique({
      where: { id: parseInt(id.toString()) },
      select: {
        name: true,
        slug: true,
        id: true,
        bio: true,
        profileImage: true,
      },
    });

    if (!authorData) {
      return {
        notFound: true,
      };
    }

    if (authorData.slug !== slug) {
      return {
        redirect: {
          destination: `/author/${id}/${authorData.slug}`,
          permanent: false,
        },
      };
    }

    return {
      props: {
        authorData,
      },
    };
  } catch (err) {
    return { notFound: true };
  }
};

const AuthorPage: NextPage<{ authorData: any }> = ({ authorData }) => {
  const [deleteModal, setDeleteModal] = useState(false);
  const router = useRouter();

  const {
    data,
    error,
    isLoading,
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery(
    ['author'],
    async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/api/author/${router.query.id}/books?page=${pageParam}&limit=10`
      );
      if (res.statusText !== 'OK') {
        throw new Error('Invalid request');
      }

      if (res.ok) return await res.json();
      throw new Error('An unexpected error occurred, please try again.');
    },
    {
      getNextPageParam: (lastPage) =>
        lastPage.nextPage ? lastPage.nextPage : undefined,
      keepPreviousData: true,
      enabled: !!router.query.id,
    }
  );

  const { mutate: deleteAuthor } = useDeleteAuthor({
    onSuccess: (data: any) => {
      if (data.success) router.push('/');
    },
  });

  const [sentryRef] = useInfiniteScroll({
    loading: isFetchingNextPage || isFetching,
    hasNextPage: !!hasNextPage,
    onLoadMore: fetchNextPage,
    disabled: !!error,
    rootMargin: '0px 0px 200px 0px',
  });

  return (
    <Section>
      <Head>
        <title>{authorData.name}</title>
      </Head>
      {deleteModal ? (
        <Modal
          onSuccess={() => deleteAuthor({ id: authorData.id })}
          onClose={() => setDeleteModal(false)}
        >
          Are you sure you want to delete Author:
          <span className="block text-center pt-3">{authorData.name}</span>
        </Modal>
      ) : null}

      <header className="flex flex-row flex-nowrap w-full pt-10 pb-20 px-4 justify-between">
        <h3 className="text-2xl font-bold">{authorData.name}</h3>

        <AdminMenu>
          <Link
            className="block w-full text-left px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-gray-400/30"
            href={`/admin/author/${authorData.id}/edit`}
          >
            Edit Author
          </Link>

          <button
            type="button"
            className="block w-full text-left text-red-500 px-2 py-2 hover:bg-custom-bg-off-light dark:hover:bg-gray-400/30"
            onClick={() => setDeleteModal(true)}
          >
            Delete Author
          </button>
        </AdminMenu>
      </header>

      <div className="flex flex-col md:flex-row flex-nowrap px-4 items-center md:items-start">
        <aside className="w-44 shrink-0 grow-0 md:mr-10 text-center md:text-left">
          <div className="relative w-32 h-32 mx-auto">
            <Image
              className="rounded-full"
              priority={true}
              fill={true}
              src={authorData.profileImage || ''}
              alt="User Profile"
            />
          </div>

          <div className="">
            <h4 className="font-semibold text-sm py-4">
              About {authorData.name}
            </h4>

            <p className="pt-2 pb-8 w-full whitespace-pre-line">
              {authorData.bio || 'This author has no biography'}
            </p>
          </div>
        </aside>

        <div className="flex-grow">
          <h4 className="font-medium mb-2">Titles by {authorData.name}</h4>

          <hr />

          {isLoading ? (
            <LoadingWheel className="text-center text-4xl mt-10" />
          ) : null}

          <ul className="flex flex-col flex-nowrap">
            {data &&
              data.pages.map((page) =>
                page.results.map((book: any) => (
                  <li
                    key={book.id}
                    className="flex flex-col flex-nowrap md:flex-row flex-grow w-full py-8 my-8 border-b-2"
                  >
                    <div className="relative w-44 h-56 shrink-0 mx-auto mb-8 transition-transform hover:scale-110">
                      <Link
                        href={`/book/${book.id}/${book.author.slug}`}
                        className="scale-110"
                      >
                        <Image
                          className="rounded-lg"
                          priority={true}
                          fill={true}
                          src={book.displayImage}
                          alt="Book covers"
                        />
                      </Link>
                    </div>

                    <div className="flex-grow md:ml-4">
                      <Link
                        className="font-medium hover:text-custom-text-link-hover-light"
                        href={`/book/${book.id}/${book.slug}`}
                      >
                        {book.title}
                      </Link>

                      <Link
                        className="block text-gray-600 hover:text-custom-text-link-hover-light"
                        href={`/author/${book.author.id}/${book.author.slug}`}
                      >
                        {book.author.name}
                      </Link>
                    </div>

                    <div className="shrink-0 py-5 md:p-0">
                      <Link
                        className="block w-full text-center md:inline py-4 px-2 rounded-lg transition-colors text-white bg-custom-btn-submit hover:bg-custom-btn-submit-hover"
                        href={`/book/${book.id}/${book.slug}/reserve`}
                      >
                        Reserve
                      </Link>
                    </div>
                  </li>
                ))
              )}

            {router.query.id && hasNextPage ? (
              <li ref={sentryRef}>Loading</li>
            ) : null}
          </ul>

          {error ? (
            <div className="">
              <RefetchError refetch={refetch} />
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  );
};

export default AuthorPage;
