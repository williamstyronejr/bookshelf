import { prisma } from '../../utils/db';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  if (!ctx.params || !ctx.params.slug)
    return {
      notFound: true,
    };

  const book = await prisma.book.findFirst({ where: { title: '' } });

  if (!book)
    return {
      notFound: true,
    };

  return {
    props: { book },
  };
};

export default function BookPage() {
  return <section className=""></section>;
}
