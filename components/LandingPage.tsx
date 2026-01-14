import React from 'react';
import { Shield, CheckCircle, Users, FileCheck, Briefcase, Terminal, ArrowRight, UserPlus, Lock } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500 selection:text-black overflow-x-hidden">
      
      {/* --- HERO SECTION (Page 1) --- */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-32 overflow-hidden">
        
        {/* Background Grid/Glow Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-[128px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] pointer-events-none"></div>

        {/* System Status Pill */}
        <div className="mb-12 animate-enter" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full border border-green-500/30 bg-green-500/5 backdrop-blur-sm text-[10px] md:text-xs font-mono tracking-widest text-green-400 uppercase shadow-[0_0_20px_rgba(34,197,94,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            SİSTEM DURUMU: GÜVENLİ ERİŞİM AKTİF
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-5xl mx-auto space-y-4 z-10 animate-enter" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter italic leading-[0.9]">
            <span className="block text-white">GERÇEK İNSANLARLA,</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 drop-shadow-[0_0_35px_rgba(74,222,128,0.4)]">
              GÜVENLİ SOHBET
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="mt-8 text-center text-gray-400 text-sm md:text-lg max-w-2xl font-mono animate-enter" style={{ animationDelay: '0.3s' }}>
          Sabıka kaydı temiz, çalışan ve kimliği doğrulanmış kişilerle<br className="hidden md:block" />
          huzurlu, seviyeli ve <span className="text-white font-bold">gerçek sohbet ortamı.</span>
        </p>

        {/* CTA Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 animate-enter" style={{ animationDelay: '0.4s' }}>
          <button 
            onClick={onLoginClick}
            className="group relative px-8 py-4 bg-green-500 hover:bg-green-400 text-black font-bold text-sm tracking-widest uppercase transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] w-full sm:w-auto"
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowRight className="w-4 h-4" /> Giriş Yap
            </span>
          </button>
          
          <button className="group px-8 py-4 border border-green-500/50 hover:border-green-400 text-green-400 hover:text-green-300 font-bold text-sm tracking-widest uppercase transition-all duration-300 hover:bg-green-500/10 w-full sm:w-auto">
            <span className="flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" /> Başvur ve Katıl
            </span>
          </button>
        </div>

        <div className="absolute top-4 left-4 text-[10px] text-gray-600 font-mono">
          31.12.2025 00:49
        </div>
        <div className="absolute top-4 right-4 text-[10px] text-gray-600 font-mono">
          Workigom Chat | Güvenli Sohbet Platformu
        </div>
      </section>

      {/* --- SECURITY SECTION (Page 2 & 3) --- */}
      <section className="py-24 px-4 relative border-t border-gray-900/50">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="flex flex-col items-center justify-center mb-20">
            <Shield className="w-12 h-12 text-white mb-4 fill-red-600" />
            <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-center">
              GÜVENLİK BİZİM ÖNCELİĞİMİZ
            </h2>
            <div className="mt-4 w-24 h-1 bg-green-500 rounded-full"></div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-[#0f0f0f] border border-gray-800 p-8 hover:border-green-500/50 transition-colors duration-300 group">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wide">GERÇEK KİŞİLER</h3>
              <ul className="space-y-3 text-sm text-gray-400 font-mono">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  Kimlik doğrulama zorunlu
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  Sahte hesaplara geçit yok
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  Aktif moderasyon ve denetim
                </li>
              </ul>
            </div>

            {/* Card 2 */}
            <div className="bg-[#0f0f0f] border border-gray-800 p-8 hover:border-green-500/50 transition-colors duration-300 group">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <FileCheck className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wide">SABIKA KAYDI KONTROLÜ</h3>
              <ul className="space-y-3 text-sm text-gray-400 font-mono">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  Temiz sicil olmayan kabul edilmez
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  Topluluk güvenliği esastır
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  Düzenli periyodik denetimler
                </li>
              </ul>
            </div>

            {/* Card 3 */}
            <div className="bg-[#0f0f0f] border border-gray-800 p-8 hover:border-green-500/50 transition-colors duration-300 group">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mb-6 group-hover:bg-green-500/20 transition-colors">
                <Briefcase className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 text-white uppercase tracking-wide">ÇALIŞAN OLMA ZORUNLULUĞU</h3>
              <ul className="space-y-3 text-sm text-gray-400 font-mono">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  Aktif çalışan bireyler
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  Daha saygılı ve bilinçli topluluk
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  Profesyonel sosyal ağ
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* --- MISSION & TERMINAL SECTION (Page 4) --- */}
      <section className="py-24 px-4 bg-[#080808] border-y border-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          
          {/* Left Text */}
          <div className="lg:w-1/2 space-y-8">
            <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white border-b-4 border-green-500 inline-block pb-2">
              NEDEN BURADAYIZ?
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 font-mono leading-relaxed">
              <span className="text-green-400 italic">İnternette anonimlik çoğu zaman güvensizliği beraberinde getirir.</span> Biz bu döngüyü kırmak için buradayız.
            </p>
            
            <div className="pl-6 border-l-4 border-green-500 py-2">
               <p className="text-gray-400 italic text-lg">
                 Amacımız; gerçek insanların, gerçek sohbetler yaptığı, seviyeli, güvenli ve saygılı bir ortam oluşturmak.
               </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3 text-sm font-bold text-white uppercase tracking-wider">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div> Sohbet Kültürümüz
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">{'>'}</span> “Naber millet?” samimiyeti
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">{'>'}</span> Hakaret, taciz, spam yok
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">{'>'}</span> Geyik serbest, saygı şart
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">{'>'}</span> Moderasyon her an aktif
                </div>
              </div>
            </div>
          </div>

          {/* Right Terminal */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-[#1a1b26] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-gray-800 overflow-hidden font-mono text-xs md:text-sm">
              {/* Terminal Header */}
              <div className="bg-[#16161e] px-4 py-2 flex items-center justify-between border-b border-gray-800">
                <div className="flex items-center gap-2 text-gray-500">
                  <Terminal size={14} />
                  <span>Status: connected to Workigom (irc.workigomchat.online)</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                </div>
              </div>
              
              {/* Terminal Content */}
              <div className="p-6 space-y-2 text-gray-300">
                <p className="text-blue-400 font-bold">*** Local host: workigomchat.online (127.0.0.1)</p>
                <p className="text-blue-400 font-bold">*** Checking identity protocol...</p>
                <br />
                <p className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={14} /> Identity verified: <span className="text-white">[Kimlik Onaylandı]</span>
                </p>
                <p className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={14} /> Criminal record: <span className="text-white">[Sicil Temiz]</span>
                </p>
                <p className="flex items-center gap-2 text-green-400">
                  <CheckCircle size={14} /> Professional status: <span className="text-white">[Aktif Çalışan]</span>
                </p>
                <br />
                <p className="text-purple-400">[ Sistem ]: Sohbete katılmaya yetkiniz var. İyi sohbetler <span className="text-yellow-400">☺</span></p>
                <p className="text-gray-500 mt-2 animate-pulse">Kanal girişi bekleniyor..._</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* --- CTA SECTION (Page 5) --- */}
      <section className="py-32 px-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-green-900/5 pointer-events-none"></div>
        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white mb-2 z-10">
          GÜVENLİ SOHBET BİR
        </h2>
        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white mb-8 z-10">
          AYRICALIKTIR
        </h2>
        
        <p className="text-green-500 font-mono tracking-[0.3em] text-sm md:text-base mb-12 uppercase z-10">
          w o r k i g o m c h a t . o n l i n e
        </p>

        <div className="flex flex-col sm:flex-row gap-6 z-10 w-full max-w-2xl justify-center">
           <button 
             onClick={onLoginClick}
             className="bg-green-400 hover:bg-green-300 text-black px-8 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-transform hover:scale-105 shadow-[0_0_20px_rgba(74,222,128,0.3)]"
           >
              <Lock size={18} /> Başvur ve Katıl
           </button>
           <button className="bg-transparent border border-gray-700 hover:border-white text-gray-300 hover:text-white px-8 py-4 font-bold uppercase tracking-wider flex items-center justify-center gap-3 transition-colors">
              <Shield size={18} /> Kurallar & Gizlilik
           </button>
        </div>
        
        {/* Background "Workigom" Text */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[15vw] font-black text-gray-900/30 leading-none select-none pointer-events-none whitespace-nowrap">
           WORKIGOM
        </div>
      </section>

      {/* --- FOOTER (Page 6) --- */}
      <footer className="bg-black py-8 px-4 border-t border-gray-900 text-[10px] md:text-xs font-mono text-gray-600 uppercase tracking-widest flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            W O R K I G O M N E T W O R K S Y S T E M © 2 0 2 6
         </div>
         <div className="flex gap-6">
            <span className="hover:text-green-500 cursor-pointer transition-colors">YÖNETİCİ GİRİŞİ</span>
            <span className="hover:text-green-500 cursor-pointer transition-colors">DESTEK</span>
            <span className="hover:text-green-500 cursor-pointer transition-colors">KVKK</span>
         </div>
      </footer>

    </div>
  );
};

export default LandingPage;
