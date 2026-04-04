"use client";

import { useState, useEffect, useRef } from "react";
import { Settings2, Save, AlertCircle, CheckCircle2, Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import * as LucideIcons from "lucide-react";
import api from "@/services/api";

const ICON_OPTIONS = ["LayoutGrid", "LayoutDashboard", "Layers", "Settings", "Users", "ShieldAlert", "PieChart", "Activity"];

export default function SystemSettings() {
  const logoRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState({
    meta_title: "Marketing Hub",
    meta_description: "Enterprise Analytics Dashboard",
    logo_text: "Marketing",
    site_logo: "",
    site_favicon: "",
  });

  // Dinamik Menü State'i (Veritabanında JSON string olarak tutulacak)
  const [sidebarMenu, setSidebarMenu] = useState([
    { group: "Main Menu", items: [{ name: "Hub Navigation", url: "/", icon: "LayoutGrid" }] }
  ]);

  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/hub/settings");
        if (res.data.length > 0) {
          const fetchedSettings: any = { ...settings };
          res.data.forEach((item: any) => {
            if (item.key === 'sidebar_menu') {
              try { setSidebarMenu(JSON.parse(item.value)); } catch(e){}
            } else {
              fetchedSettings[item.key] = item.value;
            }
          });
          setSettings(fetchedSettings);
        }
      } catch (err) { console.error(err); }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, [e.target.name]: e.target.value });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { setStatus({ type: "error", message: "Image must be less than 500KB" }); return; }
      const reader = new FileReader();
      reader.onloadend = () => setSettings({ ...settings, [key]: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  // --- DYNAMIC MENU LOGIC ---
  const addGroup = () => setSidebarMenu([...sidebarMenu, { group: "New Group", items: [] }]);
  const removeGroup = (gIndex: number) => setSidebarMenu(sidebarMenu.filter((_, i) => i !== gIndex));
  const updateGroupName = (gIndex: number, val: string) => {
    const newMenu = [...sidebarMenu]; newMenu[gIndex].group = val; setSidebarMenu(newMenu);
  };
  const addItem = (gIndex: number) => {
    const newMenu = [...sidebarMenu];
    newMenu[gIndex].items.push({ name: "New Link", url: "/", icon: "Layers" });
    setSidebarMenu(newMenu);
  };
  const updateItem = (gIndex: number, iIndex: number, field: string, val: string) => {
    const newMenu = [...sidebarMenu]; (newMenu[gIndex].items[iIndex] as any)[field] = val; setSidebarMenu(newMenu);
  };
  const removeItem = (gIndex: number, iIndex: number) => {
    const newMenu = [...sidebarMenu]; newMenu[gIndex].items.splice(iIndex, 1); setSidebarMenu(newMenu);
  };
  const moveItem = (gIndex: number, iIndex: number, direction: number) => {
    const newMenu = [...sidebarMenu]; const items = newMenu[gIndex].items;
    if (iIndex + direction < 0 || iIndex + direction >= items.length) return;
    const temp = items[iIndex]; items[iIndex] = items[iIndex + direction]; items[iIndex + direction] = temp;
    setSidebarMenu(newMenu);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <LucideIcons.HelpCircle className="w-4 h-4" />;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setIsLoading(true); setStatus({ type: "", message: "" });
    try {
      for (const [key, value] of Object.entries(settings)) { await api.post("/hub/settings", { key, value }); }
      await api.post("/hub/settings", { key: "sidebar_menu", value: JSON.stringify(sidebarMenu) });
      setStatus({ type: "success", message: "System settings updated successfully!" });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) { setStatus({ type: "error", message: "Failed to save settings." }); } 
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">UI & Settings</h2>
        <p className="text-slate-500 mt-1">Configure global branding, meta tags, and dynamic sidebar navigation.</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl flex items-center border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          <span className="font-medium">{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* BRANDING & META */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center bg-slate-50">
            <Settings2 className="w-5 h-5 text-slate-600 mr-3" />
            <h3 className="font-semibold text-slate-800">Branding & Meta Tags</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Meta Title (Browser Tab)</label>
              <input type="text" name="meta_title" value={settings.meta_title} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sidebar Text Logo</label>
              <input type="text" name="logo_text" value={settings.logo_text} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Meta Description (SEO)</label>
              <input type="text" name="meta_description" value={settings.meta_description} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            
            {/* IMAGES */}
            <div className="flex items-center space-x-4 border p-4 rounded-xl border-slate-100 bg-slate-50/50">
              <input type="file" accept="image/*" className="hidden" ref={logoRef} onChange={(e) => handleFileUpload(e, 'site_logo')} />
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                {settings.site_logo ? <img src={settings.site_logo} className="w-full h-full object-contain" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Site Logo</p>
                <button type="button" onClick={() => logoRef.current?.click()} className="text-xs text-indigo-600 hover:underline">Upload Logo (Max 500KB)</button>
              </div>
            </div>

            <div className="flex items-center space-x-4 border p-4 rounded-xl border-slate-100 bg-slate-50/50">
              <input type="file" accept="image/*" className="hidden" ref={faviconRef} onChange={(e) => handleFileUpload(e, 'site_favicon')} />
              <div className="w-12 h-12 bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                {settings.site_favicon ? <img src={settings.site_favicon} className="w-full h-full object-contain" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Favicon</p>
                <button type="button" onClick={() => faviconRef.current?.click()} className="text-xs text-indigo-600 hover:underline">Upload Favicon (.ico or .png)</button>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC SIDEBAR MENU BUILDER */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center">
              <LucideIcons.ListTree className="w-5 h-5 text-slate-600 mr-3" />
              <h3 className="font-semibold text-slate-800">Sidebar Menu Builder</h3>
            </div>
            <button type="button" onClick={addGroup} className="flex items-center text-sm text-indigo-600 font-medium hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg"><Plus className="w-4 h-4 mr-1"/> Add Group</button>
          </div>
          
          <div className="p-6 space-y-8">
            {sidebarMenu.map((group, gIndex) => (
              <div key={gIndex} className="border border-slate-200 rounded-xl bg-slate-50 p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <input type="text" value={group.group} onChange={(e) => updateGroupName(gIndex, e.target.value)} className="font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none flex-1" placeholder="Group Name (e.g. Main Menu)" />
                  <button type="button" onClick={() => addItem(gIndex)} className="text-sm text-slate-600 hover:text-indigo-600 font-medium flex items-center"><Plus className="w-4 h-4 mr-1"/> Add Link</button>
                  <button type="button" onClick={() => removeGroup(gIndex)} className="text-sm text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4"/></button>
                </div>

                <div className="space-y-3 pl-4 border-l-2 border-indigo-100">
                  {group.items.map((item, iIndex) => (
                    <div key={iIndex} className="flex items-center space-x-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                      {/* Icon Picker */}
                      <select value={item.icon} onChange={(e) => updateItem(gIndex, iIndex, 'icon', e.target.value)} className="w-12 h-9 border rounded-lg outline-none px-1 text-slate-600 appearance-none text-center cursor-pointer">
                        {ICON_OPTIONS.map(ico => <option key={ico} value={ico}>{ico}</option>)}
                      </select>
                      <div className="w-8 flex items-center justify-center text-indigo-500">{getIcon(item.icon)}</div>
                      
                      <input type="text" value={item.name} onChange={(e) => updateItem(gIndex, iIndex, 'name', e.target.value)} className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500" placeholder="Display Name" />
                      <input type="text" value={item.url} onChange={(e) => updateItem(gIndex, iIndex, 'url', e.target.value)} className="flex-1 border rounded-lg px-3 py-1.5 text-sm outline-none focus:border-indigo-500 text-slate-500 font-mono" placeholder="Target URL" />
                      
                      <div className="flex flex-col space-y-1">
                        <button type="button" onClick={() => moveItem(gIndex, iIndex, -1)} disabled={iIndex === 0} className="text-slate-400 hover:text-slate-800 disabled:opacity-30"><ArrowUp className="w-4 h-4"/></button>
                        <button type="button" onClick={() => moveItem(gIndex, iIndex, 1)} disabled={iIndex === group.items.length - 1} className="text-slate-400 hover:text-slate-800 disabled:opacity-30"><ArrowDown className="w-4 h-4"/></button>
                      </div>
                      <button type="button" onClick={() => removeItem(gIndex, iIndex)} className="text-red-400 hover:text-red-600 p-2"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {group.items.length === 0 && <p className="text-sm text-slate-400 italic">No links in this group.</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end sticky bottom-4 z-10">
          <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white font-medium px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg flex items-center">
            <Save className="w-5 h-5 mr-2" /> {isLoading ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}