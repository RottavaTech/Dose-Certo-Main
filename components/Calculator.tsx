"use client";

import React, { useState } from "react";
import { Syringe as SyringeIcon, AlertTriangle, Save, Info } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";

const SYRINGE_OPTIONS = [
  { id: "1ml_in", label: "1 mL Insulina (100 UI)" },
  { id: "1ml_tb", label: "1 mL Tuberculina" },
  { id: "3ml", label: "3 mL" },
  { id: "5ml", label: "5 mL" },
  { id: "10ml", label: "10 mL" },
  { id: "20ml", label: "20 mL" },
  { id: "60ml", label: "60 mL" }
] as const;

type SyringeType = typeof SYRINGE_OPTIONS[number]["id"];

export interface HistoryEntry {
  id: string;
  date: string;
  concentration: number;
  dose: number;
  syringe: SyringeType;
  volume: number;
  ui: number | null;
}

export default function Calculator({ onGoToHistory }: { onGoToHistory: () => void }) {
  const { user } = useAuth();
  const [concentration, setConcentration] = useState<string>("");
  const [dose, setDose] = useState<string>("");
  const [syringe, setSyringe] = useState<SyringeType>("1ml_in");
  const [isSaving, setIsSaving] = useState(false);

  // Para impedir caracteres inválidos e quebra de layout
  const handleInput = (val: string, setter: (v: string) => void) => {
    let clean = val.replace(/[^0-9.,]/g, "").replace(",", ".");
    
    const parts = clean.split(".");
    if (parts.length > 2) {
      clean = parts[0] + "." + parts.slice(1).join("");
    }
    
    if (clean.length > 6) {
      clean = clean.slice(0, 6);
    }
    setter(clean);
  };

  const concValue = parseFloat(concentration);
  const doseValue = parseFloat(dose);

  let volume = 0;
  let ui: number | null = 0;

  // Logica principal da conversão baseada na Regra de Três
  if (!isNaN(concValue) && !isNaN(doseValue) && concValue > 0) {
    volume = doseValue / concValue;
    if (syringe === "1ml_in") {
      ui = volume * 100;
    } else {
      ui = null;
    }
  }

  // Persistência do cálculo no banco de dados
  const handleSave = async () => {
    if (!user) {
      alert("Você precisa estar logado para salvar.");
      return;
    }

    if (isNaN(concValue) || isNaN(doseValue) || concValue <= 0) {
      alert("Por favor, preencha os valores corretamente.");
      return;
    }

    setIsSaving(true);
    try {
      const syringeLabel = SYRINGE_OPTIONS.find(s => s.id === syringe)?.label || "";
      const resultText = ui !== null 
        ? `${volume.toFixed(2)}mL (${ui.toFixed(1)} UI)`
        : `${volume.toFixed(2)}mL`;

      const { error } = await supabase
        .from('history')
        .insert([{
          user_id: user.id, // Amarrado diretamente ao usuário logado na nuvem
          nome: `Cálculo: ${dose}mg (${concentration}mg/mL)`,
          dose_info: `Seringa: ${syringeLabel} • Result: ${resultText}`,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setConcentration("");
      setDose("");
      alert("Cálculo salvo no seu diário com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      alert("Erro ao salvar. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-200">
      
      {/* cabecalho */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SyringeIcon className="text-primary" size={28} />
            <h1 className="font-bold text-lg tracking-tight">DoseCerto</h1>
          </div>
        </div>
      </header>

      {/* banner do aviso legal */}
      <div className="px-4 py-3">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-4 flex gap-3 items-start shadow-sm transition-colors duration-200">
          <AlertTriangle className="text-amber-500 dark:text-amber-500 shrink-0" size={20} />
          <p className="text-sm text-amber-800 dark:text-amber-200 leading-snug">
            <strong>Aviso Importante:</strong> Apenas conversão matemática. Não substitui orientação médica ou profissional.
          </p>
        </div>
      </div>

      {/* formulario de entradas */}
      <section className="px-4 py-4 space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1 transition-colors duration-200">
            Concentração do frasco (mg/mL)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={concentration}
              onChange={(e) => handleInput(e.target.value, setConcentration)}
              className="w-full h-16 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-0 transition-all text-xl font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white shadow-sm"
              placeholder="Ex: 100"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
              mg/mL
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1 transition-colors duration-200">
            Dose prescrita (mg)
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={dose}
              onChange={(e) => handleInput(e.target.value, setDose)}
              className="w-full h-16 px-5 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:border-primary focus:ring-0 transition-all text-xl font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white shadow-sm"
              placeholder="Ex: 25"
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
              mg
            </span>
          </div>
        </div>

        {/* selecoa das seringas */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 ml-1 transition-colors duration-200">
            Tipo de Seringa
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SYRINGE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setSyringe(option.id)}
                className={`py-3 px-3 text-sm rounded-xl transition-all border-2 text-left flex items-center justify-between ${
                  syringe === option.id
                    ? "font-bold bg-primary/10 border-primary text-primary"
                    : "font-medium bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm"
                } ${option.id === "1ml_in" ? "col-span-2" : ""}`}
              >
                <span>{option.label}</span>
                {syringe === option.id && (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* resultados */}
      <section className="px-4 py-6 grid grid-cols-2 gap-4">
        <div className="bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm transition-colors duration-200">
          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1">
            Volume
          </span>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {volume > 0 ? volume.toFixed(2).replace(/\.00$/, "") : "0"}
          </div>
          <span className="text-sm font-medium text-primary">mL</span>
        </div>

        {/* O segundo card preserva o layout mantendo-se desativado quando não é insulina */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:emerald-800/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm transition-colors duration-200">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            Seringa (UI)
          </span>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {syringe === "1ml_in" && ui !== null
              ? ui > 0
                ? ui.toFixed(1).replace(/\.0$/, "")
                : "0"
              : "-"}
          </div>
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 min-h-[20px]">
            {syringe === "1ml_in" ? "UI" : ""}
          </span>
        </div>
      </section>

      <div className="px-4 py-2">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          {isSaving ? "Salvando..." : "Salvar no Diário"}
        </button>
      </div>

      {/* secao educacional e formulas */}
      <section className="px-4 py-4">
        <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
          <div className="flex items-center gap-2 mb-4">
            <Info className="text-gray-500 dark:text-gray-400" size={20} />
            <h3 className="font-bold text-gray-900 dark:text-gray-200">
              Como calculamos?
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Utilizamos a <strong>Regra de Três Simples</strong> para encontrar o volume exato baseado na concentração disponível:
          </p>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 font-mono text-center border border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="text-xs text-gray-500 mb-2 italic">
              Fórmula aplicada
            </div>
            <div className="text-primary font-bold">
              V = (Dose × 1mL) / Conc
            </div>
            {syringe === "1ml_in" && (
              <div className="text-emerald-600 dark:text-emerald-400 font-bold mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                UI = V × 100
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}