import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Users, FileCheck, Briefcase, Terminal, ArrowRight, UserPlus, Lock, ShieldCheck, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-[#00ff9d] selection:text-black overflow-x-hidden">
      
      {/* --- GLOBAL HEADER (PDF Top Bar Style) --- */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-3 bg-[#050505]/90 backdrop-blur-md border-b border-white/5 text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-wider">
        <div>
          {formattedDate} {formattedTime}
        </div>
        <div>
          Workigom Chat | Güvenli Sohbet Platformu
        </div>
      </header>

      {/* --- PAGE 1: HERO SECTION --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 overflow-hidden border-b border-gray-900/30">
        
        {/* Background Ambient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-[#050505] to-[#050505] pointer-events-none"></div>

        {/* System Status Pill */}
        <div className="mb-16 animate-enter z-10">
          <div className="flex items-center gap-3 px-6 py-2 rounded-sm border border-[#00ff9d]/30 bg-[#00ff9d]/5 text-[11px] font-mono tracking-[0.2em] text-[#00ff9d] uppercase shadow-[0_0_20px_rgba(0,255,157,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff9d] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff9d]"></span>
            </span>
            SİSTEM DURUMU: GÜVENLİ ERİŞİM AKTİF
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-6xl mx-auto space-y-2 z-10 animate-enter" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.85] transform -skew-x-3">
            <span className="block text-white">GERÇEK İNSANLARLA,</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-emerald-400 drop-shadow-[0_0_35px_rgba(0,255,157,0.5)] mt-2">
              GÜVENLİ SOHBET
            </span>
          </h1>
        </div>

        {/* Divider Line & Subtext */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-16 mb-12 animate-enter max-w-2xl" style={{ animationDelay: '0.2s' }}>
           <div className="hidden md:block w-1 h-16 bg-[#00ff9d] shadow-[0_0_15px_rgba(0,255,157,0.8)]"></div>
           <div className="md:hidden w-16 h-1 bg-[#00ff9d] shadow-[0_0_15px_rgba(0,255,157,0.8)] mb-4"></div>
           <p className="text-left text-gray-400 text-sm md:text-lg font-mono leading-relaxed">
             Sabıka kaydı temiz, çalışan ve kimliği doğrulanmış kişilerle<br />
             huzurlu, seviyeli ve <span className="text-white font-bold">gerçek sohbet ortamı.</span>
           </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-6 animate-enter w-full max-w-lg" style={{ animationDelay: '0.3s' }}>
          <button 
            onClick={onLoginClick}
            className="w-full group h-14 bg-[#00ff9d] hover:bg-emerald-400 text-black font-black text-sm tracking-[0.15em] uppercase transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(0,255,157,0.3)] flex items-center justify-center gap-2"
          >
             <ArrowRight className="w-5 h-5" /> Giriş Yap
          </button>
          
          <button 
             onClick={onLoginClick}
             className="w-full group h-14 border border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 font-black text-sm tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2"
          >
             <UserPlus className="w-5 h-5" /> Başvur ve Katıl
          </button>
        </div>
      </section>

      {/* --- PAGE 2: SECURITY HEADER SECTION --- */}
      <section className="py-40 px-4 flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center z-10">
           <div className="inline-flex items-center justify-center mb-10 relative">
              <div className="absolute inset-0 bg-red-600/20 blur-xl rounded-full"></div>
              <ShieldCheck className="w-20 h-20 text-white fill-red-600 relative z-10" strokeWidth={1.5} />
           </div>
           <h2 className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter text-white transform -skew-x-3 drop-shadow-2xl">
             GÜVENLİK BİZİM ÖNCELİĞİMİZ
           </h2>
           <div className="mt-10 mx-auto w-40 h-1.5 bg-[#00ff9d] rounded-full shadow-[0_0_20px_rgba(0,255,157,0.8)]"></div>
        </div>
      </section>

      {/* --- PAGE 3: FEATURES GRID --- */}
      <section className="py-24 px-4 bg-[#080808]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            
            {/* Feature 1 */}
            <div className="border border-gray-800 bg-[#0a0a0c] p-10 group hover:border-[#00ff9d]/50 transition-colors duration-500 h-full flex flex-col">
              <div className="w-16 h-16 border border-gray-700 rounded-lg flex items-center justify-center mb-8 group-hover:border-[#00ff9d] transition-colors bg-[#00ff9d]/5">
                <Users className="w-8 h-8 text-[#00ff9d]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-8 uppercase tracking-wide">GERÇEK KİŞİLER</h3>
              <ul className="space-y-5 text-sm text-gray-400 font-mono w-full">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0" />
                  <span>Kimlik doğrulama zorunlu</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0" />
                  <span>Sahte hesaplara geçit yok</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0" />
                  <span>Aktif moderasyon ve denetim</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="border border-gray-800 bg-[#0a0a0c] p-10 group hover:border-[#00ff9d]/50 transition-colors duration-500 h-full flex flex-col">
              <div className="w-16 h-16 border border-gray-700 rounded-lg flex items-center justify-center mb-8 group-hover:border-[#00ff9d] transition-colors bg-[#00ff9d]/5">
                <FileCheck className="w-8 h-8 text-[#00ff9d]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-8 uppercase tracking-wide">SABIKA KAYDI KONTROLÜ</h3>
              <ul className="space-y-5 text-sm text-gray-400 font-mono w-full">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0" />
                  <span>Temiz sicil olmayan kabul edilmez</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0" />
                  <span>Topluluk güvenliği esastır</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0" />
                  <span>Düzenli periyodik denetimler</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="border border-gray-800 bg-[#0a0a0c] p-10 group hover:border-[#00ff9d]/50 transition-colors duration-500 h-full flex flex-col">
              <div className="w-16 h-16 border border-gray-700 rounded-lg flex items-center justify-center mb-8 group-hover:border-[#00ff9d] transition-colors bg-[#00ff9d]/5">
                <Briefcase className="w-8 h-8 text-[#00ff9d]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-8 uppercase tracking-wide">ÇALIŞAN OLMA ZORUNLULUĞU</h3>
              <ul className="space-y-5 text-sm text-gray-400 font-mono w-full">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0" />
                  <span>Aktif çalışan bireyler</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0" />
                  <span>Daha saygılı ve bilinçli topluluk</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d] shrink-0" />
                  <span>Profesyonel sosyal ağ</span>
                </li>
              </ul>
            </div>
        </div>
      </section>

      {/* --- PAGE 4: MISSION & TERMINAL --- */}
      <section className="min-h-screen py-24 px-4 bg-[#050505] flex items-center justify-center border-y border-gray-900/50">
        <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left: Text Content */}
          <div className="lg:w-1/2 space-y-10">
            <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white transform -skew-x-3">
              NEDEN BURADAYIZ?
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 font-mono leading-relaxed">
              İnternette anonimlik çoğu zaman güvensizliği beraberinde getirir. <span className="text-[#00ff9d] italic font-bold">Biz bu döngüyü kırmak için buradayız.</span>
            </p>
            
            <div className="pl-6 border-l-4 border-[#00ff9d] py-6 bg-[#00ff9d]/5 rounded-r-lg">
               <p className="text-gray-300 italic text-lg leading-relaxed font-serif">
                 Amacımız; gerçek insanların, gerçek sohbetler yaptığı, seviyeli, güvenli ve saygılı bir ortam oluşturmak.
               </p>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 text-xs font-black text-[#00ff9d] uppercase tracking-[0.2em]">
                <div className="w-1.5 h-6 bg-[#00ff9d]"></div> SOHBET KÜLTÜRÜMÜZ
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-400 font-mono">
                <div className="flex items-center gap-2 group">
                  <ChevronRight size={16} className="text-[#00ff9d]" /> “Naber millet?” samimiyeti
                </div>
                <div className="flex items-center gap-2 group">
                  <ChevronRight size={16} className="text-[#00ff9d]" /> Hakaret, taciz, spam yok
                </div>
                <div className="flex items-center gap-2 group">
                  <ChevronRight size={16} className="text-[#00ff9d]" /> Geyik serbest, saygı şart
                </div>
                <div className="flex items-center gap-2 group">
                  <ChevronRight size={16} className="text-[#00ff9d]" /> Moderasyon her an aktif
                </div>
              </div>
            </div>
          </div>

          {/* Right: Terminal */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-[#0a0a12] rounded-xl shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-gray-800 overflow-hidden font-mono text-xs md:text-sm relative group hover:border-[#00ff9d]/30 transition-colors">
              
              {/* Terminal Header */}
              <div className="bg-[#16161e] px-4 py-3 flex items-center justify-between border-b border-gray-800">
                <div className="flex gap-2">
                   <div className="w-3 h-3 bg-red-500/80 rounded-full"></div>
                   <div className="w-3 h-3 bg-yellow-500/80 rounded-full"></div>
                   <div className="w-3 h-3 bg-green-500/80 rounded-full"></div>
                </div>
                <div className="text-gray-500 text-[10px] tracking-wide truncate ml-4">
                  Status: connected to Workigom (irc.workigomchat.online)
                </div>
                <div className="flex gap-2 text-gray-600">
                  <div className="w-3 h-3 border border-current rounded-sm"></div>
                </div>
              </div>
              
              {/* Terminal Body */}
              <div className="p-6 md:p-8 space-y-3 text-gray-300 leading-relaxed min-h-[360px] bg-[#0c0c10]">
                <p className="flex gap-2">
                  <span className="text-blue-500 font-bold">***</span>
                  <span>Local host: workigomchat.online (127.0.0.1)</span>
                </p>
                <p className="flex gap-2 mb-6">
                  <span className="text-blue-500 font-bold">***</span>
                  <span>Checking identity protocol...</span>
                </p>
                
                <div className="space-y-2 pl-4 border-l border-gray-800 ml-1">
                  <p className="flex items-center gap-3">
                    <CheckCircle size={14} className="shrink-0 text-[#00ff9d]" /> 
                    <span className="text-gray-400">Identity verified:</span> <span className="text-white font-bold">[Kimlik Onaylandı]</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <CheckCircle size={14} className="shrink-0 text-[#00ff9d]" /> 
                    <span className="text-gray-400">Criminal record:</span> <span className="text-white font-bold">[Sicil Temiz]</span>
                  </p>
                  <p className="flex items-center gap-3 mb-6">
                    <CheckCircle size={14} className="shrink-0 text-[#00ff9d]" /> 
                    <span className="text-gray-400">Professional status:</span> <span className="text-white font-bold">[Aktif Çalışan]</span>
                  </p>
                </div>
                
                <p className="text-purple-400 pt-6">
                  [ Sistem ]: Sohbete katılmaya yetkiniz var. İyi sohbetler <span className="text-yellow-400">☺</span>
                </p>
                <p className="text-gray-500 mt-2 flex items-center gap-1">
                  Kanal girişi bekleniyor...<span className="w-2 h-4 bg-gray-500 animate-pulse"></span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- PAGE 5: CTA --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-[#050505]">
        <div className="z-10 space-y-4">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter text-white transform -skew-x-3">
              GÜVENLİ SOHBET BİR
            </h2>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter text-white pb-8 transform -skew-x-3">
              AYRICALIKTIR
            </h2>
            
            <p className="text-[#00ff9d] font-mono tracking-[0.4em] text-xs md:text-sm mb-16 uppercase">
              w o r k i g o m c h a t . o n l i n e
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-2xl mx-auto">
              <button 
                onClick={onLoginClick}
                className="bg-[#00ff9d] hover:bg-emerald-400 text-black h-16 px-10 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,157,0.3)] w-full sm:w-auto"
              >
                  <Lock size={18} /> Başvur ve Katıl
              </button>
              <button 
                className="bg-transparent border border-gray-800 hover:border-white text-gray-500 hover:text-white h-16 px-10 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-colors w-full sm:w-auto"
              >
                  <Shield size={18} /> Kurallar & Gizlilik
              </button>
            </div>
        </div>

        {/* Huge Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-50">
           <span className="text-[20vw] font-black text-[#08080a] leading-none select-none whitespace-nowrap block">
              WORKIGOM
           </span>
        </div>
      </section>

      {/* --- PAGE 6: FOOTER --- */}
      <footer className="bg-[#030303] py-8 px-6 border-t border-gray-900 text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-[0.2em] flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="order-2 md:order-1">
            W O R K I G O M &nbsp; N E T W O R K &nbsp; S Y S T E M &nbsp; © &nbsp; 2 0 2 4
         </div>
         <div className="flex gap-8 order-1 md:order-2 font-bold">
            <a href="#" className="hover:text-[#00ff9d] transition-colors">YÖNETİCİ GİRİŞİ</a>
            <a href="#" className="hover:text-[#00ff9d] transition-colors">DESTEK</a>
            <a href="#" className="hover:text-[#00ff9d] transition-colors">KVKK</a>
         </div>
      </footer>

    </div>
  );
};

export default LandingPage;