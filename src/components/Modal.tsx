import React from 'react';

const Modal: React.FC<{
  onSuccess: Function;
  onClose: Function;
  children?: React.ReactNode;
}> = ({ onSuccess, onClose, children }) => {
  return (
    <div className="flex flex-row flex-nowrap w-full h-full absolute top-0 left-0 bg-neutral-900/40 z-50 items-center justify-center">
      <div className="flex-grow max-w-lg p-10 bg-white relative rounded-md">
        <button type="button" onClick={() => onClose()}>
          x
        </button>

        <div>{children}</div>

        <button
          className="bg-custom-btn-submit text-center text-white px-4 py-2 rounded-lg"
          type="button"
          onClick={() => onSuccess()}
        >
          Yes
        </button>

        <button
          className="bg-red-500 text-center text-white px-4 py-2 mt-2 rounded-lg"
          type="button"
          onClick={() => onClose()}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default Modal;
