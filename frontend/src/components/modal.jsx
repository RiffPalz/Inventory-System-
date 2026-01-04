import React from "react";
import { X, AlertCircle } from "lucide-react";

/**
 * ConfirmModal: For Delete/Save confirmations
 */
export function ConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  variant = "blue",
}) {
  const isRed = variant === "red";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
      bg-slate-900/40 backdrop-blur-xl backdrop-saturate-150
      animate-in fade-in duration-200"
    >
      <div
        className="bg-white rounded-[20px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)]
        w-full max-w-md overflow-hidden animate-in zoom-in duration-200"
      >
        <div className="p-10 text-center">
          <div
            className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 
            ${isRed ? "bg-red-50 text-red-500" : "bg-blue-50 text-blue-600"}`}
          >
            <AlertCircle size={40} />
          </div>

          <h3 className="text-2xl font-black text-gray-800 mb-3">{title}</h3>
          <p className="text-sm font-medium text-gray-400 leading-relaxed px-4">
            {message}
          </p>
        </div>

        <div className="flex border-t border-gray-100 p-2 gap-2 bg-gray-50/50">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-4 rounded-2xl text-sm font-black text-white
              transition-all active:scale-95 shadow-lg
              ${
                isRed
                  ? "bg-red-500 hover:bg-red-600 shadow-red-100"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
              }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * ModalWrapper: A reusable container for large forms (like ProductModal)
 */
export function ModalWrapper({ children, title, subtitle, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
      bg-slate-900/40 backdrop-blur-xl backdrop-saturate-150"
    >
      {/* Modal container handles scrolling, NOT the backdrop */}
      <div
        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl
        max-h-[90vh] overflow-hidden animate-in zoom-in duration-200"
      >
        <div className="px-10 py-8 border-b border-gray-50 flex justify-between items-center bg-[#fcfdfe]">
          <div>
            <h3 className="text-2xl font-black text-gray-800">{title}</h3>
            {subtitle && (
              <p className="text-xs font-bold text-red-500 uppercase tracking-tighter">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Scroll ONLY content */}
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
