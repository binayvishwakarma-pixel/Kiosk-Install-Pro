import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { getCurrentUser, setCurrentUser } from './services/storageService';
import { AdminDashboard } from './components/AdminDashboard';
import { ProjectWorkflow } from './components/ProjectWorkflow';
import { LayoutDashboard, Smartphone, LogOut, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth session
    const storedUser = getCurrentUser();
    if (storedUser) setUser(storedUser);
    setLoading(false);
  }, []);

  const handleLogin = (role: UserRole) => {
    // Mock Google Login Response
    const mockUser: User = {
      id: role === UserRole.ADMIN ? 'admin_001' : 'field_001',
      name: role === UserRole.ADMIN ? 'Admin User' : 'Field Technician',
      email: role === UserRole.ADMIN ? 'admin@kioskpro.com' : 'tech@kioskpro.com',
      role: role,
      avatarUrl: `https://ui-avatars.com/api/?name=${role === UserRole.ADMIN ? 'Admin' : 'Tech'}&background=random`
    };
    setCurrentUser(mockUser);
    setUser(mockUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUser(null);
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  // --- Auth Screen ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">KioskInstall Pro</h1>
          <p className="text-gray-500 mb-8">Manage kiosk deployments efficiently.</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => handleLogin(UserRole.FIELD_USER)}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google" />
              Sign in as Field User
            </button>
             <button 
              onClick={() => handleLogin(UserRole.ADMIN)}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white hover:bg-gray-800 font-semibold py-3 px-4 rounded-lg transition-all"
            >
              <LayoutDashboard size={20} />
              Sign in as Admin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main App Layout ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">K</div>
            <span className="font-bold text-xl text-gray-900 hidden sm:block">KioskInstall Pro</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
                <img src={user.avatarUrl} alt="avatar" className="w-8 h-8 rounded-full border border-gray-200" />
                <div className="text-sm hidden sm:block">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ').toLowerCase()}</p>
                </div>
            </div>
            <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
                <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user.role === UserRole.ADMIN ? (
            <AdminDashboard />
        ) : (
            <ProjectWorkflow user={user} onComplete={() => window.location.reload()} />
        )}
      </main>
    </div>
  );
};

export default App;