import React, { useState, useEffect } from 'react';
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

const Sidebar = ({ isOpen }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(false);

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

    // Don't render sidebar on mobile when closed
    if (isMobile && !isOpen) return null;

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => window.dispatchEvent(new Event('closeSidebar'))}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg z-40
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-20'}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
            >
                {/* User Profile Section */}
                <div className={`p-2 border-b border-gray-100 ${!isOpen ? 'px-2' : ''}`}>
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

                {/* Navigation Menu */}
                <nav className="flex-1 py-4 overflow-y-auto h-[calc(100%-80px)]">
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

                {/* Logout Button */}
                <div className={`p-4 border-t border-gray-100 absolute bottom-0 left-0 right-0 bg-white ${!isOpen ? 'px-2' : ''}`}>
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
            </aside>
        </>
    );
};

export default Sidebar;