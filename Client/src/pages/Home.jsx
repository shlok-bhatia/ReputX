<!DOCTYPE html>
<html class="dark" lang="en">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>EtherealVault | Your Wallet is Your Reputation</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=Manrope:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
<script id="tailwind-config">
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          "background": "#0e0e0f",
          "surface": "#0e0e0f",
          "surface-dim": "#0e0e0f",
          "surface-container-lowest": "#000000",
          "surface-container-low": "#131314",
          "surface-container": "#19191b",
          "surface-container-high": "#201f21",
          "surface-container-highest": "#262627",
          "surface-bright": "#2c2c2d",
          "surface-variant": "#262627",
          "primary": "#b6a0ff",
          "primary-dim": "#7e51ff",
          "primary-container": "#a98fff",
          "primary-fixed": "#a98fff",
          "secondary": "#00e3fd",
          "secondary-dim": "#00d4ec",
          "tertiary": "#ff6c95",
          "on-surface": "#ffffff",
          "on-surface-variant": "#adaaab",
          "on-primary": "#340090",
          "on-primary-fixed": "#000000",
          "on-secondary": "#004d57",
          "outline": "#767576",
          "outline-variant": "#484849",
          "inverse-primary": "#6834eb",
        },
        fontFamily: {
          headline: ["Space Grotesk", "sans-serif"],
          body: ["Manrope", "sans-serif"],
          label: ["Manrope", "sans-serif"],
        },
        borderRadius: { xl: "0.75rem", full: "9999px" }
      }
    }
  }
