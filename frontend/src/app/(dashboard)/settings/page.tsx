"use client";

import { useState, useEffect, useRef } from "react";
import { User, Mail, Shield, Camera, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/services/api";

export default function UserSettings() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    full_name: "", username: "", email: "", profile_image: "", password: "",
  });
  const [isUsernameFixed, setIsUsernameFixed] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get("/auth/me");
        setFormData({
          ...formData,
          full_name: res.data.full_name || "",
          username: res.data.username || "",
          email: res.data.email || "",
          profile_image: res.data.profile_image || "",
        });
        if (res.data.username) setIsUsernameFixed(true);
      } catch (err) { console.error(err); }
    };
    fetchUserData();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800 * 1024) {
        setStatus({ type: "error", message: "Image must be less than 800KB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, profile_image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); setStatus({ type: "", message: "" });

    try {
      const updatePayload: any = { 
        full_name: formData.full_name, email: formData.email, profile_image: formData.profile_image
      };
      if (!isUsernameFixed && formData.username) updatePayload.username = formData.username;
      if (formData.password) updatePayload.password = formData.password;

      await api.put("/auth/me", updatePayload);
      setStatus({ type: "success", message: "Profile updated successfully!" });
      if (formData.username) setIsUsernameFixed(true);
      setFormData(prev => ({ ...prev, password: "" }));
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setStatus({ type: "error", message: typeof err.response?.data?.detail === 'string' ? err.response.data.detail : "Update failed." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-slate-500 mt-1">Manage your personal information and security preferences.</p>
      </div>

      {status.message && (
        <div className={`p-4 rounded-xl flex items-center border ${status.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
          <span className="font-medium">{status.message}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          {/* PROFILE IMAGE */}
          <div className="flex items-center space-x-6">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-slate-200 overflow-hidden">
                {formData.profile_image ? <img src={formData.profile_image} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-slate-400" />}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-800">Profile Picture</h4>
              <p className="text-sm text-slate-500">Click avatar to upload (Max 800KB)</p>
            </div>
          </div>
          <hr className="border-slate-100" />
          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute inset-y-0 left-0 pl-3 h-full w-8 text-slate-400 pointer-events-none" />
                <input type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <div className="relative">
                <Shield className="absolute inset-y-0 left-0 pl-3 h-full w-8 text-slate-400 pointer-events-none" />
                <input type="text" disabled={isUsernameFixed} value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '')})} placeholder="unique_username" className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none ${isUsernameFixed ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}`} />
              </div>
              {!isUsernameFixed && <p className="text-[10px] text-orange-500 mt-1">* Can only be set once.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute inset-y-0 left-0 pl-3 h-full w-8 text-slate-400 pointer-events-none" />
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Update Password</label>
              <div className="relative">
                <Lock className="absolute inset-y-0 left-0 pl-3 h-full w-8 text-slate-400 pointer-events-none" />
                <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} placeholder="Leave blank to keep current" className="block w-full pl-10 pr-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button type="submit" disabled={isLoading} className="bg-blue-600 text-white font-medium px-8 py-2.5 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">{isLoading ? "Saving..." : "Save Changes"}</button>
        </div>
      </form>
    </div>
  );
}