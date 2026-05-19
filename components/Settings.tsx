"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Syringe, Moon, Sun, FileText, Shield, Info, ChevronDown, LogOut, User as UserIcon, Camera, Loader2, Edit2, X, Briefcase, Calendar, Weight } from "lucide-react";
import { useAuth } from "./AuthProvider";
import Image from "next/image";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";

interface ProfileData {
  full_name: string;
  avatar_url: string;
  birth_date?: string;
  weight?: string;
  profession?: string;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    avatar_url: "",
    birth_date: "",
    weight: "",
    profession: ""
  });

  const [editFormData, setEditFormData] = useState<ProfileData>({
    full_name: "",
    avatar_url: "",
    birth_date: "",
    weight: "",
    profession: ""
  });

  const [uploading, setUploading] = useState(false);

  // Preenche os estados locais com os dados do usuário assim que ele loga
  useEffect(() => {
    if (user?.user_metadata) {
      const meta = user.user_metadata;
      const initialProfile = {
        full_name: meta.full_name || "",
        avatar_url: meta.avatar_url || "",
        birth_date: meta.birth_date || "",
        weight: meta.weight || "",
        profession: meta.profession || ""
      };
      setProfile(initialProfile);
      setEditFormData(initialProfile);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      setIsSaving(true);
      // Atualiza os dados dentro do objeto user_metadata no Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: editFormData.full_name,
          birth_date: editFormData.birth_date,
          weight: editFormData.weight,
          profession: editFormData.profession,
        }
      });

      if (error) throw error;
      
      setProfile(editFormData);
      setIsEditModalOpen(false);
      alert('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert('Erro ao atualizar o perfil!');
    } finally {
      setIsSaving(false);
    }
  };

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Selecione uma imagem.');
      }
      const file = event.target.files[0];
      
      // Cria uma URL temporária local para preview imediato da imagem antes de fazer o upload real
      const objectUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, avatar_url: objectUrl }));
      
      // Salva a referência da imagem no metadata do usuário
      await supabase.auth.updateUser({
        data: { avatar_url: objectUrl }
      });

    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploading(false);
    }
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (!mounted) return null;

  return (
    <div className="w-full pb-24 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-200">
      {/* Cabecalho */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
        <div className="px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Syringe className="text-primary" size={28} />
            <h1 className="font-bold text-lg tracking-tight">DoseCerto</h1>
          </div>
        </div>
      </header>

      {/* area de conteudo */}
      <main className="pt-6 pb-6 px-4 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ajustes & Perfil</h2>
        
        {/* Secao do perfil */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm transition-colors duration-200">
          <div className="flex flex-col items-center">
            <div className="relative group mb-4">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-md flex items-center justify-center relative transition-colors duration-200">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Avatar" fill referrerPolicy="no-referrer" className="object-cover" />
                ) : (
                  <UserIcon size={48} className="text-gray-300 dark:text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-1 right-1 p-2.5 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-lg hover:scale-110 active:scale-95">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={18} />}
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={uploadAvatar}
                  disabled={uploading}
                />
              </label>
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.full_name || "Usuário DoseCerto"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{user?.email}</p>
              {profile.profession && (
                <p className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full inline-block mt-2 uppercase tracking-tight">
                  {profile.profession}
                </p>
              )}
            </div>

            <button
              onClick={handleOpenEdit}
              className="mt-6 px-6 py-3 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
            <Edit2 size={16} />
              Editar Perfil
            </button>
          </div>
        </div>

        {/* lista dos menus */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 overflow-hidden shadow-sm transition-colors duration-200">
          
          {/* alternação de modo escuro/claro */}
          <div className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Modo Escuro</span>
            </div>
            <label className="relative flex h-[28px] w-[50px] cursor-pointer items-center rounded-full border-none bg-gray-200 dark:bg-primary px-1 transition-all" onClick={(e) => { e.preventDefault(); toggleTheme(); }}>
              <div className={`h-[22px] w-[22px] rounded-full bg-white shadow-md transition-all duration-300 ${theme === 'dark' ? 'translate-x-[20px]' : 'translate-x-0'}`}></div>
            </label>
          </div>

          {/* Termos de Responsabilidade */}
          <details className="group">
            <summary className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer list-none">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <FileText size={20} />
                </div>
                <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Responsabilidade</span>
              </div>
              <ChevronDown className="text-gray-400 dark:text-gray-500 group-open:rotate-180 transition-transform" size={20} />
            </summary>
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                O DoseCerto é uma ferramenta de auxílio matemático. Nunca altere suas doses sem a supervisão expressa do seu médico.
              </p>
            </div>
          </details>

          {/* Política de Privacidade */}
          <details className="group">
            <summary className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer list-none">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Shield size={20} />
                </div>
                <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">Privacidade</span>
              </div>
              <ChevronDown className="text-gray-400 dark:text-gray-500 group-open:rotate-180 transition-transform" size={20} />
            </summary>
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                Seus dados são criptografados e não são compartilhados com redes de anúncios ou outros usuários.
              </p>
            </div>
          </details>
        </div>

        <button 
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-2xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-all active:scale-[0.98]"
        >
          <LogOut size={20} />
          Encerrar Sessão
        </button>

        <div className="pt-2 text-center">
          <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Build Production v1.1.0</p>
        </div>
      </main>

      {/* Modal de Edição de Perfil */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-t-3xl sm:rounded-2xl border-t sm:border border-gray-200 dark:border-gray-800 shadow-2xl p-6 relative animate-in slide-in-from-bottom flex flex-col max-h-[90vh]">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-800 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
               <UserIcon size={24} className="text-primary"/>
               Ajustar Perfil
            </h2>

            <div className="overflow-y-auto flex-1 pb-4 space-y-5">
              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">Nome Completo</label>
                <input 
                  type="text" 
                  maxLength={40}
                  value={editFormData.full_name}
                  onChange={e => setEditFormData({...editFormData, full_name: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')})}
                  className="w-full mt-1 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                  placeholder="Seu nome"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">Nascimento</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="date" 
                      value={editFormData.birth_date}
                      onChange={e => setEditFormData({...editFormData, birth_date: e.target.value})}
                      max="9999-12-31"
                      className="w-full mt-1 p-4 pl-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">Peso (kg)</label>
                  <div className="relative">
                    <Weight size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      inputMode="numeric"
                      maxLength={3}
                      value={editFormData.weight}
                      onChange={e => setEditFormData({...editFormData, weight: e.target.value.replace(/\D/g, '')})}
                      className="w-full mt-1 p-4 pl-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                      placeholder="Peso"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wider">Profissão</label>
                <div className="relative">
                  <Briefcase size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    maxLength={30}
                    value={editFormData.profession}
                    onChange={e => setEditFormData({...editFormData, profession: e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')})}
                    className="w-full mt-1 p-4 pl-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                    placeholder="Sua profissão"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 mt-auto">
              <button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full py-4 rounded-xl font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="animate-spin" size={20} />}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}