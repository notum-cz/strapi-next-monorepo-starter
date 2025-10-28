// ============================================================================
// New World Kids - Impact Dashboard
// Real projects: Indigo Azul, Culture Shock, Culture Shock Sports, Real Minority Report
// Food, Water, Energy, Shelter - Building for 7 Generations
// ============================================================================

'use client';

import { BuildingProgressBar } from '@/components/impact/BuildingProgressBar';
import { ProjectCardNew } from '@/components/impact/ProjectCardNew';
import { NonprofitImpactHUD } from '@/components/cockpit/GameUI/NonprofitImpactHUD';
import { StarField3D } from '@/components/cockpit/GameUI/StarField3D';
import { motion } from 'framer-motion';
import { Heart, Leaf, Users, Globe } from 'lucide-react';
import Link from 'next/link';

// Real New World Kids Projects
const NEW_WORLD_KIDS_PROJECTS = [
  {
    id: '1',
    title: 'Proyecto Indigo Azul',
    subtitle: 'Food Forest & Sustainability',
    description: 'A thriving food forest in Puerto Vallarta, Mexico creating sustainable food systems and teaching regenerative agriculture for future generations.',
    status: 'active' as const,
    season: 'Season 4',
    location: 'Puerto Vallarta, Mexico',
    imageUrl: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&q=80',
    category: 'food' as const,
    fundingProgress: 85,
    impactStats: [
      { label: 'Trees Planted', value: '500+' },
      { label: 'Food Produced', value: '2 tons/yr' },
    ],
    detailsUrl: '#', // TODO: Create detail pages
  },
  {
    id: '2',
    title: 'Culture Shock Program',
    subtitle: 'Life Skills & Self-Sufficiency Training',
    description: 'Training young adults (18-25) in food, water, energy, and shelter self-sufficiency. Building inclusive, sustainable communities for 7 generations.',
    status: 'active' as const,
    location: 'International',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
    category: 'education' as const,
    fundingProgress: 72,
    impactStats: [
      { label: 'Graduates', value: '127' },
      { label: 'Active Students', value: '45' },
    ],
    detailsUrl: '#',
  },
  {
    id: '3',
    title: 'Culture Shock Sports',
    subtitle: 'Athlete Mentorship & Documentation',
    description: 'Supporting young athletes and their families through mentorship, documentation, and empowering their journey in a decentralized, community-driven way.',
    status: 'building' as const,
    location: 'Pacific Northwest',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    category: 'sports' as const,
    fundingProgress: 45,
    impactStats: [
      { label: 'Athletes Supported', value: '23' },
      { label: 'Families Helped', value: '18' },
    ],
    detailsUrl: '#',
  },
  {
    id: '4',
    title: 'The Real Minority Report',
    subtitle: 'Decentralized Community Newspaper',
    description: 'A social-purpose newspaper featuring helpful connections for people of color in the Pacific Northwest. First issue drops New Year 2026!',
    status: 'launching' as const,
    launchDate: 'New Year 2026 - Collector\'s Edition with local artists, NFT cards, free tokens & chance to win BTC!',
    location: 'Pacific Northwest',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80',
    category: 'media' as const,
    fundingProgress: 30,
    impactStats: [
      { label: 'Articles Ready', value: '42' },
      { label: 'Contributors', value: '15' },
    ],
    detailsUrl: '#',
  },
];

