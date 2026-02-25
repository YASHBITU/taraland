// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Activity, Shield, Zap, CircleDot, BarChart3, Lock, Globe, Twitter, Send, Linkedin, X } from 'lucide-react';
import { useMarketData } from './hooks/useMarketData';
import { AnimatedCounter } from './components/ui/AnimatedCounter';
import { GlassCard } from './components/ui/GlassCard';
import { TerminalChart } from './components/terminal/TerminalChart';
import { MarketTicker } from './components/terminal/MarketTicker';
import Engine from './components/terminal/Engine';

export default function App() {
  const { assets, pulse } = useMarketData();
  const [activeMarketData, setActiveMarketData] = useState(null);
  const [isEngineActive, setIsEngineActive] = useState(false);
  const [activeTimeframe, setActiveTimeframe] = useState('M1');
  const [carouselIdx, setCarouselIdx] = useState(1);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Throttled Parallax & Responsive Detection
  useEffect(() => {
    let ticking = false;
    const checkWin = () => setIsMobile(window.innerWidth < 768);
    checkWin();

    const handleGlobalMouseMove = (e) => {
      // Disable ambient background effect entirely on mobile to save GPU
      if (isMobile) return;
      if (!ticking) {
        requestAnimationFrame(() => {
          setMousePos({
            x: (e.clientX / window.innerWidth - 0.5) * 10,
            y: (e.clientY / window.innerHeight - 0.5) * 10
          });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('resize', checkWin);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('resize', checkWin);
    };
  }, [isMobile]);

  const btcData = assets.find(a => a.symbol === 'BTC/USD');
  const xauData = assets.find(a => a.symbol === 'XAU/USD');

  const advantages = [
    { title: "Triple Timeframe Analysis", desc: "Cross-correlating M5, H1, and D1 data to filter noise and identify institutional footprints.", icon: Activity },
    { title: "Dynamic Risk Engine", desc: "Auto-adjusting position sizing based on real-time volatility indices and liquidity depth metrics.", icon: Shield },
    { title: "Low Latency Execution", desc: "Direct market access through Equinix data centers ensuring sub-millisecond execution for near-zero slippage.", icon: Zap }
  ];

  const carouselCards = [
    { title: "Volume Profiling", desc: "Mapping transactional intensity to identify true support levels.", icon: BarChart3 },
    { title: "Smart Liquidity Mapping", desc: "Identifying stop hunts and liquidity traps before they manifest in the order book. Our engine front-runs retail exhaustion.", icon: Activity },
    { title: "Risk Shield", desc: "Proprietary hedging logic that activates during extreme volatility.", icon: Shield }
  ];

  const handleNextCarousel = () => setCarouselIdx(prev => (prev + 1) % carouselCards.length);
  const handlePrevCarousel = () => setCarouselIdx(prev => (prev - 1 + carouselCards.length) % carouselCards.length);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden selection:bg-gold-dark/30 font-sans">

      {/* Optimized Background Parallax Effects (Disabled completely on mobile) */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={isMobile ? {} : { transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}
      >
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-[100%] bg-gold-dark/5 blur-[100px] lg:blur-[150px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-[100%] bg-indigo-900/5 blur-[100px] lg:blur-[150px]" />
        {!isMobile && (
          <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-[100%] bg-gold-light/5 blur-[150px]" />
        )}
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5 bg-bg-primary/90 lg:bg-bg-primary/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 lg:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-3 cursor-pointer group">
            <div className="w-6 h-6 lg:w-8 lg:h-8 rounded bg-gradient-gold flex items-center justify-center shadow-[0_0_15px_rgba(198,168,79,0.2)] group-hover:shadow-[0_0_20px_rgba(198,168,79,0.4)] transition-shadow">
              <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-bg-primary" />
            </div>
            <span className="font-serif font-bold text-lg lg:text-xl tracking-tighter text-white">TARA ALGO <span className="text-gold-light font-medium tracking-normal">PRO</span></span>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-text-secondary uppercase tracking-widest">
            <a href="#strategy" className="hover:text-gold-light transition-colors">Strategy</a>
            <a href="#performance" className="hover:text-gold-light transition-colors">Performance</a>
            <a href="#institutions" className="hover:text-gold-light transition-colors">Institutions</a>
            <a href="#faq" className="hover:text-gold-light transition-colors">FAQ</a>
          </div>

          <button onClick={() => setIsEngineActive(true)} className="shimmer-sweep px-4 py-2 lg:px-6 lg:py-2.5 rounded-full bg-gradient-gold text-bg-primary font-bold text-xs lg:text-sm tracking-widest hover:shadow-[0_0_20px_rgba(198,168,79,0.3)] transition-all duration-300">
            LAUNCH
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-24 lg:pt-32">

        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 pt-6 lg:pt-12 pb-16 lg:pb-24 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 lg:px-4 lg:py-1.5 rounded-full border border-gold-dark/30 bg-gold-dark/10 text-gold-light text-[10px] lg:text-xs font-semibold tracking-widest uppercase mb-6 lg:mb-8 shadow-[0_0_10px_rgba(198,168,79,0.1)]">
              <CircleDot className="w-2 h-2 lg:w-3 lg:h-3 text-gold-light" />
              Institutional Grade XAU/USD Algo
            </div>

            <h1 className="font-serif text-5xl md:text-6xl lg:text-8xl leading-none lg:leading-[0.9] mb-4 lg:mb-6 tracking-tighter text-white">
              THE FUTURE OF<br />
              <span className="text-gradient-gold italic pr-2 lg:pr-4 font-medium relative inline-block">
                PRECISION
              </span><br />
              TRADING
            </h1>

            <p className="text-text-secondary text-base lg:text-xl max-w-xl mb-8 lg:mb-10 leading-relaxed font-light">
              Harness elite proprietary liquidity intelligence and high-frequency execution for Gold markets. Developed for funds. Refined for the elite.
            </p>

            <div className="flex flex-wrap items-center gap-3 lg:gap-4 mb-12 lg:mb-16 w-full lg:w-auto">
              <button
                onClick={() => setIsEngineActive(true)}
                className="shimmer-sweep px-6 py-3 lg:px-8 lg:py-4 rounded-full bg-gradient-gold text-bg-primary font-bold tracking-widest flex items-center gap-2 hover:shadow-[0_0_20px_rgba(198,168,79,0.3)] transition-shadow duration-300 group flex-1 lg:flex-none justify-center lg:justify-start text-sm lg:text-base"
              >
                JOIN THE ELITE
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-6 py-3 lg:px-8 lg:py-4 rounded-full border border-white/10 hover:bg-white/5 hover:border-gold-light/40 text-white font-medium tracking-wide transition-colors duration-300 flex-1 lg:flex-none text-center text-sm lg:text-base">
                VIEW AUDIT
              </button>
            </div>

            {/* Live Hero Status */}
            <div className={`flex items-center gap-4 lg:gap-8 p-3 lg:p-4 rounded-xl glass-card w-full lg:max-w-md transition-shadow duration-500 cursor-default ${btcData?.change >= 0 ? 'hover:shadow-[0_0_20px_rgba(198,168,79,0.1)]' : 'hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]'}`}>
              <div>
                <div className="text-[10px] lg:text-xs text-text-secondary font-mono mb-1 tracking-widest">TRADING TERMINAL v4.2</div>
                <div className="text-xs lg:text-sm text-emerald-400 font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-400 opacity-90" />
                  XAU/USD CORE
                </div>
              </div>
              <div className="w-px h-8 lg:h-10 bg-white/10" />
              <div className="relative group flex-1">
                <div className="relative">
                  <div className="text-[10px] lg:text-xs text-text-secondary font-mono mb-1 tracking-widest">BTC/USD (BINANCE)</div>
                  <div className="text-base lg:text-lg font-mono font-semibold flex items-center gap-2 text-white">
                    <span className={`transition-opacity duration-300 ${pulse ? 'opacity-70' : 'opacity-100'}`}>
                      ${btcData?.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-[10px] lg:text-xs ${btcData?.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {btcData?.change >= 0 ? '+' : ''}{btcData?.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Trading Terminal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="relative w-full aspect-square max-w-sm lg:max-w-lg mx-auto lg:ml-auto max-h-[400px] lg:max-h-none"
          >
            <div className="relative w-full h-full rounded-2xl border border-white/5 bg-bg-secondary backdrop-blur-md overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col group hover:border-gold-dark/20 transition-colors duration-500">
              <div className="h-10 lg:h-12 border-b border-white/5 flex items-center justify-between px-3 lg:px-4 bg-white/[0.02]">
                <div className="flex gap-1.5 lg:gap-2">
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-red-500/50 hover:bg-red-500 transition-colors" />
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-yellow-500/50 hover:bg-yellow-500 transition-colors" />
                  <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-green-500/50 hover:bg-green-500 transition-colors" />
                </div>
                <div className="text-[10px] lg:text-xs font-mono text-text-secondary tracking-widest hidden lg:block">XAU/USD QUANT ENGINE</div>
                <div className="text-[10px] font-mono text-text-secondary tracking-widest lg:hidden">XAU/USD</div>
              </div>

              <div className="flex-1 relative bg-bg-primary overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

                <div className="absolute top-2 left-3 lg:top-4 lg:left-6 z-10 flex gap-1 lg:gap-2">
                  {['M1', 'M5', 'M15', 'H1', 'D1'].map(tf => (
                    <button
                      key={tf}
                      onClick={() => setActiveTimeframe(tf)}
                      className={`text-[10px] lg:text-xs font-mono px-1.5 lg:px-2 py-1 transition-colors ${activeTimeframe === tf ? 'text-gold-light border-b border-gold-light' : 'text-text-secondary hover:text-white'}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>

                <div className="absolute top-2 right-3 lg:top-4 lg:right-6 text-right z-10 bg-bg-primary/50 backdrop-blur-sm px-2 rounded lg:bg-transparent lg:backdrop-blur-none">
                  <div className="text-[10px] lg:text-xs font-mono text-text-secondary tracking-widest">LIVE PAXG (XAU)</div>
                  <div className={`text-xl lg:text-3xl font-mono ${pulse && xauData?.change >= 0 ? 'text-emerald-400' : pulse ? 'text-red-400' : 'text-white'} transition-colors`}>
                    ${xauData?.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`text-xs lg:text-sm font-mono ${xauData?.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {xauData?.change >= 0 ? '+' : ''}{xauData?.change.toFixed(2)}%
                  </div>
                </div>

                {/* Mock Order Book (Hidden on extreme mobile heights to preserve chart) */}
                <div className="hidden lg:block absolute top-[4.5rem] right-6 w-24 space-y-1 text-right font-mono text-[10px] z-10 opacity-70">
                  <div className="text-red-400">{(xauData?.price + 1.10).toFixed(2)} <span className="text-text-secondary">0.5k</span></div>
                  <div className="text-red-400">{(xauData?.price + 0.65).toFixed(2)} <span className="text-text-secondary">1.2k</span></div>
                  <div className="text-red-400">{(xauData?.price + 0.25).toFixed(2)} <span className="text-text-secondary">3.4k</span></div>
                  <div className="text-emerald-400 mt-2">{(xauData?.price - 0.25).toFixed(2)} <span className="text-text-secondary">4.1k</span></div>
                  <div className="text-emerald-400">{(xauData?.price - 0.65).toFixed(2)} <span className="text-text-secondary">2.0k</span></div>
                  <div className="text-emerald-400">{(xauData?.price - 1.10).toFixed(2)} <span className="text-text-secondary">1.1k</span></div>
                </div>

                {/* REAL SVG Candlestick Data via Recharts (Binance sourced) */}
                <TerminalChart symbol="XAU/USD" timeframe={activeTimeframe} />

              </div>
            </div>
          </motion.div>
        </section>

        {/* LIVE MARKET TICKER BAR */}
        <MarketTicker assets={assets} />

        {/* STATS SECTION */}
        <section className="max-w-7xl mx-auto px-4 lg:px-6 py-20 lg:py-32 z-20 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { label: "TOTAL MANAGED VOLUME", value: "$4.2B+", prefix: "$", suffix: "B+", raw: "4.2", icon: BarChart3 },
              { label: "HISTORICAL ACCURACY", value: "92.4%", suffix: "%", raw: "92.4", decimals: 1, icon: Activity },
              { label: "AVERAGE RISK/REWARD", value: "1:3.5", prefix: "1:", raw: "3.5", decimals: 1, icon: Shield }
            ].map((stat, i) => (
              <GlassCard key={i} className="p-8 lg:p-10 flex flex-col items-center text-center group">
                <stat.icon className="w-6 h-6 lg:w-8 lg:h-8 text-gold-dark mb-4 lg:mb-6 group-hover:scale-110 group-hover:text-gold-light transition-transform duration-300" />
                <div className="text-[10px] lg:text-xs text-text-secondary font-bold tracking-widest uppercase mb-2 lg:mb-4">{stat.label}</div>
                <div className="font-serif text-4xl lg:text-5xl text-white font-medium text-shadow-gold tracking-tighter">
                  <AnimatedCounter value={stat.raw} prefix={stat.prefix} suffix={stat.suffix} decimals={stat.decimals} />
                </div>
              </GlassCard>
            ))}
          </div>
        </section>

        {/* ALGORITHMIC ADVANTAGES */}
        <section className="bg-bg-secondary/40 py-20 lg:py-32 relative border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-20">
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 lg:mb-6 tracking-tight text-white font-medium">ALGORITHMIC ADVANTAGES</h2>
              <p className="text-text-secondary text-base lg:text-lg px-4 lg:px-0">
                Our multi-layered approach ensures stability in volatile markets while maximizing capital efficiency through proprietary execution models.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {advantages.map((adv, i) => (
                <GlassCard key={i} onClick={() => setActiveMarketData(adv)} className="p-6 lg:p-8 group text-left">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-gold opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl shadow-[0_0_10px_rgba(198,168,79,0.5)]" />
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center mb-6 lg:mb-8 group-hover:border-gold-light/30 transition-colors duration-300">
                    <adv.icon className="w-5 h-5 lg:w-6 lg:h-6 text-gold-light" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 tracking-wide text-white group-hover:text-gold-light transition-colors">{adv.title}</h3>
                  <p className="text-text-secondary leading-relaxed text-[13px] lg:text-sm font-light">
                    {adv.desc}
                  </p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        {/* 3D GOLD STANDARD SECTION (CAROUSEL) */}
        <section className="py-20 lg:py-32 overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 text-center mb-12 lg:mb-20 relative z-10">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl mb-4 lg:mb-6 tracking-tight text-white font-medium">THE GOLD STANDARD</h2>
            <p className="text-text-secondary text-base lg:text-lg max-w-2xl mx-auto">
              A systematic methodology refined over a decade of market cycles.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto px-4 lg:px-6 h-[380px] lg:h-[450px] flex items-center justify-center perspective-[2000px] touch-pan-y">
            <AnimatePresence initial={false}>
              {carouselCards.map((card, i) => {
                const isActive = i === carouselIdx;
                const leftIdx = (carouselIdx - 1 + carouselCards.length) % carouselCards.length;
                const rightIdx = (carouselIdx + 1) % carouselCards.length;

                let xPosition = 0; let zPosition = -400; let rotateY = 0; let opacity = 0; let filter = isMobile ? 'none' : 'blur(10px)'; let scale = 0.9;

                if (isActive) {
                  xPosition = 0; zPosition = 0; opacity = 1; filter = 'blur(0px)'; rotateY = 0; scale = 1.05;
                } else if (i === leftIdx) {
                  xPosition = -60; zPosition = -150; opacity = 0.4; filter = isMobile ? 'none' : 'blur(4px)'; rotateY = isMobile ? 0 : 15; scale = 0.9;
                } else if (i === rightIdx) {
                  xPosition = 60; zPosition = -150; opacity = 0.4; filter = isMobile ? 'none' : 'blur(4px)'; rotateY = isMobile ? 0 : -15; scale = 0.9;
                }

                if (!isActive && i !== leftIdx && i !== rightIdx) return null;

                return (
                  <motion.div
                    key={i}
                    onClick={() => {
                      if (i === leftIdx) handlePrevCarousel();
                      else if (i === rightIdx) handleNextCarousel();
                      else setActiveMarketData(card);
                    }}
                    animate={{
                      x: `${xPosition}%`,
                      z: isMobile ? 0 : zPosition,
                      rotateY,
                      opacity,
                      filter,
                      scale
                    }}
                    transition={{ duration: 0.5, type: 'spring', stiffness: 250, damping: 30 }}
                    drag={isActive ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      if (offset.x > 50) handlePrevCarousel();
                      else if (offset.x < -50) handleNextCarousel();
                    }}
                    className={`absolute w-full max-w-[300px] lg:max-w-md glass-card rounded-2xl p-6 lg:p-10 cursor-pointer ${isActive ? 'z-30 border-gold-dark/40 shadow-[0_20px_40px_rgba(0,0,0,0.6)]' : 'z-10 border-white/5'}`}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-gold-dark/10 to-transparent rounded-2xl pointer-events-none" />
                    <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-gradient-gold flex items-center justify-center mb-6 lg:mb-8 shadow-[0_0_20px_rgba(198,168,79,0.3)]">
                      <card.icon className="w-6 h-6 lg:w-8 lg:h-8 text-bg-primary" />
                    </div>
                    <h3 className="text-xl lg:text-3xl font-bold mb-3 lg:mb-4 tracking-wide text-white">{card.title}</h3>
                    <p className="text-text-secondary leading-relaxed font-light text-xs lg:text-base">
                      {card.desc}
                    </p>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="flex justify-center gap-4 lg:gap-6 mt-8 lg:mt-16 relative z-30">
            <button onClick={handlePrevCarousel} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors duration-300 hover:border-gold-light/30">
              <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-white text-opacity-70 hover:text-opacity-100" />
            </button>
            <button onClick={handleNextCarousel} className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors duration-300 hover:border-gold-light/30">
              <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-white text-opacity-70 hover:text-opacity-100" />
            </button>
          </div>
        </section>

        {/* TRUSTED INFRASTRUCTURE */}
        <section className="py-16 lg:py-24 border-y border-white/5 bg-bg-secondary/20 relative z-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <h2 className="text-center text-[10px] lg:text-sm font-bold tracking-[0.2em] text-text-secondary mb-10 lg:mb-16">
              TRUSTED INSTITUTIONAL INFRASTRUCTURE
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-28 opacity-80">
              {['BINANCE LABS', 'RocketX', 'Kronos', 'CARBON', 'Gate.io'].map((partner, i) => (
                <div key={i} className="text-lg md:text-2xl lg:text-3xl font-serif font-bold tracking-widest text-text-secondary flex-shrink-0">
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-24 lg:py-40 relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 lg:px-6 text-center relative z-10 flex flex-col items-center">
            <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl mb-6 lg:mb-8 tracking-tighter text-white font-medium">
              READY TO JOIN THE <span className="text-gradient-gold">TOP 1%?</span>
            </h2>
            <p className="text-text-secondary text-base md:text-lg lg:text-2xl mb-10 lg:mb-12 leading-relaxed font-light max-w-3xl">
              Limited institutional seats available for Q4. Secure your allocation and gain access to the most sophisticated gold trading architecture ever deployed.
            </p>
            <button
              onClick={() => setIsEngineActive(true)}
              className="shimmer-sweep px-8 py-4 lg:px-12 lg:py-6 rounded-full bg-gradient-gold text-bg-primary font-bold tracking-widest text-sm lg:text-lg hover:shadow-[0_0_30px_rgba(198,168,79,0.4)] transition-all duration-300"
            >
              APPLY FOR ACCESS
            </button>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-bg-secondary pt-16 lg:pt-24 pb-12 relative z-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-16 mb-16 lg:mb-20">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6 lg:mb-8 group cursor-pointer w-max">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded bg-gradient-gold flex items-center justify-center">
                  <Activity className="w-5 h-5 lg:w-6 lg:h-6 text-bg-primary" />
                </div>
                <span className="font-serif font-bold text-xl lg:text-2xl tracking-tighter text-white">TARA ALGO <span className="text-gold-light font-medium tracking-normal">PRO</span></span>
              </div>
              <p className="text-text-secondary text-xs lg:text-sm leading-relaxed font-light max-w-sm">
                The pinnacle of institutional XAU/USD trading algorithms. Precision, performance, and professional-grade security for the global elite.
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16 lg:col-span-3">
              <div>
                <h4 className="font-bold tracking-widest mb-6 lg:mb-8 text-white text-xs lg:text-sm">ECOSYSTEM</h4>
                <ul className="space-y-3 lg:space-y-4 text-xs lg:text-sm text-text-secondary font-medium">
                  <li><a href="#" className="hover:text-gold-light transition-colors">Strategy Engine</a></li>
                  <li><a href="#" className="hover:text-gold-light transition-colors">Verified Backtests</a></li>
                  <li><a href="#" className="hover:text-gold-light transition-colors">Yield Pricing</a></li>
                  <li><a href="#" className="hover:text-gold-light transition-colors">Enterprise Support</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold tracking-widest mb-6 lg:mb-8 text-white text-xs lg:text-sm">RESOURCES</h4>
                <ul className="space-y-3 lg:space-y-4 text-xs lg:text-sm text-text-secondary font-medium">
                  <li><a href="#" className="hover:text-gold-light transition-colors">Market Intelligence</a></li>
                  <li><a href="#" className="hover:text-gold-light transition-colors">REST API Docs</a></li>
                  <li><a href="#" className="hover:text-gold-light transition-colors">Institutional Deck</a></li>
                  <li><a href="#" className="hover:text-gold-light transition-colors">Security Audit</a></li>
                </ul>
              </div>

              <div className="col-span-2 lg:col-span-1">
                <h4 className="font-bold tracking-widest mb-6 lg:mb-8 text-white text-xs lg:text-sm">CONNECT</h4>
                <ul className="space-y-3 lg:space-y-4 text-xs lg:text-sm text-text-secondary font-medium flex flex-wrap gap-4 lg:gap-0 lg:flex-col">
                  <li className="w-full lg:w-auto"><a href="#" className="hover:text-gold-light transition-colors flex items-center gap-2 lg:gap-3"><Send className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Discord</a></li>
                  <li className="w-full lg:w-auto"><a href="#" className="hover:text-gold-light transition-colors flex items-center gap-2 lg:gap-3"><Twitter className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> X (Twitter)</a></li>
                  <li className="w-full lg:w-auto"><a href="#" className="hover:text-gold-light transition-colors flex items-center gap-2 lg:gap-3"><Linkedin className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> LinkedIn</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-[10px] lg:text-xs text-text-secondary font-medium tracking-wide">
            <p>&copy; {new Date().getFullYear()} TARA ALGO PRO. All rights reserved.</p>
            <div className="flex gap-4 lg:gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Risk Disclosure</a>
            </div>
          </div>
        </div>
      </footer>

      {/* MODAL OVERLAY (Optimized for performance + mobile) */}
      <AnimatePresence>
        {activeMarketData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-6 bg-base/90 bg-black/80 backdrop-blur-sm lg:backdrop-blur-xl"
            onClick={() => setActiveMarketData(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-bg-secondary rounded-2xl p-6 lg:p-10 border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setActiveMarketData(null)} className="absolute top-4 right-4 lg:top-6 lg:right-6 text-text-secondary hover:text-white transition-colors bg-white/5 rounded-full p-2 hover:bg-white/10">
                <X className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>
              <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-gradient-gold flex items-center justify-center mb-6 lg:mb-8">
                {activeMarketData.icon && <activeMarketData.icon className="w-6 h-6 lg:w-8 lg:h-8 text-bg-primary" />}
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-3 lg:mb-4 tracking-wide text-white">{activeMarketData.title}</h3>
              <p className="text-text-secondary text-sm lg:text-lg leading-relaxed mb-8 lg:mb-10 font-light">
                {activeMarketData.desc} Deep dive analytics reveal institutional flow dynamics ensuring our proprietary models capture alpha while minimizing drawdown across volatile regimes.
              </p>

              <div className="h-40 lg:h-48 rounded-xl bg-black/60 border border-white/10 overflow-hidden relative p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] lg:text-xs font-mono tracking-widest text-text-secondary flex items-center gap-2">REAL-TIME TELEMETRY</span>
                  <span className="text-[10px] lg:text-xs font-mono tracking-widest text-emerald-400 flex items-center gap-1.5"><span className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-emerald-400 opacity-80" /> LIVE SYNC</span>
                </div>
                <div className="flex-1 flex items-end gap-[2px] lg:gap-[3px] opacity-70">
                  {/* Reduced rendering blocks for modal performance */}
                  {[...Array(isMobile ? 20 : 35)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: `${20 + Math.random() * 80}%` }}
                      animate={{ height: `${20 + Math.random() * 80}%` }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: "mirror", delay: i * 0.1 }}
                      className="flex-1 bg-gradient-to-t from-gold-dark/20 to-gold-light/80 rounded-t-[1px]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* INSTITUTIONAL ANALYTICAL ENGINE OVERLAY */}
      {isEngineActive && <Engine onClose={() => setIsEngineActive(false)} />}

    </div>
  );
}
