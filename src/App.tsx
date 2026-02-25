/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight, Activity, Shield, Zap, CircleDot, BarChart3, Lock, Globe, Twitter, Send, Linkedin } from 'lucide-react';

export default function App() {
  const [btcPrice, setBtcPrice] = useState(63482.21);
  const [btcChange, setBtcChange] = useState(1.24);

  // Simulate live BTC price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBtcPrice(prev => prev + (Math.random() * 10 - 5));
      setBtcChange(prev => prev + (Math.random() * 0.1 - 0.05));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary overflow-x-hidden selection:bg-gold-dark/30">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold-dark/5 blur-[150px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] rounded-full bg-indigo-900/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-gold-light/5 blur-[150px]" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded bg-gradient-gold flex items-center justify-center">
              <Activity className="w-5 h-5 text-bg-primary" />
            </div>
            <span className="font-serif font-semibold text-xl tracking-wide">GoldAlgo <span className="text-gold-light">Pro</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
            <a href="#strategy" className="hover:text-white transition-colors">Strategy</a>
            <a href="#performance" className="hover:text-white transition-colors">Performance</a>
            <a href="#institutions" className="hover:text-white transition-colors">Institutions</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <button className="px-6 py-2.5 rounded-full bg-gradient-gold text-bg-primary font-semibold text-sm hover:shadow-[0_0_20px_rgba(198,168,79,0.3)] transition-all duration-300">
            LAUNCH DASHBOARD
          </button>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        
        {/* HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-start"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-dark/30 bg-gold-dark/10 text-gold-light text-xs font-semibold tracking-wider uppercase mb-8">
              <CircleDot className="w-3 h-3 animate-pulse" />
              Institutional Grade XAU/USD Algo
            </div>
            
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl leading-[0.9] mb-6 tracking-tight">
              THE FUTURE OF<br/>
              <span className="text-gradient-gold italic pr-4">PRECISION</span><br/>
              TRADING
            </h1>
            
            <p className="text-text-secondary text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light">
              Harness elite proprietary liquidity intelligence and high-frequency execution for Gold markets. Developed for funds. Refined for the elite.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 mb-16">
              <button className="px-8 py-4 rounded-full bg-gradient-gold text-bg-primary font-bold flex items-center gap-2 hover:shadow-[0_0_30px_rgba(198,168,79,0.4)] transition-all duration-300 group">
                JOIN THE ELITE
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 text-white font-medium transition-colors">
                VIEW AUDIT
              </button>
            </div>

            {/* Live Terminal Status */}
            <div className="flex items-center gap-8 p-4 rounded-xl glass-card w-full max-w-md">
              <div>
                <div className="text-xs text-text-secondary font-mono mb-1">TRADING TERMINAL v4.2</div>
                <div className="text-sm text-emerald-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  XAU/USD CORE ENGINE ACTIVE
                </div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="relative">
                <div className="absolute inset-0 bg-gold-dark/20 blur-xl rounded-full" />
                <div className="relative">
                  <div className="text-xs text-text-secondary font-mono mb-1">BTC/USD</div>
                  <div className="text-lg font-mono font-semibold flex items-center gap-2">
                    ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className={`text-xs ${btcChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {btcChange >= 0 ? '+' : ''}{btcChange.toFixed(2)}%
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
            transition={{ duration: 1, delay: 0.2 }}
            className="relative w-full aspect-square max-w-lg mx-auto lg:ml-auto"
          >
            <div className="absolute inset-0 bg-gold-dark/10 blur-[100px] rounded-full" />
            
            <div className="relative w-full h-full rounded-2xl border border-gold-dark/20 bg-bg-secondary/80 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col">
              {/* Terminal Header */}
              <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="text-xs font-mono text-text-secondary">XAU/USD QUANT ENGINE</div>
              </div>
              
              {/* Terminal Body */}
              <div className="flex-1 p-6 relative bg-grid-pattern">
                <div className="absolute top-6 right-6 text-right">
                  <div className="text-sm font-mono text-text-secondary">XAU/USD</div>
                  <div className="text-2xl font-mono text-white">$2,145.42</div>
                  <div className="text-sm font-mono text-emerald-400">+0.82%</div>
                </div>

                {/* Simulated Chart */}
                <div className="absolute bottom-0 left-0 right-0 h-2/3 flex items-end px-6 pb-6 gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 100, 85, 110].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                      className="flex-1 bg-gradient-to-t from-gold-dark/20 to-gold-light/40 rounded-t-sm border-t border-gold-light/50 relative group"
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[10px] font-mono text-gold-light transition-opacity">
                        {2100 + h}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Overlay Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <motion.path 
                    d="M0,150 Q100,100 200,180 T400,120 T600,80" 
                    fill="none" 
                    stroke="rgba(242, 217, 138, 0.5)" 
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        </section>

        {/* LIVE MARKET TICKER BAR */}
        <div className="w-full border-y border-white/5 bg-bg-secondary/50 backdrop-blur-md overflow-hidden py-3 relative">
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg-primary to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg-primary to-transparent z-10" />
          
          <div className="flex w-[200%] animate-ticker">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex w-1/2 justify-around items-center font-mono text-sm">
                <div className="flex gap-3 items-center"><span className="text-text-secondary">XAU/USD</span> <span>2145.42</span> <span className="text-emerald-400">+0.82%</span></div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex gap-3 items-center"><span className="text-text-secondary">BTC/USD</span> <span>63482.21</span> <span className="text-emerald-400">+1.24%</span></div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex gap-3 items-center"><span className="text-text-secondary">DXY</span> <span>105.45</span> <span className="text-red-400">-0.12%</span></div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex gap-3 items-center"><span className="text-text-secondary">SPX</span> <span>5214.10</span> <span className="text-emerald-400">+0.45%</span></div>
                <div className="w-px h-4 bg-white/10" />
                <div className="flex gap-3 items-center"><span className="text-text-secondary">ETH/USD</span> <span>3412.55</span> <span className="text-emerald-400">+1.10%</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* STATS SECTION */}
        <section className="max-w-7xl mx-auto px-6 py-32">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "TOTAL MANAGED VOLUME", value: "$4.2B+", icon: BarChart3 },
              { label: "HISTORICAL ACCURACY", value: "92.4%", icon: Activity },
              { label: "AVERAGE RISK/REWARD", value: "1:3.5", icon: Shield }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-8 flex flex-col items-center text-center group hover:bg-white/[0.02] transition-colors relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gold-dark/0 group-hover:bg-gold-dark/5 transition-colors duration-500" />
                <stat.icon className="w-6 h-6 text-gold-dark mb-6" />
                <div className="text-xs text-text-secondary font-semibold tracking-widest uppercase mb-2">{stat.label}</div>
                <div className="font-serif text-5xl text-white">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ALGORITHMIC ADVANTAGES */}
        <section className="bg-bg-secondary py-32 relative border-y border-white/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-gold-dark/50 to-transparent" />
          
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="font-serif text-4xl md:text-5xl mb-6">ALGORITHMIC ADVANTAGES</h2>
              <p className="text-text-secondary text-lg">
                Our multi-layered approach ensures stability in volatile markets while maximizing capital efficiency through proprietary execution models.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Triple Timeframe Analysis",
                  desc: "Cross-correlating M5, H1, and D1 data to filter noise and identify institutional footprints.",
                  icon: Activity
                },
                {
                  title: "Dynamic Risk Engine",
                  desc: "Auto-adjusting position sizing based on real-time volatility indices and liquidity depth metrics.",
                  icon: Shield
                },
                {
                  title: "Low Latency Execution",
                  desc: "Direct market access through Equinix data centers ensuring sub-millisecond execution for near-zero slippage.",
                  icon: Zap
                }
              ].map((adv, i) => (
                <div key={i} className="glass-card rounded-2xl p-8 relative group hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-gold opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl" />
                  <div className="w-12 h-12 rounded-full bg-bg-primary border border-white/10 flex items-center justify-center mb-6 group-hover:border-gold-dark/50 transition-colors">
                    <adv.icon className="w-5 h-5 text-gold-light" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">{adv.title}</h3>
                  <p className="text-text-secondary leading-relaxed text-sm">
                    {adv.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 3D GOLD STANDARD SECTION */}
        <section className="py-32 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(198,168,79,0.05)_0%,transparent_50%)]" />
          
          <div className="max-w-7xl mx-auto px-6 text-center mb-16 relative z-10">
            <h2 className="font-serif text-4xl md:text-5xl mb-6">THE GOLD STANDARD</h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              A systematic methodology refined over a decade of market cycles.
            </p>
          </div>

          <div className="relative max-w-5xl mx-auto px-6 h-[400px] flex items-center justify-center perspective-1000">
            {/* Left Card (Background) */}
            <div className="absolute left-0 md:left-[10%] w-full max-w-sm glass-card rounded-2xl p-8 scale-90 opacity-40 blur-[2px] -translate-x-1/4 z-0 hidden md:block transition-all duration-500">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <BarChart3 className="w-5 h-5 text-white/50" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Volume Profiling</h3>
              <p className="text-text-secondary text-sm">Mapping transactional intensity to identify true support levels.</p>
            </div>

            {/* Center Card (Active) */}
            <div className="relative w-full max-w-md glass-card rounded-2xl p-10 scale-105 z-20 border-gold-dark/30 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(198,168,79,0.1)] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-gold-dark/10 to-transparent rounded-2xl pointer-events-none" />
              <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(198,168,79,0.4)]">
                <Activity className="w-6 h-6 text-bg-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Smart Liquidity Mapping</h3>
              <p className="text-text-secondary leading-relaxed">
                Identifying stop hunts and liquidity traps before they manifest in the order book. Our engine front-runs retail exhaustion.
              </p>
            </div>

            {/* Right Card (Background) */}
            <div className="absolute right-0 md:right-[10%] w-full max-w-sm glass-card rounded-2xl p-8 scale-90 opacity-40 blur-[2px] translate-x-1/4 z-0 hidden md:block transition-all duration-500">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6">
                <Shield className="w-5 h-5 text-white/50" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Risk Shield</h3>
              <p className="text-text-secondary text-sm">Proprietary hedging logic that activates during extreme volatility.</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-12 relative z-10">
            <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* TRUSTED INFRASTRUCTURE */}
        <section className="py-24 border-y border-white/5 bg-bg-secondary/30">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-center text-sm font-semibold tracking-widest text-text-secondary uppercase mb-12">
              TRUSTED INSTITUTIONAL INFRASTRUCTURE
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60">
              {['BINANCE LABS', 'RocketX', 'Kronos', 'CARBON', 'Gate.io'].map((partner, i) => (
                <div key={i} className="text-xl md:text-2xl font-serif font-bold tracking-wider hover:text-gold-light hover:opacity-100 transition-all duration-300 cursor-default">
                  {partner}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA SECTION */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,168,79,0.15)_0%,transparent_70%)]" />
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="font-serif text-5xl md:text-7xl mb-8">
              READY TO JOIN THE <span className="text-gradient-gold">TOP 1%?</span>
            </h2>
            <p className="text-text-secondary text-lg md:text-xl mb-12 leading-relaxed">
              Limited institutional seats available for Q4. Secure your allocation and gain access to the most sophisticated gold trading architecture ever deployed.
            </p>
            <button className="px-10 py-5 rounded-full bg-gradient-gold text-bg-primary font-bold text-lg hover:shadow-[0_0_40px_rgba(198,168,79,0.5)] transition-all duration-300 scale-100 hover:scale-105">
              APPLY FOR ACCESS
            </button>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-bg-secondary pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded bg-gradient-gold flex items-center justify-center">
                  <Activity className="w-5 h-5 text-bg-primary" />
                </div>
                <span className="font-serif font-semibold text-xl tracking-wide">GoldAlgo <span className="text-gold-light">Pro</span></span>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed max-w-sm">
                The pinnacle of institutional XAU/USD trading algorithms. Precision, performance, and professional-grade security for the global elite.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-6">Ecosystem</h4>
              <ul className="space-y-4 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-gold-light transition-colors">Strategy Engine</a></li>
                <li><a href="#" className="hover:text-gold-light transition-colors">Verified Backtests</a></li>
                <li><a href="#" className="hover:text-gold-light transition-colors">Yield Pricing</a></li>
                <li><a href="#" className="hover:text-gold-light transition-colors">Enterprise Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6">Resources</h4>
              <ul className="space-y-4 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-gold-light transition-colors">Market Intelligence</a></li>
                <li><a href="#" className="hover:text-gold-light transition-colors">REST API Docs</a></li>
                <li><a href="#" className="hover:text-gold-light transition-colors">Institutional Deck</a></li>
                <li><a href="#" className="hover:text-gold-light transition-colors">Security Audit 2024</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6">Connect</h4>
              <ul className="space-y-4 text-sm text-text-secondary">
                <li><a href="#" className="hover:text-gold-light transition-colors flex items-center gap-2"><Send className="w-4 h-4" /> Discord</a></li>
                <li><a href="#" className="hover:text-gold-light transition-colors flex items-center gap-2"><Twitter className="w-4 h-4" /> Twitter / X</a></li>
                <li><a href="#" className="hover:text-gold-light transition-colors flex items-center gap-2"><Send className="w-4 h-4" /> Telegram</a></li>
                <li><a href="#" className="hover:text-gold-light transition-colors flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</a></li>
              </ul>
            </div>

          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-text-secondary">
            <p>&copy; {new Date().getFullYear()} GoldAlgo Pro. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Risk Disclosure</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
