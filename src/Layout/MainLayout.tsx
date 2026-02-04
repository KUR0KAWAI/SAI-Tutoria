import { type ReactNode } from 'react';
import HeaderNav from './HeaderNav';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useState } from 'react';
import './MainLayout.css';

interface MainLayoutProps {
    children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className={`main-layout ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            <HeaderNav toggleSidebar={toggleSidebar} />
            <div className="layout-body">
                <Sidebar isCollapsed={isCollapsed} />
                <main className="content-area">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
