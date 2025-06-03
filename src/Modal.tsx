import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 transition-opacity duration-300 ease-in-out">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col"> {/* Added max-h and flex structure */}
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 text-3xl font-light leading-none p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="overflow-y-auto"> {/* Made content area scrollable */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
