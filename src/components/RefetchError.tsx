import { FC } from 'react';

const RefetchError: FC<{ refetch: Function }> = ({ refetch }) => {
  return (
    <div className="w-full text-center py-2">
      <div className="text-8xl text-blue-600">
        <i className="fas fa-exclamation-circle" />
      </div>

      <div className="my-2">An error occurred during request.</div>
      <button
        className="mt-4 py-2 px-5 rounded-md text-white bg-blue-500"
        type="button"
        onClick={() => refetch()}
      >
        Retry
      </button>
    </div>
  );
};

export default RefetchError;
