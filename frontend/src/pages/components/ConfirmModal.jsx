import React from "react";

const ConfirmModal = ({ show, message, onConfirm, onCancel }) => {

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 border-2 border-gray-800 rounded-xl shadow-xl w-80">
                <p className="text-lg  text-red-900 text-center mb-4">
                    {message}
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={onConfirm} className="bg-red-600 text-white px-10 py-1 rounded-lg border-2 border-red-900 hover:border-gray-900">
                        Yes
                    </button>
                    <button onClick={onCancel} className="bg-gray-300 px-10 py-0 rounded-lg border-2 border-gray-600 hover:border-gray-900">
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;