import React, { useEffect, useState } from 'react';
import { X, BookOpen } from 'lucide-react';

interface ReviewNotificationProps {
    count: number;
    onClose: () => void;
    onClick: () => void;
}

export const ReviewNotification: React.FC<ReviewNotificationProps> = ({ count, onClose, onClick }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`
                bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 md:p-2 pr-10 md:pr-8 relative
                transform transition-all duration-300 ease-out cursor-pointer
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                hover:shadow-xl hover:scale-105 min-h-[60px] md:min-h-auto
            `}
            onClick={onClick}
        >
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 min-w-[44px] min-h-[44px] md:min-w-auto md:min-h-auto md:p-0"
            >
                <X size={20} className="md:w-4 md:h-4" />
            </button>
            
            <div className="flex items-center space-x-3 md:space-x-2">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 md:p-1 rounded-full">
                    <BookOpen className="w-5 h-5 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h4 className="font-medium text-base md:text-sm text-gray-900 dark:text-gray-100">
                        Review Time!
                    </h4>
                    <p className="text-sm md:text-xs text-gray-600 dark:text-gray-400">
                        You have {count} {count === 1 ? 'note' : 'notes'} to review
                    </p>
                </div>
            </div>
        </div>
    );
};