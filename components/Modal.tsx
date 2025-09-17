
import React, { ReactNode, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  hideHeader?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, hideHeader = false }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (
          <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            {title ? (
                <h2 id="modal-title" className="text-xl font-bold text-green-800 dark:text-green-300">{title}</h2>
            ) : <div />}
            <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-2xl" aria-label="Close">
              &times;
            </button>
          </header>
        )}
        <main className={`overflow-y-auto ${hideHeader ? '' : 'p-6'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Modal;