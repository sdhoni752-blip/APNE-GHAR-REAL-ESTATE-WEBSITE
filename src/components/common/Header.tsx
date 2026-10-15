import React, { useState } from 'react';
import { useRealEstate } from '../../context/RealEstateContext';
import { UserRole } from '../../types';
import {
  Building2,
  Users,
  ShieldCheck,
  Home,
  RotateCcw,
  MessageSquare,
  Check,
  LogIn,
  LogOut,
  ChevronDown,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openMessages: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, openMessages }) => {
  const {
    currentUser,
    users,
    setCurrentUserById,
    switchRole,
    resetAllData,
    messages,
    isAuthenticated,
    setIsAuthModalOpen,
    setAuthMode,
    logout
  } = useRealEstate();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Unread messages count for current user
  const unreadCount = messages.filter(m => m.receiverId === currentUser.id).length;

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'System Admin';
      case 'manager':
        return 'Property Manager';
      case 'tenant':
        return 'Tenant / Renter';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Indian Demo Guide & Authentication Switcher Strip */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-orange-400">APNA GHAR (भारत):</span>
          {isAuthenticated ? (
            <span>
              Signed in as <strong className="text-white capitalize">{currentUser.role}</strong> ({currentUser.name} · {currentUser.city || 'India'})
            </span>
          ) : (
            <span className="text-amber-300">
              Guest Visitor Mode · Sign in for Admin, Manager or Tenant access
            </span>
          )}
          <span className="text-slate-500">·</span>
          <span className="hidden md:inline text-slate-400">Amounts in Indian Rupees (₹)</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1 text-orange-300 hover:text-white transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="font-medium">Switch / Auth</span>
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={logout}
                className="flex items-center gap-1 text-rose-300 hover:text-rose-100 transition-colors cursor-pointer"
                title="Log out from current session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="flex items-center gap-1 text-orange-400 hover:text-orange-200 font-semibold transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Authenticate</span>
            </button>
          )}
          <span className="text-slate-700">|</span>
          <button
            onClick={resetAllData}
            title="Reset to fresh Indian seed database"
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Indian Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Top Bar adhering to the 3-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand title, one line */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wide text-slate-900 uppercase whitespace-nowrap">
              APNA GHAR
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links based on active role */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
          {currentUser.role === 'manager' && (
            <>
              <button
                onClick={() => setActiveTab('properties')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'properties' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Property Listings
              </button>
              <button
                onClick={() => setActiveTab('leases')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'leases' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Rental Agreements
              </button>
              <button
                onClick={() => setActiveTab('communication')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'communication' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Tenant Communication
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'applications' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Application Status
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'analytics' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Listing Analytics
              </button>
            </>
          )}

          {currentUser.role === 'tenant' && (
            <>
              <button
                onClick={() => setActiveTab('browse')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'browse' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Property Search
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'applications' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Application Management
              </button>
              <button
                onClick={() => setActiveTab('mylease')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'mylease' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Agreement Management
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'profile' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Profile Overview
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'notifications' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Notifications
              </button>
            </>
          )}

          {currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('users')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'users' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                User Management
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'properties' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Property Listings
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'settings' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                System Settings
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'activity' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Activity Monitoring
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-900 cursor-pointer ${
                  activeTab === 'reports' ? 'text-orange-600 font-semibold' : ''
                }`}
              >
                Performance Reports
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Account Profile & Auth Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Messages Button */}
          {isAuthenticated && (
            <button
              onClick={openMessages}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Open Communications"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-600 rounded-full" />
              )}
            </button>
          )}

          {/* User selector dropdown / Auth button */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="flex items-center gap-2.5 p-1.5 pr-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800 transition-colors cursor-pointer text-left"
              >
                <div className="w-8 h-8 rounded-md bg-orange-600 text-white font-semibold text-xs flex items-center justify-center">
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:block text-xs leading-tight">
                  <div className="font-semibold text-slate-900 truncate max-w-[130px]">{currentUser.name}</div>
                  <div className="text-slate-500 font-normal">{getRoleBadge(currentUser.role)}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleDropdown && (
                <div
                  className="absolute right-0 mt-2 w-76 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/60">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Authenticated Profile
                    </div>
                    <div className="text-xs text-slate-900 font-bold mt-0.5">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {currentUser.email} · {currentUser.phone}
                    </div>
                  </div>

                  <div className="py-1">
                    <div className="px-3.5 py-1 text-[11px] text-slate-400 uppercase font-medium">Switch Indian Account</div>
                    {users.map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setCurrentUserById(user.id);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-xs hover:bg-slate-50 transition-colors cursor-pointer ${
                          currentUser.id === user.id ? 'bg-orange-50/70 text-orange-950 font-medium' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'manager' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {user.avatar}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{user.name}</div>
                            <div className="text-[11px] text-slate-500 capitalize">
                              {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Property Manager' : 'Tenant'} {user.city ? `· ${user.city}` : ''}
                            </div>
                          </div>
                        </div>
                        {currentUser.id === user.id && (
                          <Check className="w-4 h-4 text-orange-600" />
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-slate-100 pt-1 mt-1 px-3 py-2 space-y-2">
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        setAuthMode('login');
                        setIsAuthModalOpen(true);
                      }}
                      className="w-full py-1.5 text-center text-xs font-medium text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Open Full Auth Dialog</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        logout();
                      }}
                      className="w-full py-1.5 text-center text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out from Account</span>
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                      <span>Quick Role:</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => { switchRole('manager'); setShowRoleDropdown(false); }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer font-medium"
                          title="Dhoni Kumar Singh / Vikram Kumar"
                        >
                          Manager
                        </button>
                        <button
                          onClick={() => { switchRole('tenant'); setShowRoleDropdown(false); }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer font-medium"
                          title="Aarav Patel"
                        >
                          Tenant
                        </button>
                        <button
                          onClick={() => { switchRole('admin'); setShowRoleDropdown(false); }}
                          className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 cursor-pointer font-medium"
                          title="Rajat Yadav"
                        >
                          Admin
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
