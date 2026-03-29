"use client";

import Link from 'next/link';
 
import { useLocaleStore } from '@/lib/store';
import { getTranslation } from '@/lib/i18n';

export default function LandingPage() {
  const { locale } = useLocaleStore();
  const t = getTranslation(locale);

  return (
    <div className="bg-background min-h-[calc(100vh-73px)] text-foreground relative overflow-hidden flex flex-col">
      {/* Background Graphic */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[150px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-32 pb-24 px-6 text-center">
        <div
           className="max-w-4xl animate-in fade-in slide-in-from-bottom-12 duration-1000"
        >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
               {t.heroTitleLine1} <br className="hidden md:block"/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                  {t.heroTitleLine2}
               </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-light leading-relaxed">
               {t.heroSubtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
               <Link href="/login">
                  <button className="px-8 py-3.5 rounded-full bg-primary text-black font-semibold text-lg shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] hover:scale-105 transition-all duration-300">
                     {t.btnGetStarted}
                  </button>
               </Link>
               <Link href="#features">
                  <button className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors duration-300">
                     {t.btnViewFeatures}
                  </button>
               </Link>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24 px-6 md:px-12 bg-black/40 border-y border-white/5">
         <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16">
                 <h2 className="text-3xl font-bold text-white mb-4">{t.featuresTitle}</h2>
                 <p className="text-muted-foreground">{t.featuresSubtitle}</p>
             </div>
             <div className="grid md:grid-cols-3 gap-6">
                {[
                  { title: "Predictive Wealth Engine", desc: "Instantly process street-view arrays into a continuous economic index." },
                  { title: "Policy Simulations", desc: "Inject bounding-box target regions and evaluate theoretical intervention impacts." },
                  { title: "Grad-CAM Observability", desc: "Zero-black-box AI. Review visual heatmaps explaining which features drove the index." }
                ].map((feature, i) => (
                  <div 
                     key={i}
                     className="p-8 rounded-2xl glass border border-white/10 hover:border-primary/50 transition-colors duration-300 animate-in fade-in slide-in-from-bottom-8 duration-1000"
                  >
                     <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold mb-4 text-xl">
                        {i + 1}
                     </div>
                     <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                     <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
             </div>
         </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-24 px-6 md:px-12">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-10">{t.useCasesTitle}</h2>
            <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
               <div className="p-6 glass rounded-xl flex-1 text-center border border-white/5">
                  <h4 className="text-lg font-bold text-primary mb-2">Government Planning</h4>
                  <p className="text-sm text-muted-foreground">Allocate federal budgets dynamically.</p>
               </div>
               <div className="p-6 glass rounded-xl flex-1 text-center border border-white/5">
                  <h4 className="text-lg font-bold text-primary mb-2">Non-Governmental Orgs</h4>
                  <p className="text-sm text-muted-foreground">Deploy relief resources precisely.</p>
               </div>
               <div className="p-6 glass rounded-xl flex-1 text-center border border-white/5">
                  <h4 className="text-lg font-bold text-primary mb-2">Smart Cities</h4>
                  <p className="text-sm text-muted-foreground">Track neighborhood revitalization.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center border-t border-border bg-black/60 relative z-10">
         <p className="text-muted-foreground text-sm">{t.footer}</p>
      </footer>
    </div>
  );
}