</script>
<style>
  * { box-sizing: border-box; }
  .material-symbols-outlined {
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    display: inline-block; vertical-align: middle;
  }
  body {
    background-color: #0e0e0f;
    color: #ffffff;
    font-family: 'Manrope', sans-serif;
    overflow-x: hidden;
  }
  .glass-card {
    background: rgba(38, 38, 39, 0.45);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }
  .neon-glow-primary { box-shadow: 0 0 22px rgba(182,160,255,0.28); }
  .neon-glow-cyan { box-shadow: 0 0 18px rgba(0,227,253,0.3); }
  .mesh-bg {
    background-image:
      radial-gradient(at 0% 0%, rgba(126,81,255,0.18) 0px, transparent 55%),
      radial-gradient(at 100% 0%, rgba(0,227,253,0.12) 0px, transparent 55%),
      radial-gradient(at 100% 100%, rgba(255,108,149,0.06) 0px, transparent 50%);
  }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes pulse-ring { 0%{opacity:0.6} 50%{opacity:0.2} 100%{opacity:0.6} }
  .float-anim { animation: float 6s ease-in-out infinite; }
  .pulse-ring { animation: pulse-ring 3s ease-in-out infinite; }
  .badge-item:hover { transform: scale(1.1); }
  .badge-item { transition: transform 0.2s; }
  .nav-link { transition: color 0.2s; }
  .nav-link:hover { color: #b6a0ff; }
  .btn-primary { transition: all 0.2s; }
  .btn-primary:hover { opacity: 0.88; transform: scale(1.03); }
  .btn-primary:active { transform: scale(0.97); }
  .feature-card { transition: all 0.25s; }
  .feature-card:hover { transform: translateY(-3px); }
</style>
</head>
<body class="mesh-bg min-h-screen flex flex-col">

<!-- TOP NAV -->
<nav class="fixed top-0 w-full z-50 bg-[#0e0e0f]/72 backdrop-blur-3xl border-b border-white/[0.06]">
  <div class="flex justify-between items-center h-[72px] px-8 max-w-[1400px] mx-auto">
    <div class="text-2xl font-extrabold bg-gradient-to-br from-[#b6a0ff] to-[#7e51ff] bg-clip-text text-transparent font-['Space_Grotesk'] tracking-tight">
      EtherealVault
    </div>
    <div class="hidden md:flex items-center gap-10 font-['Space_Grotesk'] font-semibold tracking-wide text-sm">
      <a href="page_home.html" class="text-[#b6a0ff] border-b-2 border-[#b6a0ff] pb-0.5">Home</a>
      <a href="page_leaderboard.html" class="text-[#adaaab] nav-link">Leaderboard</a>
      <a href="page_profile.html" class="text-[#adaaab] nav-link">Profile</a>
    </div>
    <div class="flex items-center gap-3">
      <a href="page_connect.html" class="btn-primary bg-gradient-to-br from-[#b6a0ff] to-[#7e51ff] text-black font-bold px-6 py-2.5 rounded-full text-sm neon-glow-primary">
        Connect Wallet
      </a>
    </div>
  </div>
</nav>

<!-- MAIN -->
<main class="flex-grow pt-[72px] px-6 max-w-[1200px] mx-auto w-full">

  <!-- HERO -->
  <section class="relative py-20 mb-20">
    <div class="absolute -top-20 -left-20 w-[400px] h-[400px] bg-[#7e51ff]/20 rounded-full blur-[110px] pointer-events-none pulse-ring"></div>

    <div class="max-w-[680px]">
      <div class="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-[#00e3fd]/10 border border-[#00e3fd]/25">
        <span class="material-symbols-outlined text-[#00e3fd] text-sm" style="font-variation-settings:'FILL' 1">verified</span>
        <span class="text-[#00e3fd] text-xs font-bold uppercase tracking-[0.18em] font-['Manrope']">Decentralized Trust Layer</span>
      </div>

      <h1 class="font-headline text-[clamp(48px,7vw,82px)] font-extrabold leading-[1.06] tracking-[-2px] text-white mb-6">
        Your Wallet is Your
        <span class="block bg-gradient-to-r from-[#b6a0ff] via-[#00e3fd] to-[#7e51ff] bg-clip-text text-transparent">Reputation</span>
      </h1>

      <p class="font-body text-lg md:text-xl text-[#adaaab] max-w-[560px] mb-10 leading-relaxed">
        Analyze on-chain activity. Build trust. Unlock Web3 with a decentralized identity score that reflects your true contribution to the ecosystem.
      </p>

      <div class="flex flex-wrap gap-4">
        <a href="page_connect.html" class="btn-primary inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-br from-[#b6a0ff] to-[#7e51ff] rounded-full text-black font-bold text-base neon-glow-primary">
          Connect Wallet
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </a>
        <a href="page_profile.html" class="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base border border-white/10 bg-white/[0.04]">
          View Demo
        </a>
      </div>
    </div>

    <!-- Floating Score Orb -->
    <div class="absolute right-0 top-8 hidden lg:flex items-center justify-center float-anim" style="width:300px;height:300px;">
      <div class="relative w-full h-full flex items-center justify-center">
        <div class="absolute inset-0 rounded-full border border-[#b6a0ff]/15 pulse-ring"></div>
        <div class="absolute inset-6 rounded-full bg-[#7e51ff]/08"></div>
        <svg width="220" height="220" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="52" fill="none" stroke="#262627" stroke-width="9"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke="#00e3fd" stroke-width="9"
            stroke-dasharray="326.7" stroke-dashoffset="57.8"
            stroke-linecap="round" transform="rotate(-90 60 60)"
            style="filter:drop-shadow(0 0 8px rgba(0,227,253,0.75))"/>
          <text x="60" y="56" text-anchor="middle" fill="white" font-size="21" font-weight="800" font-family="Space Grotesk">842</text>
          <text x="60" y="69" text-anchor="middle" fill="#adaaab" font-size="7" font-family="Manrope">PLATINUM</text>
        </svg>
      </div>
    </div>
  </section>

  <!-- BENTO GRID -->
  <section class="grid grid-cols-1 md:grid-cols-12 gap-5 mb-28">

    <!-- Reputation Score (7 cols) -->
    <div class="md:col-span-7 glass-card rounded-[2rem] p-9 border border-white/[0.07] overflow-hidden relative feature-card group">
      <div class="absolute bottom-[-10%] right-[-8%] w-56 h-56 bg-[#00e3fd]/10 rounded-full blur-[70px] transition-all group-hover:bg-[#00e3fd]/20"></div>
      <div class="relative z-10">
        <span class="text-[#00e3fd] font-label text-[11px] uppercase tracking-[0.2em] mb-4 block font-bold">Identity Core</span>
        <h3 class="font-headline text-[28px] font-bold mb-4">Reputation Score</h3>
        <p class="text-[#adaaab] text-[15px] max-w-md mb-8 leading-relaxed">
          A dynamic 0–1000 scale calculating your reliability based on wallet age, transaction volume, and cross-chain interactions.
        </p>
        <div class="flex items-end gap-8">
          <svg width="148" height="148" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#262627" stroke-width="9"/>
            <circle cx="60" cy="60" r="52" fill="none" stroke="#00e3fd" stroke-width="9"
              stroke-dasharray="326.7" stroke-dashoffset="57.8"
              stroke-linecap="round" transform="rotate(-90 60 60)"
              style="filter:drop-shadow(0 0 7px rgba(0,227,253,0.8))"/>
            <text x="60" y="57" text-anchor="middle" fill="white" font-size="22" font-weight="800" font-family="Space Grotesk">842</text>
            <text x="60" y="70" text-anchor="middle" fill="#adaaab" font-size="7" font-family="Manrope">PLATINUM</text>
          </svg>
          <div class="flex flex-col gap-3 pb-2">
            <div class="flex items-center gap-2.5">
              <div class="w-2 h-2 rounded-full bg-[#00e3fd]" style="box-shadow:0 0 6px #00e3fd"></div>
              <span class="text-[13px] text-[#adaaab]">Top 0.5% of Ecosystem</span>
            </div>
            <div class="flex items-center gap-2.5">
              <div class="w-2 h-2 rounded-full bg-[#b6a0ff]" style="box-shadow:0 0 6px #b6a0ff"></div>
              <span class="text-[13px] text-[#adaaab]">+12 pts last 30 days</span>
            </div>
            <div class="flex items-center gap-2.5">
              <div class="w-2 h-2 rounded-full bg-[#ff6c95]"></div>
              <span class="text-[13px] text-[#adaaab]">Sybil risk: LOW</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sybil Detection (5 cols) -->
    <div class="md:col-span-5 glass-card rounded-[2rem] p-9 border border-white/[0.07] feature-card group">
      <div class="w-14 h-14 bg-[#262627] rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
        <span class="material-symbols-outlined text-[#00e3fd] text-3xl" style="font-variation-settings:'FILL' 1">verified_user</span>
      </div>
      <h3 class="font-headline text-[22px] font-bold mb-3">Sybil Detection</h3>
      <p class="text-[#adaaab] mb-7 text-[14px] leading-relaxed">
        AI-driven patterns identifying organic human behavior vs. automated bot farming scripts.
      </p>
      <div class="bg-black rounded-xl p-4 border border-white/[0.05]">
        <div class="flex justify-between items-center mb-2.5">
          <span class="text-xs text-[#adaaab]">Human Probability</span>
          <span class="text-xs text-[#00e3fd] font-bold">99.2%</span>
        </div>
        <div class="w-full bg-[#262627] h-1.5 rounded-full">
          <div class="bg-[#00e3fd] h-full rounded-full" style="width:99.2%;box-shadow:0 0 10px rgba(0,227,253,0.6)"></div>
        </div>
      </div>
    </div>

    <!-- Governance (5 cols) -->
    <div class="md:col-span-5 glass-card rounded-[2rem] p-9 border border-white/[0.07] flex flex-col justify-between feature-card">
      <div>
        <div class="w-14 h-14 bg-[#262627] rounded-2xl flex items-center justify-center mb-6">
          <span class="material-symbols-outlined text-[#ff6c95] text-3xl" style="font-variation-settings:'FILL' 1">account_balance</span>
        </div>
        <h3 class="font-headline text-[22px] font-bold mb-3">Governance Alpha</h3>
        <p class="text-[#adaaab] text-[14px] leading-relaxed">
          Track participation in Tally, Snapshot, and on-chain voting to prove governance commitment.
        </p>
      </div>
      <div class="flex -space-x-3 mt-7">
        <div class="w-10 h-10 rounded-full border-2 border-[#0e0e0f] bg-[#3b82f6] flex items-center justify-center overflow-hidden text-xs font-bold">E</div>
        <div class="w-10 h-10 rounded-full border-2 border-[#0e0e0f] bg-[#8b5cf6] flex items-center justify-center overflow-hidden text-xs font-bold">U</div>
        <div class="w-10 h-10 rounded-full border-2 border-[#0e0e0f] bg-[#f59e0b] flex items-center justify-center overflow-hidden text-xs font-bold">A</div>
        <div class="w-10 h-10 rounded-full border-2 border-[#0e0e0f] bg-[#262627] flex items-center justify-center text-[10px] font-bold">+12</div>
      </div>
    </div>

    <!-- Badges (7 cols) -->
    <div class="md:col-span-7 glass-card rounded-[2rem] p-9 border border-white/[0.07] relative overflow-hidden feature-card">
      <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-[#b6a0ff]/06 rounded-full blur-[50px]"></div>
      <div class="flex justify-between items-start mb-8">
        <div>
          <h3 class="font-headline text-[22px] font-bold mb-1.5">On-chain Badges</h3>
          <p class="text-[#adaaab] text-[13px] max-w-xs">Non-transferable proof of skills and achievements earned on-chain.</p>
        </div>
        <a href="page_profile.html" class="text-[#b6a0ff] font-bold hover:underline flex items-center gap-1 text-sm">
          View All <span class="material-symbols-outlined text-sm">open_in_new</span>
        </a>
      </div>
      <div class="grid grid-cols-4 gap-4">
        <div class="badge-item aspect-square bg-[#b6a0ff]/12 rounded-2xl flex flex-col items-center justify-center gap-2 border border-[#b6a0ff]/20 cursor-pointer" style="box-shadow:0 0 12px rgba(182,160,255,0.15)">
          <span class="material-symbols-outlined text-[#b6a0ff] text-3xl" style="font-variation-settings:'FILL' 1">shield</span>
          <span class="text-[9px] text-[#adaaab] uppercase tracking-wider">Clean Record</span>
        </div>
        <div class="badge-item aspect-square bg-[#00e3fd]/10 rounded-2xl flex flex-col items-center justify-center gap-2 border border-[#00e3fd]/20 cursor-pointer" style="box-shadow:0 0 12px rgba(0,227,253,0.12)">
          <span class="material-symbols-outlined text-[#00e3fd] text-3xl" style="font-variation-settings:'FILL' 1">bolt</span>
          <span class="text-[9px] text-[#adaaab] uppercase tracking-wider">Power User</span>
        </div>
        <div class="badge-item aspect-square bg-[#ff6c95]/10 rounded-2xl flex flex-col items-center justify-center gap-2 border border-[#ff6c95]/20 cursor-pointer">
          <span class="material-symbols-outlined text-[#ff6c95] text-3xl" style="font-variation-settings:'FILL' 1">workspace_premium</span>
          <span class="text-[9px] text-[#adaaab] uppercase tracking-wider">OG Wallet</span>
        </div>
        <div class="badge-item aspect-square bg-[#a98fff]/10 rounded-2xl flex flex-col items-center justify-center gap-2 border border-[#a98fff]/20 cursor-pointer">
          <span class="material-symbols-outlined text-[#a98fff] text-3xl" style="font-variation-settings:'FILL' 1">military_tech</span>
          <span class="text-[9px] text-[#adaaab] uppercase tracking-wider">DAO Founder</span>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA SECTION -->
  <section class="mb-28 text-center py-20 relative rounded-[3rem] overflow-hidden border border-[#b6a0ff]/12">
    <div class="absolute inset-0 bg-gradient-to-br from-[#7e51ff]/12 via-black to-[#00e3fd]/10"></div>
    <div class="relative z-10 px-6">
      <h2 class="font-headline text-[clamp(30px,5vw,50px)] font-extrabold mb-5">Ready to claim your Vault?</h2>
      <p class="text-[#adaaab] text-lg max-w-xl mx-auto mb-10 leading-relaxed">
        Join 500,000+ users building trust in the next generation of the internet.
      </p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <a href="page_connect.html" class="btn-primary inline-flex items-center justify-center gap-2 px-10 py-4 rounded-full text-base font-bold bg-[#b6a0ff] text-black" style="box-shadow:0 0 30px rgba(182,160,255,0.35)">
          Mint Your ID
        </a>
        <button class="btn-primary px-10 py-4 rounded-full text-base font-bold bg-white/05 backdrop-blur-md border border-white/10">
          Learn More
        </button>
      </div>
    </div>
  </section>

</main>

<!-- FOOTER -->
<footer class="w-full py-10 px-8 bg-black border-t border-white/[0.05]">
  <div class="flex flex-col md:flex-row justify-between items-center gap-6 max-w-[1200px] mx-auto">
    <div>
      <div class="text-lg font-extrabold text-[#b6a0ff] font-['Space_Grotesk']">Ethereal Vault</div>
      <p class="text-xs text-[#adaaab] mt-1">© 2026 Ethereal Vault. Secured by Decentralized Consensus.</p>
    </div>
    <div class="flex flex-wrap justify-center gap-7 text-xs text-[#adaaab]">
      <a href="#" class="hover:text-white transition-colors">Privacy Protocol</a>
      <a href="#" class="hover:text-white transition-colors">Terms of Service</a>
      <a href="#" class="hover:text-white transition-colors">Github</a>
      <a href="#" class="hover:text-white transition-colors">Discord</a>
    </div>
  </div>
</footer>

</body>
</html>