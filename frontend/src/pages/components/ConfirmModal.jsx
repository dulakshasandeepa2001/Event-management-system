import React from "react";

const ConfirmModal = ({ show, message, onConfirm, onCancel }) => {

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 border-4 border-gray-800 rounded-xl shadow-xl w-80">
                <p className="text-lg font-semibold text-red-900 text-center mb-4">
                    {message}
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={onConfirm} className="bg-red-600 text-white px-6 py-2 rounded-lg border-2 hover:border-red-900">
                        Yes
                    </button>
                    <button onClick={onCancel} className="bg-gray-300 px-6 py-2 rounded-lg border-2 hover:border-gray-600">
                        No
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;