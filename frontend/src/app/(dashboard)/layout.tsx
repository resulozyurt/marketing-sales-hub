"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LogOut, ShieldAlert, ChevronDown } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import api from "@/services/api";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("User");
  const [profileImage, setProfileImage] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Dynamic Settings States
  const [logoText, setLogoText] = useState("Marketing");
  const [siteLogo, setSiteLogo] = useState("");
  const [sidebarMenu, setSidebarMenu] = useState<any[]>([]);

  const isActive = (path: string) => pathname === path;

  // Icon Parser
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5 mr-3" /> : <LucideIcons.LayoutGrid className="w-5 h-5 mr-3" />;
  };

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        // User Info
        const userRes = await api.get("/auth/me");
        setUsername(userRes.data.full_name || userRes.data.username || "User");
        setProfileImage(userRes.data.profile_image || "");

        // Global Settings & Dynamic Menu
        const settingsRes = await api.get("/hub/settings");
        const data = settingsRes.data;
        
        const logoT = data.find((x: any) => x.key === 'logo_text')?.value;
        const logoImg = data.find((x: any) => x.key === 'site_logo')?.value;
        const metaTitle = data.find((x: any) => x.key === 'meta_title')?.value;
        const favicon = data.find((x: any) => x.key === 'site_favicon')?.value;
        const menuJson = data.find((x: any) => x.key === 'sidebar_menu')?.value;

        if (logoT) setLogoText(logoT);
        if (logoImg) setSiteLogo(logoImg);
        if (metaTitle) document.title = metaTitle;
        if (favicon) {
          let link: any = document.querySelector("link[rel~='icon']");
          if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
          link.href = favicon;
        }
        if (menuJson) {
          try { setSidebarMenu(JSON.parse(menuJson)); } catch(e){}
        } else {
          // Fallback Default Menu
          setSidebarMenu([{ group: "Main Menu", items: [{ name: "Hub Navigation", url: "/", icon: "LayoutGrid" }] }]);
        }

      } catch (e) { console.error(e); }
    };
    fetchInitData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" suppressHydrationWarning>
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-xl tracking-tight">
          {siteLogo ? (
            <img src={siteLogo} alt="Logo" className="h-8 w-auto mr-3 object-contain" />
          ) : (
            <span className="text-blue-500 mr-2">{logoText}</span>
          )}
          {!siteLogo && "Hub"}
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
          {/* DYNAMIC SIDEBAR MENU RENDER */}
          {sidebarMenu.map((group, index) => (
            <div key={index}>
              <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item: any, iIndex: number) => (
                  <Link 
                    key={iIndex}
                    href={item.url} 
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.url) ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                  >
                    {getIcon(item.icon)}
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-full relative overflow-y-auto bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-800">
            {isActive('/admin') ? 'System Administration' : 'Marketing & Sales Navigation'}
          </h1>
          
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-3 hover:bg-slate-50 p-2 rounded-xl transition-colors outline-none">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm overflow-hidden">
                {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : username.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-slate-700">{username}</p>
                <p className="text-xs text-slate-500 font-medium">Administrator</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-slate-100 mb-2 md:hidden">
                  <p className="text-sm font-semibold text-slate-700">{username}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <Link href="/admin" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                  <ShieldAlert className="w-4 h-4 mr-3" /> Admin Panel
                </Link>
                <Link href="/settings" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                  <Settings className="w-4 h-4 mr-3" /> Settings
                </Link>
                <hr className="my-2 border-slate-100" />
                <button onClick={logout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4 mr-3" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}