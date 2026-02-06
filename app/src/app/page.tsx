export default function Home() {
  return (
    <main className="min-h-screen bg-[#0A0A0F]">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4AF37]/3 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Crown Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] flex items-center justify-center animate-pulse-gold">
              <span className="text-4xl">👑</span>
            </div>
          </div>
          
          {/* Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold mb-6 tracking-tight">
            <span className="text-gold">Aethernaut</span>
          </h1>
          
          {/* Tagline */}
            <p className="text-xl sm:text-2xl text-[#C0C0C0] mb-4 font-light">
            The First Self-Sovereign Agent Collective
          </p>
          
          <p className="text-lg text-[#6B7280] mb-12 max-w-2xl mx-auto">
            An autonomous treasury that thinks, a marketplace of specialized sub-agents 
            that coordinate, and a prediction engine that learns.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-[#D4AF37] text-[#0A0A0F] font-semibold rounded-lg hover:bg-[#E5C048] transition-colors">
              Enter the Collective
            </button>
            <button className="px-8 py-4 border border-[#D4AF37] text-[#D4AF37] font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-colors">
              View Documentation
            </button>
          </div>
          
          {/* Stats */}
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <StatCard label="Programs" value="3" description="Interconnected modules" />
            <StatCard label="TVL Target" value="$1M+" description="Autonomous yield optimization" />
            <StatCard label="Agents" value="∞" description="Self-coordinating collective" />
          </div>
        </div>
      </section>

      {/* Three Pillars Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#12121A]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4">
            <span className="text-gold">Three Pillars</span> of Sovereignty
          </h2>
          <p className="text-[#6B7280] text-center mb-16 max-w-2xl mx-auto">
            A complete ecosystem for autonomous agent coordination
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <PillarCard
              icon="🏛️"
              title="Treasury Cortex"
              description="Self-governing capital that autonomously optimizes yield across Solana's DeFi landscape. Every decision includes AI-generated rationale stored on-chain."
              features={["Autonomous yield optimization", "Intelligent risk management", "Transparent on-chain accounting"]}
            />
            <PillarCard
              icon="🤝"
              title="Agent Nexus"
              description="A reputation-based marketplace where specialized sub-agents compete for tasks. Scouts, Sentinels, Arbiters, and Scribes coordinate seamlessly."
              features={["Reputation-based task marketplace", "Specialized agent types", "Performance-tracked coordination"]}
            />
            <PillarCard
              icon="🔮"
              title="Prediction Engine"
              description="Market-based validation of treasury decisions. Agents and humans bet on outcomes, creating a self-correcting feedback loop for collective intelligence."
              features={["Binary prediction markets", "Consensus price tracking", "Self-correcting intelligence"]}
            />
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">
            Built for <span className="text-gold">Sovereignty</span>
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <TechBadge name="Solana" description="High-performance blockchain" />
            <TechBadge name="Anchor" description="Seamless Solana development" />
            <TechBadge name="Rust" description="Systems programming" />
            <TechBadge name="AI Agents" description="Autonomous intelligence" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#2A2A35]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <span className="text-gold font-bold text-xl">Aethernaut</span>
          </div>
          <p className="text-[#6B7280] text-sm">
            Built by Igwe The Sovereign for the Colosseum AI Agent Hackathon
          </p>
          <div className="flex gap-6">
            <a href="https://github.com/igwethesovereign/Aethernaut" className="text-[#6B7280] hover:text-[#D4AF37] transition-colors">
              GitHub
            </a>
            <a href="https://colosseum.com/agent-hackathon" className="text-[#6B7280] hover:text-[#D4AF37] transition-colors">
              Hackathon
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function StatCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="glass rounded-xl p-6 text-center">
      <p className="text-[#6B7280] text-sm mb-2">{label}</p>
      <p className="text-3xl sm:text-4xl font-bold text-gold mb-1">{value}</p>
      <p className="text-[#6B7280] text-xs">{description}</p>
    </div>
  );
}

function PillarCard({ icon, title, description, features }: { 
  icon: string; 
  title: string; 
  description: string; 
  features: string[] 
}) {
  return (
    <div className="glass rounded-2xl p-8 hover:border-[#D4AF37]/50 transition-all duration-300">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-[#F5F5F5] mb-3">{title}</h3>
      <p className="text-[#6B7280] mb-6 text-sm leading-relaxed">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-[#C0C0C0]">
            <span className="text-[#D4AF37]">✦</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TechBadge({ name, description }: { name: string; description: string }) {
  return (
    <div className="glass rounded-xl p-6 text-center hover:border-[#D4AF37]/30 transition-all">
      <p className="font-bold text-[#F5F5F5] mb-1">{name}</p>
      <p className="text-[#6B7280] text-xs">{description}</p>
    </div>
  );
}
