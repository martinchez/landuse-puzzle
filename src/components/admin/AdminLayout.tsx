import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  AlertCircle, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { DashboardOverview } from './DashboardOverview';
import { UserManagement } from './UserManagement';

type AdminView = 'dashboard' | 'users' | 'errors' | 'settings';

export const AdminLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', icon: BarChart3, view: 'dashboard' as AdminView },
    { name: 'Users', icon: Users, view: 'users' as AdminView },
    { name: 'Errors', icon: AlertCircle, view: 'errors' as AdminView },
    { name: 'Settings', icon: Settings, view: 'settings' as AdminView },
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'users':
        return <UserManagement />;
      case 'errors':
        return <div className="text-center py-8 text-gray-500">Error Management Component (to be implemented)</div>;
      case 'settings':
        return <div className="text-center py-8 text-gray-500">Settings Component (to be implemented)</div>;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <SidebarContent 
            navigation={navigation} 
            currentView={currentView} 
            setCurrentView={setCurrentView}
            setSidebarOpen={setSidebarOpen}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent 
            navigation={navigation} 
            currentView={currentView} 
            setCurrentView={setCurrentView}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden">
          <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent: React.FC<{
  navigation: Array<{ name: string; icon: any; view: AdminView }>;
  currentView: AdminView;
  setCurrentView: (view: AdminView) => void;
  setSidebarOpen?: (open: boolean) => void;
}> = ({ navigation, currentView, setCurrentView, setSidebarOpen }) => {
  return (
    <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
      </div>
      <div className="mt-5 flex-grow flex flex-col">
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => {
                  setCurrentView(item.view);
                  setSidebarOpen?.(false);
                }}
                className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === item.view
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-3 flex-shrink-0 h-6 w-6 ${
                    currentView === item.view ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </button>
            );
          })}
        </nav>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <LogOut className="inline-block h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                  Logout
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
