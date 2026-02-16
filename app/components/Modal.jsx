
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-3xl max-h-[85vh] flex flex-col bg-[#0f0f16] border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0f0f16]/95 backdrop-blur rounded-t-2xl">
                    <h2 className="text-2xl font-bold text-white font-poppins tracking-wide">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all duration-200"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 text-white/80 font-poppins text-sm leading-relaxed space-y-4 custom-scrollbar">
                    {children}
                </div>

                {/* Footer (optional, mainly for spacing/visual anchor) */}
                <div className="p-4 border-t border-white/5 bg-[#0f0f16]/95 backdrop-blur rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
