import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Users, 
  MapPin, 
  Calendar, 
  Upload, 
  LogOut, 
  Menu, 
  X,
  User,
  Trophy,
  CheckCircle,
  ChevronDown,
  Settings
} from 'lucide-react';

const Navigation = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const adminMenuItems = [
    { name: 'Dashboard', icon: Home, path: '/admin' },
  ];

  const adminManagementItems = [
    { name: 'Players', icon: Users, path: '/admin/players' },
    { name: 'Venues', icon: MapPin, path: '/admin/venues' },
    { name: 'Bookings', icon: Calendar, path: '/admin/bookings' },
    { name: 'Payments', icon: Upload, path: '/admin/payments' },
  ];

  const adminAdvancedItems = [
    { name: 'Availability', icon: CheckCircle, path: '/admin/availability' },
    { name: 'Leagues', icon: Trophy, path: '/admin/leagues' },
  ];

  const playerMenuItems = [
    { name: 'Profile', icon: User, path: '/player/profile' },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : playerMenuItems;

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminDropdownOpen && !event.target.closest('.admin-dropdown')) {
        setAdminDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [adminDropdownOpen]);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🏸</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">
              Badminton Tracker
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* Admin Dropdown */}
            {userRole === 'admin' && (
              <div className="relative admin-dropdown">
                <button
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <Settings size={20} />
                  <span>Management</span>
                  <ChevronDown size={16} className={`transition-transform ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {adminDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Basic Management
                      </div>
                      {adminManagementItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <item.icon size={18} />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 my-2"></div>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Advanced Features
                      </div>
                      {adminAdvancedItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                          onClick={() => setAdminDropdownOpen(false)}
                        >
                          <item.icon size={18} />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Link
              to="/leaderboard"
              className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Trophy size={20} />
              <span>🏅 Leaderboard</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="hidden lg:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <User size={20} />
              <span className="max-w-32 truncate">{currentUser?.name || currentUser?.email}</span>
              <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                {userRole}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              ))}
              
                             {/* Admin Mobile Menu Items */}
               {userRole === 'admin' && (
                 <>
                   <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                     Basic Management
                   </div>
                   {adminManagementItems.map((item) => (
                     <Link
                       key={item.name}
                       to={item.path}
                       className="flex items-center space-x-3 px-8 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                       onClick={() => setIsMenuOpen(false)}
                     >
                       <item.icon size={18} />
                       <span>{item.name}</span>
                     </Link>
                   ))}
                   <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                     Advanced Features
                   </div>
                   {adminAdvancedItems.map((item) => (
                     <Link
                       key={item.name}
                       to={item.path}
                       className="flex items-center space-x-3 px-8 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                       onClick={() => setIsMenuOpen(false)}
                     >
                       <item.icon size={18} />
                       <span>{item.name}</span>
                     </Link>
                   ))}
                 </>
               )}
               
               {/* Player Mobile Menu Items */}
               {userRole === 'player' && (
                 <>
                   <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                     Player Menu
                   </div>
                   {playerMenuItems.map((item) => (
                     <Link
                       key={item.name}
                       to={item.path}
                       className="flex items-center space-x-3 px-8 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                       onClick={() => setIsMenuOpen(false)}
                     >
                       <item.icon size={18} />
                       <span>{item.name}</span>
                     </Link>
                   ))}
                 </>
               )}
              
              <Link
                to="/leaderboard"
                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <Trophy size={20} />
                <span>🏅 Leaderboard</span>
              </Link>
              
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-4 py-2 text-sm text-gray-500">
                  <div className="truncate">{currentUser?.name || currentUser?.email}</div>
                  <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                    {userRole}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded-md w-full"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation; 