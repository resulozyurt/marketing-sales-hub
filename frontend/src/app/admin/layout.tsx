"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ArrowLeft, 
  LayoutDashboard, 
  Folders, 
  Palette,
  LogOut, 
  ChevronDown,
  ShieldCheck
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  
  // State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const [profileImage, setProfileImage] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname.startsWith(path) && (path !== '/admin' || pathname === '/admin');

  // API'den gerçek kullanıcı verilerini çekme
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await api.get("/auth/me");
        setUsername(res.data.full_name || res.data.username || "User");
        setProfileImage(res.data.profile_image || "");
      } catch (e) { 
        console.error("Failed to fetch user info", e); 
      }
    };
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50" suppressHydrationWarning>
      {/* ADMIN SIDEBAR */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col transition-all duration-300 border-r border-slate-900">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-xl tracking-tight">
          <ShieldCheck className="w-6 h-6 text-indigo-500 mr-2" />
          <span>Admin Console</span>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            System Management
          </div>
          
          <Link 
            href="/admin" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/admin') ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" />
            Overview
          </Link>

          <Link 
            href="/admin/content" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/content') ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Folders className="w-5 h-5 mr-3" />
            Categories & Links
          </Link>

          <Link 
            href="/admin/settings" 
            className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive('/admin/settings') ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
          >
            <Palette className="w-5 h-5 mr-3" />
            UI & Settings
          </Link>
        </nav>

        {/* BOTTOM FIXED MENU */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link 
            href="/"
            className="flex items-center w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            Back to Hub
          </Link>
          <button 
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-red-400 hover:text-red-300 hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-800">
            System Administration
          </h1>
          
          {/* USER PROFILE DROPDOWN */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-3 hover:bg-slate-50 p-2 rounded-xl transition-colors outline-none"
            >
              {/* Dinamik Avatar Alanı */}
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-sm overflow-hidden">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  username.charAt(0).toUpperCase()
                )}
              </div>
              
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-slate-700">{username}</p>
                <p className="text-xs text-slate-500 font-medium">Super Admin</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 mb-2 md:hidden">
                  <p className="text-sm font-semibold text-slate-700">{username}</p>
                  <p className="text-xs text-slate-500">Super Admin</p>
                </div>
                
                <Link 
                  href="/" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 mr-3" /> 
                  User Dashboard
                </Link>
                
                <hr className="my-2 border-slate-100" />
                
                <button 
                  onClick={logout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-3" /> 
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>
        
        {/* PAGE CONTENT */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}