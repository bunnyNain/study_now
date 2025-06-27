import { useAuth } from "@/hooks/use-auth";
import { GraduationCap, BarChart3, Users, Book, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isActive = (path: string) => {
    if (path === '/' || path === '/dashboard') {
      return location === '/' || location === '/dashboard';
    }
    return location === path;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex items-center justify-center h-16 bg-primary-600">
          <div className="flex items-center space-x-3">
            <GraduationCap className="text-white text-xl" size={24} />
            <span className="text-white font-semibold text-lg">Study Now</span>
          </div>
        </div>
        
        <nav className="mt-8">
          <div className="px-4 space-y-2">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                className={`w-full justify-start space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700'
                }`}
                onClick={() => onClose()}
              >
                <BarChart3 size={20} />
                <span>Dashboard</span>
              </Button>
            </Link>
            
            <Link href="/students">
              <Button
                variant="ghost"
                className={`w-full justify-start space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors ${
                  isActive('/students') 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-gray-700'
                }`}
                onClick={() => onClose()}
              >
                <Users size={20} />
                <span>Students</span>
              </Button>
            </Link>
            
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              <Book size={20} />
              <span>Courses</span>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              <BarChart3 size={20} />
              <span>Reports</span>
            </Button>
            
            <Button
              variant="ghost"
              className="w-full justify-start space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors opacity-50 cursor-not-allowed"
              disabled
            >
              <Settings size={20} />
              <span>Settings</span>
            </Button>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user ? getInitials(user.name) : 'AD'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || 'Administrator'}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-gray-600 p-1"
                onClick={logout}
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </nav>
      </div>
    </>
  );
}
