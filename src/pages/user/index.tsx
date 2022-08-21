import type { NextPage } from 'next';

const ProfilePage: NextPage = () => {
  return (
    <section className="">
      <div>
        <div>Current Books</div>
      </div>
    </section>
  );
};

ProfilePage.auth = {
  admin: false,
};

export default ProfilePage;
