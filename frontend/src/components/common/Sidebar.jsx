import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    Store,
    Package,
    ShoppingBag,
    TrendingUp,
    Users,
    Settings,
    UserCheck,
    LogOut,
    ShoppingCart,
    User, 
    HomeIcon
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);
    const sidebarOffsetStyle = {
        top: 'calc(var(--dashboard-header-height) - 1px)',
    };

    useEffect(() => {
        const checkScreen = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkScreen();
        window.addEventListener('resize', checkScreen);
        return () => window.removeEventListener('resize', checkScreen);
    }, []);

    const getMenuItems = () => {
        if (!user) return [];

        switch (user.role) {
            case 'admin':
                return [
                    { id: 'overview', name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
                    { id: 'vendors', name: 'Pending Vendors', path: '/admin/pending-vendors', icon: UserCheck },
                    { id: 'users', name: 'User Management', path: '/admin/users', icon: Users },
                    { id: 'products', name: 'Products', path: '/admin/products', icon: Package },
                    { id: 'categories', name: 'Categories', path: '/admin/categories', icon: Settings },
                    { id: 'orders', name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
                    { id: 'settings', name: 'Settings', path: '/admin/settings', icon: Settings },
                ];

            case 'vendor':
                return [
                    { id: 'overview', name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
                    { id: 'shop', name: 'My Shop', path: '/vendor/shop', icon: Store },
                    { id: 'products', name: 'Products', path: '/vendor/products', icon: Package },
                    { id: 'orders', name: 'Orders', path: '/vendor/orders', icon: ShoppingBag },
                    { id: 'revenue', name: 'Revenue', path: '/vendor/revenue', icon: TrendingUp },
                ];

            case 'customer':
                return [
                    { id: 'searchProducts', name: 'Search Products', path: '/', icon: HomeIcon },
                    { id: 'overview', name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
                    { id: 'orders', name: 'My Orders', path: '/customer/orders', icon: ShoppingBag },
                    { id: 'profile', name: 'Profile', path: '/customer/profile', icon: User },
                ];

            default:
                return [];
        }
    };

    const menuItems = getMenuItems();

    const handleNavigation = (path) => {
        navigate(path);
        if (isMobile && onClose) {
            onClose();
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        const currentPath = location.pathname;
        const itemPath = path.split('?')[0];
        return currentPath === itemPath;
    };

    if (!user || menuItems.length === 0) return null;

    const sidebarContent = (
        <>
            <div className={`p-2 border-b border-gray-100 flex-shrink-0 ${!isOpen ? 'px-2' : ''}`}>
                <div className={`flex items-center ${!isOpen ? 'justify-center' : 'gap-3'}`}>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-lg">
                            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
                        </span>
                    </div>
                    {isOpen && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName}</p>
                            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                        </div>
                    )}
                </div>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto">
                <ul className="space-y-1 px-3">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => handleNavigation(item.path)}
                                    className={`
                      w-full flex items-center gap-3 rounded-lg transition-all duration-200
                      ${active
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
                                        }
                      ${!isOpen ? 'justify-center py-3 px-0' : 'px-3 py-2.5'}
                    `}
                                    title={!isOpen ? item.name : ''}
                                >
                                    <Icon size={20} className="flex-shrink-0" />
                                    {isOpen && <span className="text-sm font-medium">{item.name}</span>}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className={`p-4 border-t border-gray-100 bg-white flex-shrink-0 ${!isOpen ? 'px-2' : ''}`}>
                <button
                    onClick={handleLogout}
                    className={`
              w-full flex items-center gap-3 rounded-lg transition-all duration-200
              text-red-600 hover:bg-red-50 hover:text-red-700
              ${!isOpen ? 'justify-center py-3 px-0' : 'px-3 py-2.5'}
            `}
                    title={!isOpen ? 'Logout' : ''}
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {isOpen && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </>
    );

    return (
        <>
            <AnimatePresence initial={false}>
                {isMobile && isOpen && (
                    <motion.div
                        key="sidebar-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 z-40 md:hidden"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {isMobile ? (
                <AnimatePresence initial={false} mode="sync">
                    {isOpen && (
                        <motion.aside
                            key="mobile-sidebar"
                            initial={{ x: '-100%', opacity: 0.98 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '-100%', opacity: 0.98 }}
                            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                            className="fixed left-0 bottom-0 z-40 w-full bg-white shadow-lg overflow-hidden flex flex-col will-change-transform transform-gpu"
                            style={sidebarOffsetStyle}
                        >
                            {sidebarContent}
                        </motion.aside>
                    )}
                </AnimatePresence>
            ) : (
                <motion.aside
                    initial={false}
                    animate={{ width: isOpen ? '16rem' : '5rem' }}
                    transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
                    className="fixed left-0 bottom-0 z-40 bg-white shadow-lg overflow-hidden flex flex-col will-change-[width]"
                    style={sidebarOffsetStyle}
                    layout
                >
                    {sidebarContent}
                </motion.aside>
            )}
        </>
    );
};

export default Sidebar;