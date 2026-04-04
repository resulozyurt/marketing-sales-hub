"use client";

import { useState, useEffect } from "react";
import { 
  FolderPlus, Link as LinkIcon, AlertCircle, CheckCircle2, 
  Trash2, Edit2, X, Plus
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import api from "@/services/api";

// Sık kullanılan ikonların listesi (Görsel seçici için)
const ICON_OPTIONS = [
  "LayoutDashboard", "MousePointerClick", "Search", "Share2", "TrendingUp", 
  "MonitorSmartphone", "Users", "Settings", "Mail", "FileText", "PieChart", 
  "Activity", "Briefcase", "BarChart", "ShoppingCart", "Globe", "Zap", "Target"
];

// Tailwind renk paleti (Görsel seçici için)
const COLOR_OPTIONS = [
  "bg-blue-500", "bg-indigo-500", "bg-purple-500", "bg-pink-500", "bg-red-500", 
  "bg-orange-500", "bg-yellow-500", "bg-green-500", "bg-emerald-500", "bg-teal-500", 
  "bg-cyan-500", "bg-slate-500"
];

interface HubLink { id: number; name: string; url: string; category_id: string; }
interface Category { id: string; title: string; icon: string; color: string; links: HubLink[]; }

export default function ContentManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Form States (Ekleme ve Düzenleme için ortak)
  const [isEditingCat, setIsEditingCat] = useState(false);
  const [catId, setCatId] = useState("");
  const [catTitle, setCatTitle] = useState("");
  const [catIcon, setCatIcon] = useState(ICON_OPTIONS[0]);
  const [catColor, setCatColor] = useState(COLOR_OPTIONS[0]);

  const [linkCategoryId, setLinkCategoryId] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await api.get("/hub/categories");
      setCategories(res.data);
      if (res.data.length > 0 && !linkCategoryId) setLinkCategoryId(res.data[0].id);
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const showStatus = (type: "success" | "error", message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus({ type: "", message: "" }), 3000);
  };

  // Dinamik İkon Getirici
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : <LucideIcons.HelpCircle className="w-5 h-5" />;
  };

  // ================= CATEGORY İŞLEMLERİ =================
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditingCat) {
        await api.put(`/hub/categories/${catId}`, { title: catTitle, icon: catIcon, color: catColor });
        showStatus("success", "Category updated!");
      } else {
        await api.post("/hub/categories", { id: catId, title: catTitle, icon: catIcon, color: catColor });
        showStatus("success", "Category created!");
      }
      resetCatForm();
      fetchCategories();
    } catch (err: any) {
      showStatus("error", err.response?.data?.detail || "Action failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category and all its links?")) return;
    try {
      await api.delete(`/hub/categories/${id}`);
      showStatus("success", "Category deleted!");
      fetchCategories();
    } catch (err) { showStatus("error", "Failed to delete category."); }
  };

  const editCategory = (cat: Category) => {
    setIsEditingCat(true); setCatId(cat.id); setCatTitle(cat.title); setCatIcon(cat.icon); setCatColor(cat.color);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetCatForm = () => {
    setIsEditingCat(false); setCatId(""); setCatTitle(""); setCatIcon(ICON_OPTIONS[0]); setCatColor(COLOR_OPTIONS[0]);
  };

  // ================= LINK İŞLEMLERİ =================
  const handleSaveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post(`/hub/categories/${linkCategoryId}/links`, { name: linkName, url: linkUrl });
      showStatus("success", "Link added!");
      setLinkName(""); setLinkUrl("");
      fetchCategories();
    } catch (err: any) {
      showStatus("error", err.response?.data?.detail || "Action failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLink = async (id: number) => {
    if (!confirm("Delete this link?")) return;
    try {
      await api.delete(`/hub/links/${id}`);
      showStatus("success", "Link deleted!");
      fetchCategories();
    } catch (err) { showStatus("error", "Failed to delete link."); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Categories & Links</h2>
        <p className="text-slate-500 mt-1">Manage your hub's content structure visually.</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl flex items-center border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          <span className="font-medium">{status.message}</span>
        </div>
      )}

      {/* FORMS SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* CATEGORY FORM */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center">
              <FolderPlus className="w-5 h-5 text-indigo-600 mr-3" />
              <h3 className="font-semibold text-slate-800">{isEditingCat ? "Edit Category" : "Add New Category"}</h3>
            </div>
            {isEditingCat && <button onClick={resetCatForm} className="text-sm text-slate-500 hover:text-slate-700 flex items-center"><X className="w-4 h-4 mr-1"/> Cancel</button>}
          </div>
          
          <form onSubmit={handleSaveCategory} className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ID (Slug)</label>
                <input type="text" required disabled={isEditingCat} value={catId} onChange={(e) => setCatId(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="e.g. hr-metrics" className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-slate-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Display Title</label>
                <input type="text" required value={catTitle} onChange={(e) => setCatTitle(e.target.value)} placeholder="e.g. Human Resources" className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
            </div>

            {/* VISUAL ICON PICKER */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Icon</label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 h-32 overflow-y-auto">
                {ICON_OPTIONS.map((icon) => (
                  <button key={icon} type="button" onClick={() => setCatIcon(icon)} className={`p-2 rounded-lg flex items-center justify-center transition-all ${catIcon === icon ? 'bg-indigo-100 text-indigo-600 border-2 border-indigo-500 shadow-sm' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300 hover:text-indigo-500'}`} title={icon}>
                    {getIcon(icon)}
                  </button>
                ))}
              </div>
            </div>

            {/* VISUAL COLOR PICKER */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Color Theme</label>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((color) => (
                  <button key={color} type="button" onClick={() => setCatColor(color)} className={`w-8 h-8 rounded-full shadow-sm transition-transform ${color} ${catColor === color ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-110'}`} />
                ))}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-medium py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
              {isLoading ? "Saving..." : (isEditingCat ? "Update Category" : "Save Category")}
            </button>
          </form>
        </div>

        {/* LINK FORM */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center bg-slate-50">
            <LinkIcon className="w-5 h-5 text-emerald-600 mr-3" />
            <h3 className="font-semibold text-slate-800">Add New Link to Category</h3>
          </div>
          <form onSubmit={handleSaveLink} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Category</label>
              <select required value={linkCategoryId} onChange={(e) => setLinkCategoryId(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white">
                {categories.map((cat) => (<option key={cat.id} value={cat.id}>{cat.title}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link Display Name</label>
              <input type="text" required value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder="e.g. Employee Satisfaction" className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target URL / Path</label>
              <input type="text" required value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="e.g. /analytics/hr-satisfaction" className="w-full px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full mt-4 bg-emerald-600 text-white font-medium py-2.5 rounded-lg hover:bg-emerald-700 transition-colors">
              {isLoading ? "Saving..." : "Add Link"}
            </button>
          </form>
        </div>
      </div>

      {/* DATA LIST (EDIT & DELETE) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Existing Categories & Links</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg text-white ${cat.color}`}>{getIcon(cat.icon)}</div>
                  <h4 className="font-bold text-slate-800">{cat.title}</h4>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => editCategory(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4"/></button>
                  <button onClick={() => deleteCategory(cat.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>
              <ul className="space-y-2">
                {cat.links.length === 0 ? <p className="text-sm text-slate-400 italic">No links added yet.</p> : null}
                {cat.links.map(link => (
                  <li key={link.id} className="flex items-center justify-between group text-sm p-2 hover:bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">{link.name}</span>
                    <button onClick={() => deleteLink(link.id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}