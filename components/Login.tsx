"use client";
import React, { useState, useEffect } from 'react';
import { Syringe, Mail, Lock, Loader2, AlertCircle, User as UserIcon, Calendar, Weight, Briefcase, CheckCircle2, XCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthProvider';

export default function Login() {
  const { setMockUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false); // Novo estado para o modo de recuperação
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // estados do forms
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [profession, setProfession] = useState('');

  // estados de visibilidade da senha
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Estado da validação da Senha
  const [passValidations, setPassValidations] = useState({
    minChar: false,
    upperCase: false,
    specialChar: false,
    match: false
  });

  // Valida a força da senha em tempo real usando RegEx sempre que o usuário digita algo no modo de cadastro
  useEffect(() => {
    if (!isLogin && !isResetPassword) {
      setPassValidations({
        minChar: password.length >= 8,
        upperCase: /[A-Z]/.test(password), // Verifica se tem pelo menos uma letra maiúscula
        specialChar: /[^a-zA-Z0-9]/.test(password), // Verifica se tem caractere especial (aceita barra e outros)
        match: password === confirmPassword && password.length > 0
      });
    }
  }, [password, confirmPassword, isLogin, isResetPassword]);

  // Define se o formulário é válido
  let isFormValid = false;
  if (isResetPassword) {
    isFormValid = email.length > 0;
  } else if (isLogin) {
    isFormValid = email.length > 0 && password.length > 0;
  } else {
    isFormValid = fullName.length > 0 && email.length > 0 && birthDate.length > 0 && weight.length > 0 && profession.length > 0 && 
                  passValidations.minChar && passValidations.upperCase && 
                  passValidations.specialChar && passValidations.match;
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isResetPassword) {
        // Envia o e-mail de recuperação de senha pelo Supabase
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/update-password`,
        });
        if (resetError) throw resetError;
        setMessage('Se esse e-mail estiver cadastrado, você receberá um link para redefinir sua senha.');
      } else if (isLogin) {
        // logar o usuário
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        // salva os dados dentro do user_metadata do Supabase
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              birth_date: birthDate,
              weight: weight,
              profession: profession,
            }
          }
        });
        if (signUpError) throw signUpError;
        setMessage('Cadastro realizado com sucesso! Verifique seu e-mail para confirmar seu registro.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-start justify-center p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-200 overflow-y-auto">
      <div className="w-full max-w-sm space-y-6 pt-12 pb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
            <Syringe className="text-primary w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">DoseCerto</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm font-medium">
            Seu assistente pessoal de dosagem
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
              <span className="text-xs text-emerald-800 dark:text-emerald-200">{message}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            
            {!isLogin && !isResetPassword && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="text-gray-400 dark:text-gray-500" size={18} />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      // limpa a entrada, permitindo apenas letras e espaços
                      onChange={(e) => setFullName(e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))}
                      required
                      maxLength={40}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all text-sm"
                      placeholder="Ex: João da Silva"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Nascimento</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="text-gray-400 dark:text-gray-500" size={18} />
                      </div>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        required
                        max="9999-12-31"
                        className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-all text-xs"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Peso (kg)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Weight className="text-gray-400 dark:text-gray-500" size={18} />
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={weight}
                        // encontra tudo que não é nuero e substitui por vazio, travando o input apenas para dígitos
                        onChange={(e) => setWeight(e.target.value.replace(/\D/g, ''))}
                        required
                        maxLength={3}
                        className="w-full pl-10 pr-3 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-all text-sm placeholder-gray-400"
                        placeholder="Ex: 75"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Profissão</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="text-gray-400 dark:text-gray-500" size={18} />
                    </div>
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))}
                      required
                      maxLength={30}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all text-sm"
                      placeholder="Sua profissão"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400 dark:text-gray-500" size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={50}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all text-sm"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {!isResetPassword && (
              <div className="space-y-1">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Senha</label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsResetPassword(true);
                        setError(null);
                        setMessage(null);
                      }}
                      className="text-[10px] font-bold text-primary hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400 dark:text-gray-500" size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    maxLength={32}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm transition-all text-sm border-gray-200"
                    placeholder={isLogin ? "Sua senha" : "Mínimo 8 caracteres"}
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
            )}

            {!isLogin && !isResetPassword && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider ml-1">Confirmar Senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    maxLength={32}
                    className="w-full px-4 pr-12 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-white transition-all text-sm"
                    placeholder="Repita a senha"
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
              </>
            )}

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2 shadow-lg shadow-primary/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isResetPassword ? 'Enviar Recuperação' : isLogin ? 'Entrar Agora' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                if (isResetPassword) {
                  setIsResetPassword(false);
                  setIsLogin(true);
                } else {
                  setIsLogin(!isLogin);
                }
                setError(null);
                setMessage(null);
              }}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
            >
              {isResetPassword ? 'Voltar para o Login' : isLogin ? 'Não tem conta? Cadastrar-se' : 'Já tem uma conta? Entrar'}
            </button>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/50 text-center">
            <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed">
              🔒 Conexão segura. Seus dados estão protegidos por criptografia de ponta a ponta e em conformidade com a LGPD.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}