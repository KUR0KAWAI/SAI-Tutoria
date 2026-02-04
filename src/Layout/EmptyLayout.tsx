import type { ReactNode } from 'react';
import './EmptyLayout.css';

interface EmptyLayoutProps {
    children: ReactNode;
}

const EmptyLayout = ({ children }: EmptyLayoutProps) => {
    return (
        <div className="empty-layout">
            {children}
        </div>
    );
};

export default EmptyLayout;
