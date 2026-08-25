"use client";
import React from 'react';
import Link from 'next/link';

export default function CitizenHome() {
  return (
    <>
      

<div className="ambient-mesh"></div>

<header className="fixed top-0 w-full z-50 flex justify-between items-center px-gutter h-16 bg-surface-glass backdrop-blur-xl border-b border-white/10 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
<div className="font-headline-md text-headline-md font-bold text-primary tracking-tighter">
            CivicShield AI
        </div>
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer scale-105 transition-transform" >notifications</span>
<span className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer scale-105 transition-transform" >account_circle</span>
</div>
</header>

<main className="flex-grow pt-24 pb-32 px-gutter max-w-container-max mx-auto w-full flex flex-col gap-stack-lg">

<section className="flex flex-col items-center justify-center text-center py-20 relative">
<div className="absolute inset-0 -z-10 flex items-center justify-center opacity-30 blur-[100px] pointer-events-none">
<div className="w-64 h-64 bg-primary-container rounded-full"></div>
</div>
<h1 className="font-display-lg text-display-lg md:font-display-lg md:text-display-lg font-headline-lg-mobile text-headline-lg-mobile mb-stack-md bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary-container">
                Your Voice, Our Action.
            </h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mb-stack-lg">
                Report local issues instantly. Our AI-driven platform verifies and routes your reports to the right officials, ensuring a safer, cleaner community for everyone.
            </p>
<Link href="/report" className="btn-neon-blue font-headline-md text-headline-md px-8 py-4 rounded-xl flex items-center gap-3">
<svg className="w-6 h-6 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(77,142,255,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle><line x1="12" y1="10" x2="12" y2="16"></line><line x1="9" y1="13" x2="15" y2="13"></line></svg>
                Report an Issue
            </Link>
</section>

<section className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="glass-panel glass-panel-top-light rounded-xl p-8 flex flex-col items-center text-center float-subtle backdrop-blur-xl border-white/10" >
<div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6 border border-white/5 shadow-lg">
<span className="material-symbols-outlined text-4xl text-primary" >upload_file</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">1. Upload</h3>
<p className="text-on-surface-variant font-body-md text-body-md">Snap a photo and briefly describe the issue. Our platform handles the rest.</p>
</div>
<div className="glass-panel glass-panel-top-light rounded-xl p-8 flex flex-col items-center text-center float-subtle glass-ai-verified backdrop-blur-xl border-white/10" >
<div className="w-16 h-16 rounded-full bg-secondary-container/20 flex items-center justify-center mb-6 border border-secondary-container shadow-[0_0_15px_rgba(139,92,246,0.3)]">
<span className="material-symbols-outlined text-4xl text-secondary-container animate-pulse" >psychology</span>
</div>
<h3 className="font-headline-md text-headline-md text-secondary mb-2">2. AI Scan</h3>
<p className="text-on-surface-variant font-body-md text-body-md">CivicShield AI analyzes the image, categorizes the problem, and assesses urgency.</p>
</div>
<div className="glass-panel glass-panel-top-light rounded-xl p-8 flex flex-col items-center text-center floating delay-300">
<div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6 border border-white/5 shadow-inner">
<svg className="w-10 h-10 text-success-emerald drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-transform duration-500 hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" strokeDasharray="4 2"></circle><path d="m9 12 2 2 4-4" strokeWidth="2.5"></path><path d="M12 2v4M12 18v4M2 12h4M18 12h4" opacity="0.5"></path></svg>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">3. Resolve</h3>
<p className="text-on-surface-variant font-body-md text-body-md">Routed directly to municipal workflows for fast, transparent resolution.</p>
</div>
</section>

<section className="mt-stack-lg">
<div className="flex justify-between items-end mb-stack-md border-b border-white/10 pb-4">
<h2 className="font-headline-lg text-headline-lg font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Community Feed</h2>
<a className="text-primary hover:text-primary-container font-label-caps text-label-caps flex items-center gap-1 transition-colors" href="#">
                    View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
</a>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

<div className="glass-panel rounded-xl overflow-hidden group backdrop-blur-xl border-white/10">
<div className="h-48 w-full relative overflow-hidden">
<div className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500" data-alt="A futuristic high-tech digital rendering of a pothole on an urban street at night, illuminated by neon blue and purple streetlights, conveying a modern cyberpunk civic environment." ></div>
<div className="absolute top-4 left-4">
<span className="bg-surface-glass backdrop-blur-md text-warning-amber border border-warning-amber/30 px-3 py-1 rounded-full font-label-caps text-label-caps flex items-center gap-1">
<svg className="w-3 h-3 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2" fill="currentColor"></circle></svg> In Progress
                             </span>
</div>
</div>
<div className="p-6">
<div className="flex items-start justify-between mb-2">
<h4 className="font-headline-md text-headline-md text-on-surface">Deep Pothole on 5th Ave</h4>
<span className="font-label-caps text-label-caps text-on-surface-variant">2h ago</span>
</div>
<p className="text-on-surface-variant mb-4 text-sm line-clamp-2">Reported structural damage to the road surface causing traffic delays. Public works team dispatched.</p>
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-sm text-primary">person</span>
</div>
<span className="text-sm text-on-surface-variant">Reported by Citizen #8492</span>
</div>
</div>
</div>

<div className="glass-panel glass-ai-verified rounded-xl overflow-hidden group relative backdrop-blur-xl border-white/10">

<div className="absolute inset-0 bg-gradient-to-r from-secondary-container/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
<div className="h-48 w-full relative overflow-hidden">
<div className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500" data-alt="A clean modern park setting at twilight, slightly stylized with a dark mode aesthetic and subtle neon glow accents around the pathways, indicating a safe and technologically monitored civic space." ></div>
<div className="absolute top-4 left-4">
<span className="bg-surface-glass backdrop-blur-md text-success-emerald border border-success-emerald/30 px-3 py-1 rounded-full font-label-caps text-label-caps flex items-center gap-1">
<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"></path><path d="M20 6L9 17l-5-5" opacity="0.3" strokeWidth="5"></path></svg> Resolved
                             </span>
</div>
<div className="absolute top-4 right-4">
<span className="bg-secondary-container/80 backdrop-blur-md text-on-secondary-container px-2 py-1 rounded font-label-caps text-label-caps flex items-center gap-1 shadow-[0_0_10px_rgba(139,92,246,0.5)]">
<svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M12 2v7M12 15v7M2 12h7M15 12h7M5 5l5 5M14 14l5 5M5 19l5-5M14 10l5-5"></path></svg> AI Verified
                             </span>
</div>
</div>
<div className="p-6">
<div className="flex items-start justify-between mb-2">
<h4 className="font-headline-md text-headline-md text-on-surface">Broken Streetlight Fixed</h4>
<span className="font-label-caps text-label-caps text-on-surface-variant">5h ago</span>
</div>
<p className="text-on-surface-variant mb-4 text-sm line-clamp-2">The lighting issue in Centennial Park has been resolved. Area is now fully illuminated and safe.</p>
<div className="flex items-center gap-2">
<div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center">
<span className="material-symbols-outlined text-sm text-primary">person</span>
</div>
<span className="text-sm text-on-surface-variant">Reported by Citizen #1105</span>
</div>
</div>
</div>
</div>
</section>
</main>

<nav className="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-2 md:hidden bg-surface-glass backdrop-blur-lg rounded-t-xl border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.5)] backdrop-blur-xl">

<div className="flex flex-col items-center justify-center bg-primary-container/30 text-primary rounded-xl p-2 shadow-[0_0_10px_rgba(173,198,255,0.4)] w-16 tap-highlight-transparent active:scale-95 transition-transform">
<span className="material-symbols-outlined" >home</span>
<span className="font-label-caps text-label-caps mt-1">Home</span>
</div>

<div className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-16 tap-highlight-transparent active:scale-95 transition-transform">
<span className="material-symbols-outlined" >explore</span>
<span className="font-label-caps text-label-caps mt-1">Map</span>
</div>

<div className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-16 tap-highlight-transparent active:scale-95 transition-transform">
<span className="material-symbols-outlined" >analytics</span>
<span className="font-label-caps text-label-caps mt-1">Reports</span>
</div>

<div className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-16 tap-highlight-transparent active:scale-95 transition-transform">
<span className="material-symbols-outlined" >person</span>
<span className="font-label-caps text-label-caps mt-1">Profile</span>
</div>
</nav>



    </>
  );
}
