import React, { useState } from 'react';
import { X, Loader2, LogIn } from 'lucide-react';
import { loginWithEmail } from '../services/pocketbase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalone?: boolean; // New prop for standalone page mode
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, isStandalone = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  if (!isOpen && !isStandalone) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      await loginWithEmail(email, password);
      // Auth success is handled by the listener in App.tsx
    } catch (err: any) {
      setAuthError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      setAuthLoading(false);
    }
  };

  const containerClasses = isStandalone 
    ? "relative w-full max-w-sm z-10" // Simple container for standalone
    : "fixed inset-0 z-50 flex items-center justify-center p-4"; // Modal container

  return (
    <div className={containerClasses}>
      {/* Backdrop (Only for Modal Mode) */}
      {!isStandalone && (
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}
      
      <div className={`relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm animate-enter z-50 ${isStandalone ? 'mx-auto' : ''}`}>
        {/* Close Button (Only for Modal Mode) */}
        {!isStandalone && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        )}

        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
          <span className="text-white font-bold text-3xl">W</span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Tekrar Hoşgeldin</h2>
        <p className="text-gray-500 mb-6 text-center text-sm">Güvenli sohbete devam etmek için giriş yap.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="text" 
              placeholder="Email veya Kullanıcı Adı" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900"
              required
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Şifre" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none transition-all text-gray-900"
              required
            />
          </div>
          
          {authError && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{authError}</p>}

          <button 
            type="submit"
            disabled={authLoading}
            className="w-full bg-black text-white py-3 rounded-xl font-bold uppercase tracking-wide hover:bg-gray-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
          >
            {authLoading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
            Giriş Yap
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
            Hesabın yok mu? <a href="#" className="text-green-600 font-bold hover:underline">Başvuru Yap</a>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;