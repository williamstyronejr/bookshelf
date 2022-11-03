import { NextPage } from 'next/types';
import Head from 'next/head';

const NoPermissionPage: NextPage = () => {
  return (
    <section className="flex flex-col flex-nowrap w-full justify-center mt-20">
      <Head>
        <title>Permissions required</title>
      </Head>
      <i className="block far fa-times-circle text-8xl text-center" />
      <div className="text-center text-xl mt-4">
        You do not have permission for this page.
      </div>
    </section>
  );
};

export default NoPermissionPage;
