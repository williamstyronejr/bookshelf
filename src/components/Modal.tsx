import React, { useEffect } from 'react';

const Modal: React.FC<{
  onSuccess: Function;
  onClose: Function;
  children?: React.ReactNode;
}> = ({ onSuccess, onClose, children }) => {
  useEffect(() => {
    const onEsc = (evt: KeyboardEvent) => {
      if (evt.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('keypress', onEsc);
    };
  }, [onClose]);

  return (
    <div className="flex flex-row flex-nowrap w-full h-full fixed top-0 left-0 z-50 items-center justify-center">
      <div
        className="w-full h-full fixed top-0 left-0 bg-neutral-900/40"
        onClick={() => onClose()}
      />

      <div className="relative flex-grow max-w-lg pb-10 px-4 rounded-md bg-white dark:bg-custom-bg-dark">
        <div className="w-full text-right py-5">
          <button
            className="w-12 h-12 text-3xl font-medium rounded-full transition-colors hover:bg-slate-200/60"
            type="button"
            onClick={() => onClose()}
          >
            X
          </button>
        </div>

        <div className="text-center text-lg">{children}</div>

        <div className="text-center mt-4">
          <button
            data-cy="modal-confirm"
            className="text-center text-white px-4 py-2 mr-8 rounded-lg transition-colors bg-custom-btn-submit hover:bg-custom-btn-submit-hover"
            type="button"
            onClick={() => onSuccess()}
          >
            Confirm
          </button>

          <button
            data-cy="modal-cancel"
            className="text-center px-4 py-2 mt-2 rounded-lg transition-colors text-white bg-red-500 hover:bg-red-700"
            type="button"
            onClick={() => onClose()}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
