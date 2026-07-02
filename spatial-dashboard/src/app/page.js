import dynamic from 'next/dynamic';
import { loadDashboardData } from '../lib/dashboard-data';

/**
 * Dynamic Import Isolation Layer
 * * Bypasses Next.js Node.js Server-Side Rendering (SSR) loops entirely.
 * This guarantees heavy WebGL frameworks (Three.js, R3F, GSAP) are only parsed 
 * once the application secures safe hardware context inside the client browser.
 */
const IntelligenceHub = dynamic(
  () => import('../components/IntelligenceHub'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030712] text-slate-300">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 px-6 py-4 shadow-2xl backdrop-blur-md">
          <div className="text-xs uppercase tracking-[0.28em] text-cyan-300/80">
            Preparing real dashboard data
          </div>
          <div className="mt-2 h-1.5 w-64 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }
);

export default async function Home() {
  const dashboardData = await loadDashboardData();

  return <IntelligenceHub {...dashboardData} />;
}