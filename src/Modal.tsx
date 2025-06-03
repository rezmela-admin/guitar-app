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

  // Basic inline styles for modal functionality
  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, // Ensure modal is on top
  };

  const panelStyle: React.CSSProperties = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh', // Ensure modal content can scroll
    overflowY: 'auto', // Scroll if content overflows
    position: 'relative', // For absolute positioning of close button if needed
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '10px',
    borderBottom: '1px solid #eee',
  };

  const titleStyle: React.CSSProperties = {
    margin: 0, // Remove default margin from h2
    fontSize: '1.25rem', // Tailwind's text-xl
    fontWeight: 'bold', // Tailwind's font-semibold
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '1.8rem', // Larger for easier clicking
    fontWeight: 'normal',
    cursor: 'pointer',
    padding: '5px',
    lineHeight: '1',
  };


  return (
    <div style={overlayStyle}>
      <div style={panelStyle}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{title}</h2>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close modal">
            &times;
          </button>
        </div>
        <div> {/* Content area */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
