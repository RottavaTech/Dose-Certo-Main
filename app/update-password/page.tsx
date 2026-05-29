"use client";
import React, { useState, useEffect } from 'react';
import { Syringe, Lock, Loader2, AlertCircle, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passValidations, setPassValidations] = useState({
    minChar: false,
    upperCase: false,
    specialChar: false,
    match: false
  });

  useEffect(() => {
    setPassValidations({
      minChar: password.length >= 8,
      upperCase: /[A-Z]/.test(password),
      specialChar: /[^a-zA-Z0-9]/.test(password),
      match: password === confirmPassword && password.length > 0
    });
  }, [password, confirmPassword]);

  const isFormValid = passValidations.minChar && passValidations.upperCase && passValidations.specialChar && passValidations.match;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Atualiza a senha direto no cofre do Supabase
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      setMessage('Senha atualizada com sucesso! Redirecionando...');
      
      // Aguarda 2 segundos para o usuário ler a mensagem de sucesso e joga ele pro app principal
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao atualizar a senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <Syringe className="text-primary w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Redefinir Senha</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
            Crie uma nova senha segura
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl transition-colors duration-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg flex items-start gap-2 transition-colors duration-200">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
              <span className="text-xs text-red-800 dark:text-red-200">{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg flex items-start gap-2 transition-colors duration-200">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <span className="text-xs text-emerald-800 dark:text-emerald-200">{message}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Nova Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="text-gray-400 dark:text-gray-500" size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={32}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 shadow-sm transition-all text-sm"
                  placeholder="Mínimo 8 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Confirmar Nova Senha</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  maxLength={32}
                  className="w-full px-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-all text-sm"
                  placeholder="Repita a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/50 space-y-2">
               <div className="flex items-center gap-2">
                  {passValidations.minChar ? <CheckCircle2 className="text-emerald-500" size={14}/> : <XCircle className="text-gray-400" size={14}/>}
                  <span className={`text-[10px] font-bold uppercase transition-colors ${passValidations.minChar ? 'text-emerald-600' : 'text-gray-500'}`}>8+ Caracteres</span>
               </div>
               <div className="flex items-center gap-2">
                  {passValidations.upperCase ? <CheckCircle2 className="text-emerald-500" size={14}/> : <XCircle className="text-gray-400" size={14}/>}
                  <span className={`text-[10px] font-bold uppercase transition-colors ${passValidations.upperCase ? 'text-emerald-600' : 'text-gray-500'}`}>1 Letra Maiúscula</span>
               </div>
               <div className="flex items-center gap-2">
                  {passValidations.specialChar ? <CheckCircle2 className="text-emerald-500" size={14}/> : <XCircle className="text-gray-400" size={14}/>}
                  <span className={`text-[10px] font-bold uppercase transition-colors ${passValidations.specialChar ? 'text-emerald-600' : 'text-gray-500'}`}>1 Caractere Especial</span>
               </div>
               <div className="flex items-center gap-2">
                  {passValidations.match ? <CheckCircle2 className="text-emerald-500" size={14}/> : <XCircle className="text-gray-400" size={14}/>}
                  <span className={`text-[10px] font-bold uppercase transition-colors ${passValidations.match ? 'text-emerald-600' : 'text-gray-500'}`}>Senhas Iguais</span>
               </div>
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Salvar Nova Senha'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}