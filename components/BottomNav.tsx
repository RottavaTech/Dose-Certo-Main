"use client";

import React from "react";
import { Calculator, Clock, BookOpen, Settings } from "lucide-react";

type Tab = "calculator" | "history" | "guide" | "settings";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-2 pb-6 pt-3 grid grid-cols-4 z-20 shrink-0 transition-colors duration-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] dark:shadow-none">
      
      {/* aba calculadora */}
      <button
        onClick={() => onTabChange("calculator")}
        className={`flex flex-col items-center gap-1 transition-colors relative ${
          activeTab === "calculator"
            ? "text-primary"
            : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
        }`}
      >
        {activeTab === "calculator" && (
          <div className="absolute -top-3 w-8 h-1 bg-primary rounded-full"></div>
        )}
        <Calculator size={24} strokeWidth={activeTab === "calculator" ? 2.5 : 2} />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Calculadora
        </span>
      </button>

      {/* aba do historico */}
      <button
        onClick={() => onTabChange("history")}
        className={`flex flex-col items-center gap-1 transition-colors relative ${
          activeTab === "history"
            ? "text-primary"
            : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
        }`}
      >
        {activeTab === "history" && (
          <div className="absolute -top-3 w-8 h-1 bg-primary rounded-full"></div>
        )}
        <Clock size={24} strokeWidth={activeTab === "history" ? 2.5 : 2} />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Histórico
        </span>
      </button>

      {/* Aba da guia */}
      <button
        onClick={() => onTabChange("guide")}
        className={`flex flex-col items-center gap-1 transition-colors relative ${
          activeTab === "guide"
            ? "text-primary"
            : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
        }`}
      >
        {activeTab === "guide" && (
          <div className="absolute -top-3 w-8 h-1 bg-primary rounded-full"></div>
        )}
        <BookOpen size={24} strokeWidth={activeTab === "guide" ? 2.5 : 2} />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Guia
        </span>
      </button>

      {/* Aba dos ajustes */}
      <button
        onClick={() => onTabChange("settings")}
        className={`flex flex-col items-center gap-1 transition-colors relative ${
          activeTab === "settings"
            ? "text-primary"
            : "text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary"
        }`}
      >
        {activeTab === "settings" && (
          <div className="absolute -top-3 w-8 h-1 bg-primary rounded-full"></div>
        )}
        <Settings size={24} strokeWidth={activeTab === "settings" ? 2.5 : 2} />
        <span className="text-[10px] font-bold uppercase tracking-wider">
          Ajustes
        </span>
      </button>
    </nav>
  );
}