"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar as CalendarIcon, Clock, CheckCircle, Trash2, X, Plus, Pill, Bell, Syringe, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

export interface HistoryEntry {
  id: string;
  created_at: string;
  nome: string;
  dose_info: string;
  user_id: string;
}

export default function History() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [selectedFilterDate, setSelectedFilterDate] = useState<string | null>(null);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedEntryForReminder, setSelectedEntryForReminder] = useState<HistoryEntry | null>(null);
  const [reminderData, setReminderData] = useState({
    frequencia: "diariamente",
    hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  });

  const [formData, setFormData] = useState({
    nome: "",
    dose: "",
    data: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  });

  // Busca o histórico do Supabase
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', user.id) // Garante que busca SOMENTE os dados do usuário autenticado
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSetReminder = (entry: HistoryEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEntryForReminder(entry);
    setReminderData({
      frequencia: "diariamente",
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    });
    setIsReminderModalOpen(true);
  };
  
  const handleSaveReminder = () => {
    setIsReminderModalOpen(false);
    alert(`Lembrete configurado para ${selectedEntryForReminder?.nome} às ${reminderData.hora} (${reminderData.frequencia}).`);
    
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  };

  const openNewEntry = () => {
    setEditingId(null);
    setFormData({
      nome: "",
      dose: "",
      data: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    });
    setIsModalOpen(true);
  };

  const openEditEntry = (entry: HistoryEntry) => {
    setEditingId(entry.id);
    const dateObj = new Date(entry.created_at);
    setFormData({
      nome: entry.nome || "",
      dose: entry.dose_info || "",
      data: dateObj.toISOString().split('T')[0],
      hora: dateObj.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome) return alert("Preencha o nome do medicamento.");
    if (!user) return alert("Você precisa estar logado.");

    try {
      setIsSaving(true);
      
      const dateTime = new Date(`${formData.data}T${formData.hora}:00`).toISOString();

      if (editingId) {
        const { error } = await supabase
          .from('history')
          .update({
            nome: formData.nome,
            dose_info: formData.dose,
            created_at: dateTime
          })
          .eq('id', editingId)
          .eq('user_id', user.id); // Camada extra de segurança na edição
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('history')
          .insert([{
            user_id: user.id, // Insere atrelado ao usuário da sessão
            nome: formData.nome,
            dose_info: formData.dose,
            created_at: dateTime
          }]);
        
        if (error) throw error;
      }
      
      await fetchHistory();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar o registro.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('history')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id); // Segurança na exclusão

      if (error) throw error;
      
      setHistory(prev => prev.filter(item => item.id !== id));
      if (editingId === id) setIsModalOpen(false);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir o registro.");
    } finally {
      setIsSaving(false);
    }
  };

  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", { month: "long" });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleDateString("pt-BR", { month: "long" });
    const time = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)} • ${time}`;
  };

  const filteredHistory = selectedFilterDate 
    ? history.filter((entry) => entry.created_at.startsWith(selectedFilterDate))
    : history;

  const groupedHistory = filteredHistory.reduce(
    (acc, entry) => {
      const month = formatMonth(entry.created_at);
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(entry);
      return acc;
    },
    {} as Record<string, HistoryEntry[]>,
  );

  const getRelativeDateLabel = (dateString: string) => {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
  
      if (date.toDateString() === today.toDateString()) return "Hoje";
      if (date.toDateString() === yesterday.toDateString()) return "Ontem";
      return null;
    };

  const currentMonthCount = history.length; 

  const generateCalendarDays = (dateStr: string) => {
     const [year, month] = dateStr.split('-').map(Number);
     const date = new Date(year, month - 1, 1);
     const firstDay = date.getDay();
     const daysInMonth = new Date(year, month, 0).getDate();
     
     const days = [];
     for (let i = 0; i < firstDay; i++) days.push(null);
     for (let i = 1; i <= daysInMonth; i++) days.push(i);
     
     return days;
  };

  const formatDateFilter = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="relative flex flex-col h-full overflow-hidden w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-200">
      {/* Cabecalho */}
      <header className="shrink-0 sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Syringe className="text-primary" size={28} />
            <h1 className="font-bold text-lg tracking-tight">DoseCerto</h1>
          </div>
        </div>
      </header>

      {/* Botão de acao flutuante */}
      <button 
        onClick={openNewEntry}
        className="absolute bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        aria-label="Adicionar Novo Registro"
      >
        <Plus size={32} strokeWidth={2.5} />
      </button>

      {/* Conteudo Rolavel */}
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Conteúdo Principal */}
        <div className="px-4 pt-6 pb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Diário de Aplicações</h2>
        </div>

        {/* Cartão do Resumo */}
        <div className="px-4 py-6">
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between shadow-sm transition-colors duration-200">
            <div>
              <p className="text-primary text-xs font-semibold uppercase tracking-wider">
                Total Registrado
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentMonthCount} Aplicações
              </p>
            </div>
            <button 
              onClick={() => setIsCalendarModalOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white p-3 rounded-xl transition-colors shadow-lg flex items-center justify-center"
            >
              <CalendarIcon size={24} />
            </button>
          </div>
        </div>

        {/* Seções da Lista */}
        <div className="flex flex-col gap-1">
          {isLoading ? (
            <div className="px-4 py-20 text-center flex flex-col items-center">
              <Loader2 className="animate-spin text-primary mb-4" size={40} />
              <p className="text-gray-500 font-medium">Buscando seus registros...</p>
            </div>
          ) : (
            <>
              {selectedFilterDate && (
                <div className="px-4 py-2 mt-2 flex items-center justify-between mx-4 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
                   <span className="text-sm font-semibold text-primary">
                     Registros de: {formatDateFilter(selectedFilterDate)}
                   </span>
                   <button onClick={() => setSelectedFilterDate(null)} className="text-primary hover:text-primary/80 transition-colors p-1" title="Limpar filtro">
                     <X size={16} />
                   </button>
                </div>
              )}

              {filteredHistory.length === 0 ? (
                <div className="px-6 py-20 text-center flex flex-col items-center justify-center">
                  <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4 transition-colors">
                    <Clock className="text-gray-400 dark:text-gray-500" size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 italic">Diário Vazio</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 text-center max-w-[250px] leading-relaxed">
                    {selectedFilterDate 
                      ? "Nenhum registro encontrado para esta data específica." 
                      : "Seus registros de aplicação aparecerão aqui após você salvá-los."}
                  </p>
                  {!selectedFilterDate && (
                    <button 
                      onClick={openNewEntry}
                      className="mt-6 text-primary font-bold flex items-center gap-2 hover:underline"
                    >
                      <Plus size={20} />
                      Fazer primeiro registro
                    </button>
                  )}
                </div>
              ) : (
                Object.entries(groupedHistory).map(([month, entries], index) => (
                  <React.Fragment key={month}>
                    {!selectedFilterDate && (
                      <h3 className={`text-gray-500 dark:text-gray-400 text-sm font-semibold px-4 pb-2 uppercase tracking-tight ${index === 0 ? "pt-2" : "pt-6"}`}>
                        {index === 0 ? "Recentes" : month}
                      </h3>
                    )}
                    {entries.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((entry) => {
                      const relativeLabel = getRelativeDateLabel(entry.created_at);
                      return (
                        <div key={entry.id} className="group px-4 py-2 cursor-pointer" onClick={() => openEditEntry(entry)}>
                          <div className={`flex items-center gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl shadow-sm transition-shadow hover:border-gray-300 dark:hover:border-gray-600`}>
                            <div className="text-emerald-600 dark:text-emerald-500 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10 shrink-0 size-12">
                              <CheckCircle size={24} />
                            </div>
                            <div className="flex flex-col flex-1 justify-center">
                              <div className="flex justify-between items-start">
                                <p className="text-gray-900 dark:text-white text-base font-bold leading-none mb-1">
                                  {entry.nome}
                                </p>
                                {relativeLabel && (
                                  <span className="text-[10px] font-bold py-0.5 px-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full uppercase text-nowrap mt-0.5">
                                    {relativeLabel}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{entry.dose_info}</p>
                              <p className="text-gray-500 dark:text-gray-500 text-xs font-medium flex items-center gap-1">
                                <Clock size={12}/>
                                {formatDateTime(entry.created_at)}
                              </p>
                            </div>
                            <div className="flex items-center shrink-0">
                              <button
                                onClick={(e) => handleSetReminder(entry, e)}
                                className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Adicionar Alarme"
                              >
                                <Bell size={20} />
                              </button>
                              <button
                                onClick={(e) => handleDelete(entry.id, e)}
                                className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                title="Excluir"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* modal / painel inferior */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm sm:items-center">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative animate-in slide-in-from-bottom flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
               {editingId ? <Pill size={24} className="text-primary"/> : <CalendarIcon size={24} className="text-primary"/>}
               {editingId ? 'Editar Medicamento' : 'Novo Registro'}
            </h2>

            <div className="overflow-y-auto flex-1 pb-4 space-y-4">
              
              <div>
                <div className="flex justify-between items-center ml-1">
                   <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Medicamento</label>
                   <span className="text-xs text-gray-500 dark:text-gray-500">{formData.nome.length}/30</span>
                </div>
                <input 
                  type="text" 
                  maxLength={30}
                  value={formData.nome}
                  onChange={e => setFormData({...formData, nome: e.target.value})}
                  className={`w-full mt-1 p-4 bg-white dark:bg-gray-900 border ${formData.nome.length >= 30 ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:outline-none transition-colors duration-200 shadow-sm`}
                  placeholder="Ex: Dipirona, Paracetamol..."
                />
                {formData.nome.length >= 30 && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">Limite máximo de 30 caracteres atingido.</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center ml-1">
                   <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Dose Aplicada (Opcional)</label>
                   <span className="text-xs text-gray-500 dark:text-gray-500">{formData.dose.length}/70</span>
                </div>
                <input 
                  type="text" 
                  maxLength={70}
                  value={formData.dose}
                  onChange={e => setFormData({...formData, dose: e.target.value})}
                  className={`w-full mt-1 p-4 bg-white dark:bg-gray-900 border ${formData.dose.length >= 70 ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:outline-none transition-colors duration-200 shadow-sm`}
                  placeholder="Ex: 1 comp, 40 gotas..."
                />
                {formData.dose.length >= 70 && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 ml-1">Limite máximo de 70 caracteres atingido.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1 uppercase">Data</label>
                  <input 
                    type="date"
                    value={formData.data}
                    onChange={e => setFormData({...formData, data: e.target.value})}
                    className="w-full mt-1 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:outline-none transition-colors duration-200 shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1 uppercase">Hora</label>
                  <input 
                    type="time" 
                    value={formData.hora}
                    onChange={e => setFormData({...formData, hora: e.target.value})}
                    className="w-full mt-1 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:outline-none transition-colors duration-200 shadow-sm"
                  />
                </div>
              </div>

            </div>
            
            <div className="pt-4 flex gap-3 mt-auto">
              {editingId && (
                <button 
                  onClick={() => handleDelete(editingId)}
                  disabled={isSaving}
                  className="px-6 py-4 rounded-xl font-bold bg-white dark:bg-gray-800 text-red-500 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                >
                  Excluir
                </button>
              )}
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : null}
                Salvar Registro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* modal do calendário */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative animate-in zoom-in-95 flex flex-col">
            <button 
              onClick={() => setIsCalendarModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
               <CalendarIcon size={24} className="text-primary"/>
               Selecionar Data
            </h2>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-gray-900 dark:text-white font-semibold capitalize">
                   {new Date(calendarViewDate + 'T12:00:00Z').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                 </h3>
                 <div className="flex gap-2">
                   <button 
                     onClick={() => {
                        const d = new Date(calendarViewDate + 'T12:00:00Z');
                        d.setMonth(d.getMonth() - 1);
                        setCalendarViewDate(d.toISOString().split('T')[0]);
                     }}
                     className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600"
                   >
                     &lt;
                   </button>
                   <button 
                     onClick={() => {
                        const d = new Date(calendarViewDate + 'T12:00:00Z');
                        d.setMonth(d.getMonth() + 1);
                        setCalendarViewDate(d.toISOString().split('T')[0]);
                     }}
                     className="px-2 py-1 bg-white dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600"
                   >
                     &gt;
                   </button>
                 </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 dark:text-gray-500 mb-2 font-medium">
                <div>D</div><div>S</div><div>T</div><div>Q</div><div>Q</div><div>S</div><div>S</div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-sm">
                {generateCalendarDays(calendarViewDate).map((day, i) => {
                   const yearMonth = calendarViewDate.substring(0, 7);
                   
                   const hasRecord = day ? history.some(entry => {
                      const entryDate = entry.created_at.split('T')[0];
                      return entryDate === `${yearMonth}-${day.toString().padStart(2, '0')}`;
                   }) : false;

                   const isSelected = day && selectedFilterDate === `${yearMonth}-${day.toString().padStart(2, '0')}`;

                   return (
                      <div 
                         key={i} 
                         onClick={() => {
                           if (!day) return;
                           const newDate = `${yearMonth}-${day.toString().padStart(2, '0')}`;
                           setSelectedFilterDate(newDate);
                           setIsCalendarModalOpen(false);
                         }}
                         className={`p-2 rounded-lg flex flex-col items-center justify-center aspect-square relative ${
                           !day ? '' : 
                           isSelected ? 'bg-primary text-white font-bold cursor-pointer shadow-sm' :
                           'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer'
                         }`}
                      >
                         <span>{day || ''}</span>
                         {hasRecord && (
                           <div className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${isSelected ? 'bg-white' : 'bg-primary'}`}></div>
                         )}
                      </div>
                   )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Lembrete e painel inferior */}
      {isReminderModalOpen && selectedEntryForReminder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm sm:items-center transition-opacity">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative animate-in slide-in-from-bottom flex flex-col">
            <button 
              onClick={() => setIsReminderModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
               <Bell size={24} className="text-primary"/>
               Agendar Lembrete
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">Receba notificações locais para sua aplicação de <strong className="text-gray-900 dark:text-white">{selectedEntryForReminder.nome}</strong>.</p>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1 uppercase">Frequência</label>
                <select 
                  value={reminderData.frequencia}
                  onChange={e => setReminderData({...reminderData, frequencia: e.target.value})}
                  className="w-full mt-1 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none transition-colors duration-200 shadow-sm"
                >
                  <option value="uma_vez">Apenas uma vez</option>
                  <option value="diariamente">Diariamente (a cada 24h)</option>
                  <option value="cada_12h">A cada 12 horas</option>
                  <option value="cada_8h">A cada 8 horas</option>
                  <option value="cada_6h">A cada 6 horas</option>
                  <option value="semanalmente">Semanalmente</option>
                  <option value="mensalmente">Mensalmente</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 ml-1 uppercase">Horário</label>
                <input 
                  type="time" 
                  value={reminderData.hora}
                  onChange={e => setReminderData({...reminderData, hora: e.target.value})}
                  className="w-full mt-1 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:outline-none transition-colors duration-200 shadow-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-auto">
              <button 
                onClick={handleSaveReminder}
                className="flex-1 py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
              >
                Salvar Lembrete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}