export default function ImpactDashboard() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 3D Background */}
      <StarField3D />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden border-b border-cyan-500/20 bg-gradient-to-br from-slate-900/80 via-purple-900/40 to-slate-900/80 backdrop-blur-xl">
          {/* Animated scan line */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
          />

          <div className="mx-auto max-w-7xl px-8 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Live indicator */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-500/20 px-4 py-2 border border-green-500/30">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-mono text-green-400 uppercase tracking-wide">
                  Live Impact Tracking
                </span>
              </div>

              {/* Main heading */}
              <h1 className="text-6xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Building for
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  7 Generations
                </span>
              </h1>

              <p className="text-xl text-slate-300 max-w-3xl mb-8 leading-relaxed">
                New World Kids creates projects and programs that make real impact in{' '}
                <span className="text-green-400 font-semibold">food</span>,{' '}
                <span className="text-blue-400 font-semibold">water</span>,{' '}
                <span className="text-yellow-400 font-semibold">energy</span>, and{' '}
                <span className="text-purple-400 font-semibold">shelter</span>.
                <br />
                <span className="text-slate-400 text-lg mt-2 block">
                  Creating inclusive, self-sufficient communities for generations to come.
                </span>
              </p>

              {/* Mission pillars */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="flex items-center gap-2 text-green-400">
                  <Leaf className="w-5 h-5" />
                  <span className="font-semibold">Food</span>
                </div>
                <div className="flex items-center gap-2 text-blue-400">
                  <Globe className="w-5 h-5" />
                  <span className="font-semibold">Water</span>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">Energy</span>
                </div>
                <div className="flex items-center gap-2 text-purple-400">
                  <Heart className="w-5 h-5" />
                  <span className="font-semibold">Shelter</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4">
                <Link
                  href="#projects"
                  className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  View Our Projects
                  <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
                </Link>
                <Link
                  href="/cockpit"
                  className="px-8 py-4 bg-slate-800/50 backdrop-blur rounded-xl font-semibold text-slate-300 border border-slate-700/50 hover:border-cyan-500/50 hover:text-white transition-all"
                >
                  Mission Control
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Building Progress */}
        <div className="mx-auto max-w-7xl px-8 py-12">
          <BuildingProgressBar progress={75} />
        </div>

        {/* Impact Metrics HUD */}
        <div className="mx-auto max-w-7xl px-8 py-12">
          <NonprofitImpactHUD />
        </div>

        {/* Projects Section */}
        <div id="projects" className="mx-auto max-w-7xl px-8 py-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-12 text-center">
              <h2 className="text-5xl font-bold text-white mb-4">
                Our Projects & Programs
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                Each project addresses critical needs in food, education, sports, and media.
                <br />
                <span className="text-cyan-400">Active</span> means fully operational. <span className="text-yellow-400">Building</span> means in development.
              </p>
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {NEW_WORLD_KIDS_PROJECTS.map((project, i) => (
                <ProjectCardNew key={project.id} project={project} index={i} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Mission Statement */}
        <div className="mx-auto max-w-7xl px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 via-cyan-500 to-purple-500 rounded-2xl blur opacity-20" />
            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-slate-700/50">
              <div className="flex items-start gap-6">
                <div className="text-6xl">🌍</div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Our Mission: Simple & Clear
                  </h3>
                  <p className="text-lg text-slate-300 leading-relaxed mb-6">
                    We're a <span className="text-cyan-400 font-semibold">nonprofit media company</span> creating
                    real-world projects that teach self-sufficiency in food, water, energy, and shelter.
                  </p>
                  <p className="text-lg text-slate-300 leading-relaxed mb-6">
                    Through <span className="text-purple-400 font-semibold">Proyecto Indigo Azul</span>, we grow food forests.
                    Through <span className="text-green-400 font-semibold">Culture Shock</span>, we train young adults in life skills.
                    Through <span className="text-yellow-400 font-semibold">Culture Shock Sports</span>, we mentor athletes.
                    Through <span className="text-pink-400 font-semibold">The Real Minority Report</span>, we amplify community voices.
                  </p>
                  <p className="text-xl font-semibold text-white">
                    Goal: Create an inclusive, self-sufficient standard of living for the next 7 generations. 🌱
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* How You Can Help */}
        <div className="mx-auto max-w-7xl px-8 py-12 mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-gradient-to-br from-purple-900/50 to-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/30"
            >
              <div className="text-4xl mb-4">💰</div>
              <h4 className="text-xl font-bold text-white mb-2">Donate</h4>
              <p className="text-slate-300 mb-4">
                Support our projects with Bitcoin or traditional donations. 100% transparent tracking.
              </p>
              <button className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                Donate Now
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="bg-gradient-to-br from-cyan-900/50 to-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/30"
            >
              <div className="text-4xl mb-4">🤝</div>
              <h4 className="text-xl font-bold text-white mb-2">Volunteer</h4>
              <p className="text-slate-300 mb-4">
                Join our Culture Shock program or help with projects. Learn while making impact.
              </p>
              <button className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors">
                Get Involved
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-gradient-to-br from-green-900/50 to-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-green-500/30"
            >
              <div className="text-4xl mb-4">📢</div>
              <h4 className="text-xl font-bold text-white mb-2">Share Our Story</h4>
              <p className="text-slate-300 mb-4">
                Help us reach more people who want to build a sustainable future for 7 generations.
              </p>
              <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors">
                Share Now
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
