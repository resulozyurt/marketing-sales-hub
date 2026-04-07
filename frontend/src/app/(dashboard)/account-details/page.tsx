"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Copy, Check, Edit2, Trash2, Shield, KeyRound, AlertCircle, X 
} from "lucide-react";
import api from "@/services/api";

interface AccountDetail {
  id: number;
  platform: string;
  login_type: string;
  mail_address: string | null;
  username: string | null;
  password: string;
}

export default function AccountDetailsPage() {
  const [accounts, setAccounts] = useState<AccountDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  
  // Form States
  const [formData, setFormData] = useState({
    platform: "",
    login_type: "",
    mail_address: "",
    username: "",
    password: ""
  });

  const fetchAccounts = async () => {
    try {
      const res = await api.get("/accounts");
      setAccounts(res.data);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCopy = (text: string, fieldId: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(fieldId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openModalForAdd = () => {
    setFormData({ platform: "", login_type: "", mail_address: "", username: "", password: "" });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const openModalForEdit = (acc: AccountDetail) => {
    setFormData({
      platform: acc.platform,
      login_type: acc.login_type,
      mail_address: acc.mail_address || "",
      username: acc.username || "",
      password: acc.password
    });
    setCurrentId(acc.id);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        platform: formData.platform,
        login_type: formData.login_type,
        mail_address: formData.mail_address || null,
        username: formData.username || null,
        password: formData.password
      };

      if (isEditing && currentId) {
        await api.put(`/accounts/${currentId}`, payload);
      } else {
        await api.post("/accounts", payload);
      }
      setIsModalOpen(false);
      fetchAccounts();
    } catch (err) {
      console.error("Action failed", err);
      alert("An error occurred while saving the account details.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this account detail?")) return;
    try {
      await api.delete(`/accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const CopyCell = ({ text, id }: { text: string | null, id: string }) => {
    if (!text) return <span className="text-slate-400 italic text-sm">N/A</span>;
    const isCopied = copiedId === id;
    
    return (
      <div className="flex items-center space-x-2 group">
        <span className="truncate max-w-[150px]" title={text}>
          {id.includes('pass') ? '••••••••••••' : text}
        </span>
        <button 
          onClick={() => handleCopy(text, id)}
          className={`p-1.5 rounded-md transition-all ${isCopied ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-200 hover:text-slate-700'}`}
          title="Copy to clipboard"
        >
          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
            <Shield className="w-8 h-8 mr-3 text-indigo-600" />
            Account Details
          </h2>
          <p className="text-slate-500 mt-1">Securely manage credentials for marketing and sales platforms.</p>
        </div>
        <button 
          onClick={openModalForAdd}
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Account
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Platform</th>
                <th className="p-4 font-semibold">Login Type</th>
                <th className="p-4 font-semibold">Email Address</th>
                <th className="p-4 font-semibold">Username</th>
                <th className="p-4 font-semibold">Password</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">Loading accounts...</td>
                </tr>
              ) : accounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <KeyRound className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-lg font-medium text-slate-700">No accounts added yet</p>
                    <p className="text-sm mt-1">Click the "Add Account" button to store your first credential.</p>
                  </td>
                </tr>
              ) : (
                accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium text-slate-800">{acc.platform}</td>
                    <td className="p-4 text-slate-600"><span className="bg-slate-100 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200">{acc.login_type}</span></td>
                    <td className="p-4 text-slate-600">
                      <CopyCell text={acc.mail_address} id={`mail-${acc.id}`} />
                    </td>
                    <td className="p-4 text-slate-600">
                      <CopyCell text={acc.username} id={`usr-${acc.id}`} />
                    </td>
                    <td className="p-4 text-slate-600">
                      <CopyCell text={acc.password} id={`pass-${acc.id}`} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openModalForEdit(acc)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(acc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal / Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-lg">
                {isEditing ? "Edit Account Details" : "Add New Account"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Platform Name *</label>
                  <input type="text" required value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} placeholder="e.g. HubSpot, Google Ads" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Login Type *</label>
                  <input type="text" required value={formData.login_type} onChange={e => setFormData({...formData, login_type: e.target.value})} placeholder="e.g. Admin, Editor, View Only" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" value={formData.mail_address} onChange={e => setFormData({...formData, mail_address: e.target.value})} placeholder="e.g. marketing@fieldpie.com" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
                <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="e.g. fieldpie_admin" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password *</label>
                <input type="text" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Enter password securely" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all font-mono" />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">
                  {isEditing ? "Save Changes" : "Add Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}