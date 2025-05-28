"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaUsers,
  FaUserCog,
  FaChartBar,
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
  FaTachometerAlt,
  FaHistory,
  FaKey,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import Link from "next/link";

const Sidebar = ({ activePage }) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRole");
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminId");
    localStorage.removeItem("isAdminLoggedIn");
    router.push("/AdminLogin");
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.sidebar-container')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activePage]);

  const menuItems = [
    {
      href: "/superadmin/dashboard",
      icon: FaTachometerAlt,
      label: "Dashboard",
      page: "dashboard"
    },
    {
      href: "/superadmin/users",
      icon: FaUserCog,
      label: "User Management",
      page: "users"
    },
    {
      href: "/superadmin/leads",
      icon: FaUsers,
      label: "Lead Management",
      page: "leads"
    },
    {
      href: "/superadmin/analytics",
      icon: FaChartBar,
      label: "Analytics",
      page: "analytics"
    },
    {
      href: "/superadmin/audit-logs",
      icon: FaHistory,
      label: "Audit Logs",
      page: "audit-logs"
    },
    {
      href: "/superadmin/roles",
      icon: FaKey,
      label: "Role Permissions",
      page: "roles"
    },
    {
      href: "/superadmin/settings",
      icon: FaCog,
      label: "Settings",
      page: "settings"
    },
    {
      href: "/dashboard",
      icon: FaClipboardList,
      label: "Go to Dashboard",
      page: ""
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-40 left-4 z-40 p-2 bg-slate-800 text-white rounded-lg shadow-lg hover:bg-slate-700 transition-colors duration-200"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaBars className="text-xl" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          sidebar-container fixed lg:static inset-y-0 left-0 z-[1000]
          transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 transition-transform duration-300 ease-in-out
          bg-gradient-to-b from-slate-800 to-slate-900 text-white 
          w-64 shadow-2xl border-r border-slate-700 flex flex-col
          lg:min-h-screen min-h-full
        `}
      >
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                Super Admin
              </h2>
              <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mt-2"></div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white transition-colors duration-200"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.page;
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                      transition-all duration-200 ease-in-out group
                      ${isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-[1.02]'
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                      }
                    `}
                  >
                    <Icon className={`text-lg transition-transform duration-200 ${
                      isActive ? 'scale-110' : 'group-hover:scale-110'
                    }`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </Link>
                </li>
              );
            })}
            
            {/* Logout Button */}
            <li className="pt-4 mt-4 border-t border-slate-700/50">
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="
                  flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                  w-full text-left transition-all duration-200 ease-in-out group
                  text-slate-300 hover:text-red-300 hover:bg-red-500/10
                  border border-transparent hover:border-red-500/20
                "
              >
                <FaSignOutAlt className="text-lg transition-transform duration-200 group-hover:scale-110" />
                <span className="font-medium">Logout</span>
              </button>
            </li>
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700/50">
          <div className="text-xs text-slate-400 text-center">
            <p className="font-medium">Admin Panel v2.0</p>
            <p className="mt-1">Secure Access</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;