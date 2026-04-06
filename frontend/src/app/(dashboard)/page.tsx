"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Loader2, AlertCircle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import api from "@/services/api";

// API'den gelecek verinin tip tanımlamaları
interface HubLink {
  id: number;
  name: string;
  url: string;
}

interface HubCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  links: HubLink[];
}

export default function Home() {
  const [categories, setCategories] = useState<HubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHubData = async () => {
      try {
        const response = await api.get("/hub/categories");
        setCategories(response.data);
      } catch (err) {
        console.error("Failed to fetch hub data:", err);
        setError("Unable to load dashboard data. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHubData();
  }, []);

  // Metin olarak gelen ikon adını gerçek Lucide bileşenine dönüştüren yardımcı fonksiyon
  const getIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-6 h-6" /> : <LucideIcons.HelpCircle className="w-6 h-6" />;
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="bg-red-50 text-red-600 p-6 rounded-2xl flex items-center shadow-sm border border-red-100">
          <AlertCircle className="w-6 h-6 mr-3" />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">👋 Welcome to the Sales and Marketing hub.Central Hub</h2>
        <p className="text-slate-500 mt-2">Click the link in your desired category to navigate to the relevant section. You can find access details in the left-hand menu.</p>
          <p className="text-slate-500 mt-2">For connections without account credentials, please ensure your email address has been authorized.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div 
            key={category.id} 
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden flex flex-col"
          >
            {/* Card Header */}
            <div className="p-6 border-b border-slate-100 flex items-center space-x-4">
              <div className={`p-3 rounded-xl ${category.color} text-white shadow-sm`}>
                {getIcon(category.icon)}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{category.title}</h3>
            </div>
            
            {/* Card Links */}
            <div className="p-4 flex-1 bg-slate-50/50">
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.id}>
                    <a 
                      href={link.url}
                      className="group flex items-center justify-between p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all duration-200"
                    >
                      <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors">
                        {link.name}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-blue-600 transition-all duration-200" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}