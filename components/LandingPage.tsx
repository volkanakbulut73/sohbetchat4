import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Users, FileCheck, Briefcase, Terminal, ArrowRight, UserPlus, Lock, ShieldCheck } from 'lucide-react';

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
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 py-3 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-wider">
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
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black italic tracking-tighter leading-[0.85]">
            <span className="block text-white transform -skew-x-6">GERÇEK İNSANLARLA,</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00ff9d] to-emerald-400 drop-shadow-[0_0_35px_rgba(0,255,157,0.5)] transform -skew-x-6 mt-2">
              GÜVENLİ SOHBET
            </span>
          </h1>
        </div>

        {/* Divider Line */}
        <div className="flex items-center gap-4 mt-12 mb-8 animate-enter" style={{ animationDelay: '0.2s' }}>
           <div className="w-1 h-16 bg-[#00ff9d] shadow-[0_0_15px_rgba(0,255,157,0.8)]"></div>
           <p className="text-left text-gray-400 text-sm md:text-lg font-mono leading-relaxed max-w-xl">
             Sabıka kaydı temiz, çalışan ve kimliği doğrulanmış kişilerle<br />
             huzurlu, seviyeli ve <span className="text-white font-bold">gerçek sohbet ortamı.</span>
           </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-6 animate-enter" style={{ animationDelay: '0.3s' }}>
          <button 
            onClick={onLoginClick}
            className="group min-w-[200px] h-14 bg-[#00ff9d] hover:bg-emerald-400 text-black font-bold text-sm tracking-widest uppercase transition-all duration-300 transform hover:scale-105 shadow-[0_0_30px_rgba(0,255,157,0.4)] flex items-center justify-center gap-2"
          >
             <ArrowRight className="w-5 h-5" /> Giriş Yap
          </button>
          
          <button className="group min-w-[200px] h-14 border border-[#00ff9d] text-[#00ff9d] hover:bg-[#00ff9d]/10 font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2">
             <UserPlus className="w-5 h-5" /> Başvur ve Katıl
          </button>
        </div>
      </section>

      {/* --- PAGE 2: SECURITY HEADER SECTION --- */}
      <section className="py-32 px-4 flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center z-10">
           <div className="inline-flex items-center justify-center mb-8">
              <ShieldCheck className="w-16 h-16 text-white fill-red-600 mr-4" />
           </div>
           <h2 className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter text-white transform -skew-x-6">
             GÜVENLİK BİZİM ÖNCELİĞİMİZ
           </h2>
           <div className="mt-8 mx-auto w-32 h-2 bg-[#00ff9d] rounded-full shadow-[0_0_20px_rgba(0,255,157,0.6)]"></div>
        </div>
      </section>

      {/* --- PAGE 3: FEATURES GRID --- */}
      <section className="py-20 px-4 bg-[#080808]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            
            {/* Feature 1 */}
            <div className="border border-gray-800 bg-[#0a0a0c] p-10 group hover:border-[#00ff9d]/50 transition-colors duration-500 h-full flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-16 h-16 border border-gray-700 rounded-lg flex items-center justify-center mb-8 group-hover:border-[#00ff9d] transition-colors">
                <Users className="w-8 h-8 text-[#00ff9d]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wide">GERÇEK KİŞİLER</h3>
              <ul className="space-y-4 text-sm text-gray-400 font-mono w-full">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                  <span>Kimlik doğrulama zorunlu</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                  <span>Sahte hesaplara geçit yok</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                  <span>Aktif moderasyon ve denetim</span>
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="border border-gray-800 bg-[#0a0a0c] p-10 group hover:border-[#00ff9d]/50 transition-colors duration-500 h-full flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-16 h-16 border border-gray-700 rounded-lg flex items-center justify-center mb-8 group-hover:border-[#00ff9d] transition-colors">
                <FileCheck className="w-8 h-8 text-[#00ff9d]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wide">SABIKA KAYDI KONTROLÜ</h3>
              <ul className="space-y-4 text-sm text-gray-400 font-mono w-full">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                  <span>Temiz sicil olmayan kabul edilmez</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                  <span>Topluluk güvenliği esastır</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                  <span>Düzenli periyodik denetimler</span>
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="border border-gray-800 bg-[#0a0a0c] p-10 group hover:border-[#00ff9d]/50 transition-colors duration-500 h-full flex flex-col items-center text-center md:items-start md:text-left">
              <div className="w-16 h-16 border border-gray-700 rounded-lg flex items-center justify-center mb-8 group-hover:border-[#00ff9d] transition-colors">
                <Briefcase className="w-8 h-8 text-[#00ff9d]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-6 uppercase tracking-wide">ÇALIŞAN OLMA ZORUNLULUĞU</h3>
              <ul className="space-y-4 text-sm text-gray-400 font-mono w-full">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                  <span>Aktif çalışan bireyler</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                  <span>Daha saygılı ve bilinçli topluluk</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-[#00ff9d]" />
                  <span>Profesyonel sosyal ağ</span>
                </li>
              </ul>
            </div>
        </div>
      </section>

      {/* --- PAGE 4: MISSION & TERMINAL --- */}
      <section className="min-h-screen py-24 px-4 bg-[#050505] flex items-center justify-center border-y border-gray-900/50">
        <div className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-16 items-start">
          
          {/* Left: Text Content */}
          <div className="lg:w-1/2 space-y-10 pt-10">
            <h2 className="text-5xl md:text-6xl font-black italic tracking-tighter text-white">
              NEDEN BURADAYIZ?
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 font-mono leading-relaxed">
              <span className="text-[#00ff9d] italic">İnternette anonimlik çoğu zaman güvensizliği beraberinde getirir.</span> Biz bu döngüyü kırmak <span className="text-[#00ff9d] italic">için buradayız.</span>
            </p>
            
            <div className="pl-6 border-l-4 border-[#00ff9d] py-4 bg-[#00ff9d]/5 rounded-r-lg">
               <p className="text-gray-300 italic text-lg leading-relaxed">
                 Amacımız; gerçek insanların, gerçek sohbetler yaptığı, seviyeli, güvenli ve saygılı bir ortam oluşturmak.
               </p>
            </div>

            <div className="space-y-6 pt-6">
              <div className="flex items-center gap-3 text-sm font-bold text-[#00ff9d] uppercase tracking-wider">
                <div className="w-2 h-2 bg-[#00ff9d] rounded-sm"></div> Sohbet Kültürümüz
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm text-gray-400 font-mono">
                <div className="flex items-center gap-2 group">
                  <span className="text-[#00ff9d] group-hover:translate-x-1 transition-transform">{'>'}</span> “Naber millet?” samimiyeti
                </div>
                <div className="flex items-center gap-2 group">
                  <span className="text-[#00ff9d] group-hover:translate-x-1 transition-transform">{'>'}</span> Hakaret, taciz, spam yok
                </div>
                <div className="flex items-center gap-2 group">
                  <span className="text-[#00ff9d] group-hover:translate-x-1 transition-transform">{'>'}</span> Geyik serbest, saygı şart
                </div>
                <div className="flex items-center gap-2 group">
                  <span className="text-[#00ff9d] group-hover:translate-x-1 transition-transform">{'>'}</span> Moderasyon her an aktif
                </div>
              </div>
            </div>
          </div>

          {/* Right: Terminal */}
          <div className="lg:w-1/2 w-full pt-4">
            <div className="bg-[#0a0a12] rounded-lg shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-gray-800 overflow-hidden font-mono text-xs md:text-sm relative">
              {/* Window Controls */}
              <div className="bg-[#16161e] px-4 py-3 flex items-center justify-between border-b border-gray-800">
                <div className="flex gap-2">
                   <div className="w-3 h-3 bg-red-500/80 rounded-full"></div>
                   <div className="w-3 h-3 bg-yellow-500/80 rounded-full"></div>
                   <div className="w-3 h-3 bg-green-500/80 rounded-full"></div>
                </div>
                <div className="text-gray-500 text-[10px] tracking-wide">
                  Status: connected to Workigom (irc.workigomchat.online)
                </div>
              </div>
              
              {/* Terminal Body */}
              <div className="p-6 md:p-8 space-y-3 text-gray-300 leading-relaxed h-[400px] overflow-y-auto">
                <p className="text-blue-400 font-bold">*** Local host: workigomchat.online (127.0.0.1)</p>
                <p className="text-blue-400 font-bold mb-4">*** Checking identity protocol...</p>
                
                <p className="flex items-center gap-2 text-[#00ff9d]">
                  <CheckCircle size={14} className="shrink-0" /> Identity verified: <span className="text-white">[Kimlik Onaylandı]</span>
                </p>
                <p className="flex items-center gap-2 text-[#00ff9d]">
                  <CheckCircle size={14} className="shrink-0" /> Criminal record: <span className="text-white">[Sicil Temiz]</span>
                </p>
                <p className="flex items-center gap-2 text-[#00ff9d] mb-6">
                  <CheckCircle size={14} className="shrink-0" /> Professional status: <span className="text-white">[Aktif Çalışan]</span>
                </p>
                
                <p className="text-purple-400 border-t border-gray-800 pt-4">
                  [ Sistem ]: Sohbete katılmaya yetkiniz var. İyi sohbetler <span className="text-yellow-400">☺</span>
                </p>
                <p className="text-gray-500 mt-2">Kanal girişi bekleniyor...<span className="animate-pulse">_</span></p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- PAGE 5: CTA --- */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-[#050505]">
        <div className="z-10 space-y-2">
            <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter text-white">
              GÜVENLİ SOHBET BİR
            </h2>
            <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter text-white pb-6">
              AYRICALIKTIR
            </h2>
            
            <p className="text-[#00ff9d] font-mono tracking-[0.4em] text-xs md:text-sm mb-12 uppercase">
              w o r k i g o m c h a t . o n l i n e
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center w-full max-w-2xl mx-auto">
              <button 
                onClick={onLoginClick}
                className="bg-[#00ff9d] hover:bg-emerald-400 text-black h-16 px-8 font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,157,0.3)] w-full sm:w-auto"
              >
                  <Lock size={20} /> Başvur ve Katıl
              </button>
              <button className="bg-transparent border border-gray-700 hover:border-white text-gray-400 hover:text-white h-16 px-8 font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors w-full sm:w-auto">
                  <Shield size={20} /> Kurallar & Gizlilik
              </button>
            </div>
        </div>

        {/* Huge Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
           <span className="text-[20vw] font-black text-[#0a0a0c] leading-none select-none pointer-events-none whitespace-nowrap block">
              WORKIGOM
           </span>
        </div>
      </section>

      {/* --- PAGE 6: FOOTER --- */}
      <footer className="bg-[#030303] py-8 px-6 border-t border-gray-900 text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-[0.2em] flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="order-2 md:order-1">
            W O R K I G O M N E T W O R K S Y S T E M © 2 0 2 6
         </div>
         <div className="flex gap-8 order-1 md:order-2">
            <a href="#" className="hover:text-[#00ff9d] transition-colors">YÖNETİCİ GİRİŞİ</a>
            <a href="#" className="hover:text-[#00ff9d] transition-colors">DESTEK</a>
            <a href="#" className="hover:text-[#00ff9d] transition-colors">KVKK</a>
         </div>
      </footer>

    </div>
  );
};

export default LandingPage;