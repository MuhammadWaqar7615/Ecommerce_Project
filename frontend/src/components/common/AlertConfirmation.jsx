import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Check, Shield, Trash2, UserX, UserCheck, LogIn } from 'lucide-react';

const AlertConfirmation = ({ isOpen, onClose, onConfirm, title, message, type = 'warning', confirmText = 'Confirm', cancelText = 'Cancel', loading = false }) => {
    
    const getTypeStyles = () => {
        switch(type) {
            case 'danger':
                return {
                    icon: <Trash2 size={24} className="text-red-600" />,
                    iconBg: 'bg-red-100',
                    confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
                    borderColor: 'border-red-200',
                    headerBg: 'bg-red-50/50'
                };
            case 'warning':
                return {
                    icon: <LogIn size={24} className="text-primary" />,
                    iconBg: 'bg-primary/10',
                    confirmBtn: 'bg-primary hover:bg-primary-dark focus:ring-primary',
                    borderColor: 'border-primary/20',
                    headerBg: 'bg-primary/5'
                };
            case 'info':
                return {
                    icon: <Check size={24} className="text-primary" />,
                    iconBg: 'bg-primary/10',
                    confirmBtn: 'bg-primary hover:bg-primary-dark focus:ring-primary',
                    borderColor: 'border-primary/20',
                    headerBg: 'bg-primary/5'
                };
            case 'suspend':
                return {
                    icon: <UserX size={24} className="text-orange-600" />,
                    iconBg: 'bg-orange-100',
                    confirmBtn: 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500',
                    borderColor: 'border-orange-200',
                    headerBg: 'bg-orange-50/50'
                };
            case 'activate':
                return {
                    icon: <UserCheck size={24} className="text-green-600" />,
                    iconBg: 'bg-green-100',
                    confirmBtn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
                    borderColor: 'border-green-200',
                    headerBg: 'bg-green-50/50'
                };
            default:
                return {
                    icon: <AlertTriangle size={24} className="text-primary" />,
                    iconBg: 'bg-primary/10',
                    confirmBtn: 'bg-primary hover:bg-primary-dark focus:ring-primary',
                    borderColor: 'border-primary/20',
                    headerBg: 'bg-primary/5'
                };
        }
    };

    const styles = getTypeStyles();

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.2 } }
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
        exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2 } }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border ${styles.borderColor}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className={`p-6 flex items-center gap-4 border-b ${styles.borderColor} ${styles.headerBg}`}>
                            <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                                {styles.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                                <p className="text-sm text-gray-500 mt-0.5">{message}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-lg transition self-start"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 flex gap-3 justify-end bg-gray-50/50">
                            {cancelText && (
                                <button
                                    onClick={onClose}
                                    disabled={loading}
                                    className="px-5 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition disabled:opacity-50"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={`px-5 py-2 text-sm font-medium text-white rounded-full transition shadow-sm focus:ring-2 focus:ring-offset-2 ${styles.confirmBtn} disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AlertConfirmation;