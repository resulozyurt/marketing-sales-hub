"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Folders, Palette, Link as LinkIcon } from "lucide-react";
import api from "@/services/api";

export default function AdminOverview() {
  const [stats, setStats] = useState({ categories: 0, links: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/hub/categories");
        const categories = res.data;
        // Tüm kategorilerdeki link sayılarını topluyoruz
        const totalLinks = categories.reduce((acc: number, cat: any) => acc + cat.links.length, 0);
        setStats({ categories: categories.length, links: totalLinks });
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">System Overview</h2>
        <p className="text-slate-500 mt-1">Welcome to the Admin Console. Here is a quick summary of your hub.</p>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-5 transition-shadow hover:shadow-md">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
            <Folders className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Categories</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {isLoading ? "..." : stats.categories}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-5 transition-shadow hover:shadow-md">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <LinkIcon className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Active Links</p>
            <h3 className="text-3xl font-bold text-slate-800">
              {isLoading ? "..." : stats.links}
            </h3>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mt-10 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/content" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
            <div className="flex items-center space-x-3 mb-3">
              <Folders className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-slate-800">Manage Content</h4>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">Add, edit, or remove hub categories, update icons, and manage navigation links.</p>
          </Link>

          <Link href="/admin/settings" className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
            <div className="flex items-center space-x-3 mb-3">
              <Palette className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
              <h4 className="font-semibold text-slate-800">UI & Settings</h4>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">Update system branding, application title, and customize sidebar menu names.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}