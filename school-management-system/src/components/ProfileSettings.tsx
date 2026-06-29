import React, { useState } from 'react';
import { UserCredential } from '../types';
import { Camera, Check, Globe, Palette, User, Mail, Sparkles, X, Heart, Shield } from 'lucide-react';

interface ProfileSettingsProps {
  currentUser: UserCredential;
  onUpdate: (user: UserCredential) => void;
  onClose: () => void;
}

const AVATARS = [
  '👨‍🏫', '👩‍🏫', '👨‍💻', '👩‍💻', '👤', '🦸', '🥷', '🦊', '🦁', '🦉', '🐼', '🎨', '🌟', '⚡', '🔥', '💖', '💎', '🚀'
];

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ currentUser, onUpdate, onClose }) => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [language, setLanguage] = useState<'somali' | 'english'>(currentUser.language || 'somali');
  const [theme, setTheme] = useState<'light' | 'dark'>(currentUser.theme || 'light');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '👤');

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = () => {
    onUpdate({
      ...currentUser,
      name,
      email,
      language,
      theme,
      avatarUrl
    });
    onClose();
  };

  const isSomali = language === 'somali';

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in select-none">
      {/* Backdrop overlay trigger for closing */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-up Container on Mobile, Centered Card on Desktop */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] sm:rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh] sm:max-h-[90vh] z-10 animate-slide-up">
        
        {/* Mobile Swipe-like Top Pill indicator */}
        <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-750 rounded-full mx-auto mb-5 block sm:hidden shrink-0" />

        {/* Header with Close Icon */}
        <div className="flex items-center justify-between border-b pb-4 mb-4 border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl shadow-inner inline-block">{avatarUrl}</span>
            <div>
              <h2 className="text-base font-black tracking-tight font-sans text-slate-900 dark:text-white">
                {isSomali ? 'Habaynta Profile-ka' : 'Profile Settings'}
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {isSomali ? 'Astaantaada gaarka ah' : 'Your Personal Identity'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Contents */}
        <div className="space-y-5 overflow-y-auto pr-1 pb-4 flex-1">
          
          {/* Large Avatar Options Grid - Extremely touch friendly for thumb scroll */}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block mb-2">
              {isSomali ? 'Dooro Astaanta (Avatar-ka)' : 'Choose Avatar Icon'}
            </span>
            <div className="flex gap-2.5 overflow-x-auto py-2.5 px-1 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
              {AVATARS.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setAvatarUrl(av)}
                  className={`h-14 w-14 text-2xl flex items-center justify-center rounded-2xl transition-all shrink-0 border transform active:scale-95 ${
                    avatarUrl === av 
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-110 ring-4 ring-indigo-100 dark:ring-indigo-950' 
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200/60 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Form Inputs with Clear Left Icons */}
          <div className="space-y-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                {isSomali ? 'Magacaaga' : 'Full Name'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isSomali ? 'Geli magaca' : 'Enter name'}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                {isSomali ? 'Cinwaanka E-mailka' : 'Email Address'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Geli e-mail"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Preferences Cards with Huge Touch Targets - Perfect for one-hand usage! */}
          <div className="grid grid-cols-1 gap-4 pt-2">
            
            {/* Language Preference Card */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-300">
                <Globe className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {isSomali ? 'Dooro Luqadda' : 'Select Language'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLanguage('somali')}
                  className={`py-3 px-4 text-xs font-bold rounded-xl transition-all border flex items-center justify-center gap-1.5 active:scale-95 ${
                    language === 'somali'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  🇸🇴 Soomaali
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('english')}
                  className={`py-3 px-4 text-xs font-bold rounded-xl transition-all border flex items-center justify-center gap-1.5 active:scale-95 ${
                    language === 'english'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  🇬🇧 English
                </button>
              </div>
            </div>

            {/* Theme Preference Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-300">
                <Palette className="w-4 h-4 shrink-0 text-slate-600 dark:text-slate-400" />
                <span className="text-[11px] font-black uppercase tracking-wider">
                  {isSomali ? 'Muuqaalka (Theme)' : 'Appearance Theme'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleThemeChange('light')}
                  className={`py-3 px-4 text-xs font-bold rounded-xl transition-all border flex items-center justify-center gap-1.5 active:scale-95 ${
                    theme === 'light'
                      ? 'bg-white dark:bg-slate-850 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white shadow-sm ring-2 ring-indigo-500'
                      : 'bg-slate-100/50 dark:bg-slate-900/50 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
                >
                  ☀️ {isSomali ? 'Caddaan' : 'Light'}
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeChange('dark')}
                  className={`py-3 px-4 text-xs font-bold rounded-xl transition-all border flex items-center justify-center gap-1.5 active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-slate-900 dark:bg-indigo-600 border-slate-800 dark:border-indigo-500 text-white shadow-md shadow-black/10 ring-2 ring-indigo-500'
                      : 'bg-slate-100/50 dark:bg-slate-900/50 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
                >
                  🌙 {isSomali ? 'Madow' : 'Dark'}
                </button>
              </div>
            </div>

            {/* Quick Badge info */}
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center gap-2.5">
              <span className="p-1.5 bg-emerald-500 text-white rounded-lg text-xs font-black">✓</span>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-normal font-semibold">
                {isSomali 
                  ? 'Isbeddeladani waxay toos ugu kaydsami doonaan qalabkaaga (Secure Local Sync).' 
                  : 'Changes are securely saved and synchronized in real-time.'}
              </p>
            </div>

          </div>
        </div>

        {/* Large Sticky Action Buttons at bottom - extremely comfortable for the thumb */}
        <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={onClose}
            className="py-3.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            {isSomali ? 'Laabo' : 'Cancel'}
          </button>
          
          <button
            onClick={handleSave}
            className="py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4" />
            {isSomali ? 'Keydso' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
};
