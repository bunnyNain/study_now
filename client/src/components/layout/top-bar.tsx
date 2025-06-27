import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, Bell, Plus } from "lucide-react";

interface TopBarProps {
  onToggleSidebar: () => void;
  onAddStudent: () => void;
}

export default function TopBar({ onToggleSidebar, onAddStudent }: TopBarProps) {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={onToggleSidebar}
          >
            <Menu size={20} />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Welcome back, manage your students efficiently</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <Input
              type="text"
              placeholder="Search students..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          </div>
          
          <Button
            onClick={onAddStudent}
            className="bg-primary-600 text-white hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-colors hidden sm:flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Student</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-3 h-3 bg-error-500 rounded-full"></span>
          </Button>
          
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user ? getInitials(user.name) : 'AD'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
