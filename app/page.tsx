"use client";

import React, { useState } from "react";
import BottomNav from "@/components/BottomNav";
import Calculator from "@/components/Calculator";
import History from "@/components/History";
import Guide from "@/components/Guide";
import Settings from "@/components/Settings";
import Login from "@/components/Login";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";

type Tab = "calculator" | "history" | "guide" | "settings";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-md mx-auto h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
        <Loader2 className="animate-spin text-primary w-10 h-10 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden shadow-2xl transition-colors duration-200">
        <Login />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white overflow-hidden shadow-2xl transition-colors duration-200">
      <div className="flex-1 overflow-y-auto">
        {activeTab === "calculator" && (
          <Calculator onGoToHistory={() => setActiveTab("history")} />
        )}
        {activeTab === "history" && (
          <History onGoBack={() => setActiveTab("calculator")} />
        )}
        {activeTab === "guide" && (
          <Guide />
        )}
        {activeTab === "settings" && <Settings />}
      </div>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}