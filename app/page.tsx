'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

// ── Inline mockup components ─────────────────────────────────────

function WorkoutMockup() {
  const exercises = [
    { name: 'Bench Press',    sets: '4 × 5',  weight: '185 lbs', pr: true,  pct: 100 },
    { name: 'Incline Press',  sets: '3 × 8',  weight: '135 lbs', pr: false, pct: 72  },
    { name: 'Cable Flyes',    sets: '3 × 12', weight: '50 lbs',  pr: false, pct: 58  },
    { name: 'Tricep Pushdown',sets: '3 × 15', weight: '70 lbs',  pr: false, pct: 65  },
  ]

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Chest Day
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Today, 5:30 PM &middot; 4 exercises
          </p>
        </div>
        <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--accent-cyan)' }}>
          4,280 kg
        </span>
      </div>
      <div className="px-5 py-4 space-y-4">
        {exercises.map((ex) => (
          <div key={ex.name} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {ex.name}
                </span>
                {ex.pr && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      color: 'var(--accent-gold)',
                      background: 'rgba(212, 175, 55, 0.12)',
                      border: '1px solid rgba(212, 175, 55, 0.25)',
                    }}
                  >
                    PR
                  </span>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {ex.sets} @ {ex.weight}
              </span>
            </div>
            <div
              className="w-16 h-1 rounded-full flex-shrink-0 overflow-hidden"
              style={{ background: 'var(--bg-subtle)' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${ex.pct}%`,
                  background: ex.pr ? 'var(--accent-gold)' : 'var(--accent-violet)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PhotoMockup() {
  const cards = [
    {
      label: 'Week 1',
      date: 'Jan 6',
      highlight: false,
      src: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&q=80',
    },
    {
      label: 'Week 8',
      date: 'Mar 3',
      highlight: false,
      src: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80',
    },
    {
      label: 'Week 16',
      date: 'Apr 28',
      highlight: true,
      src: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80',
    },
  ]

  return (
    <div className="relative h-80 flex items-center justify-center">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="absolute rounded-xl overflow-hidden"
          style={{
            width: 140,
            height: 200,
            transform: `translate(${(i - 1) * 40}px, ${(i - 1) * 8}px) rotate(${(i - 1) * 3}deg)`,
            zIndex: i,
            border: `1px solid ${card.highlight ? 'rgba(124,58,237,0.45)' : 'rgba(255,255,255,0.07)'}`,
            boxShadow: card.highlight ? '0 0 24px rgba(124,58,237,0.25)' : undefined,
          }}
        >
          <Image
            src={card.src}
            alt={card.label}
            fill
            className="object-cover"
            sizes="140px"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }}
          />
          {/* Label bar */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5 space-y-1">
            <p className="text-[10px] font-medium" style={{ color: '#fff' }}>
              {card.label}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {card.date}
              </p>
              {card.highlight && (
                <span
                  className="text-[9px] px-1 py-0.5 rounded"
                  style={{
                    color: 'var(--accent-cyan)',
                    background: 'rgba(6, 182, 212, 0.15)',
                  }}
                >
                  +12pts
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AIMockup() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
      <div className="grid grid-cols-2 relative" style={{ height: 280 }}>
        {/* Before panel */}
        <div className="relative overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80"
            alt="Before"
            fill
            className="object-cover object-top"
            sizes="50vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }}
          />
          <p className="absolute bottom-3 left-3 section-label z-10" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Before
          </p>
        </div>

        {/* Divider */}
        <div
          className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-px z-10"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        />

        {/* AI Goal panel */}
        <div className="relative overflow-hidden" style={{ border: '1px solid rgba(124,58,237,0.4)', boxShadow: '0 0 30px rgba(124,58,237,0.18)' }}>
          <Image
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80"
            alt="AI Goal"
            fill
            className="object-cover object-top"
            sizes="50vw"
          />
          {/* Violet tint overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(30,10,60,0.65) 0%, rgba(124,58,237,0.08) 60%, transparent 100%)' }}
          />
          {/* AI badge */}
          <span
            className="absolute top-2.5 right-2.5 z-10 text-[9px] px-1.5 py-0.5 rounded font-medium"
            style={{
              background: 'rgba(124,58,237,0.55)',
              color: '#fff',
              border: '1px solid rgba(124,58,237,0.7)',
              backdropFilter: 'blur(4px)',
            }}
          >
            AI
          </span>
          <p className="absolute bottom-3 left-3 section-label z-10" style={{ color: 'var(--accent-violet)' }}>
            AI Goal
          </p>
        </div>
      </div>
      <div
        className="flex items-center justify-center py-3"
        style={{
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <span
          className="text-xs px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(124, 58, 237, 0.1)',
            color: 'var(--accent-violet)',
            border: '1px solid rgba(124, 58, 237, 0.25)',
          }}
        >
          Powered by Flux AI + Easel AI
        </span>
      </div>
    </div>
  )
}

// ── Data ─────────────────────────────────────────────────────────

const features = [
  {
    label: 'Workout Tracking',
    headline: ['Every Rep.', 'Every Set.', 'Every Win.'],
    body: 'Log workouts with our intuitive tracker. Auto-detect personal records and watch your strength compound over time.',
    bullets: [
      '50+ exercises with autocomplete',
      'Automatic PR detection with gold badges',
      'Volume tracking and progress charts',
    ],
    mockup: WorkoutMockup,
    imageLeft: false,
  },
  {
    label: 'Photo Timeline',
    headline: ['Your Transformation,', 'Documented.'],
    body: 'Upload front, back, and side photos to build a complete visual record of your progress. AI scores each upload against your goal.',
    bullets: [],
    mockup: PhotoMockup,
    imageLeft: true,
  },
  {
    label: 'AI Physique Analysis',
    headline: ['See Where', "You're Going."],
    body: "Upload your photo and let Arc's AI show you a realistic, personalized vision of your goal physique. Not fantasy — achievable.",
    bullets: [],
    mockup: AIMockup,
    imageLeft: false,
  },
]

const steps = [
  {
    title: 'Upload',
    desc: 'Take your baseline photos from three angles — front, back, and side.',
  },
  {
    title: 'Generate',
    desc: 'AI creates a personalized, realistic vision of your goal physique.',
  },
  {
    title: 'Track',
    desc: 'Log workouts and upload progress photos. Watch your score climb.',
  },
]

// ── Page ─────────────────────────────────────────────────────────

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Navigation ──────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 md:px-16 transition-all duration-300"
        style={{
          height: 64,
          background: scrolled ? 'rgba(8, 8, 8, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled
            ? '1px solid var(--border-subtle)'
            : '1px solid transparent',
        }}
      >
        <Link
          href="/"
          className="font-bold text-lg tracking-wide"
          style={{ color: 'var(--text-primary)' }}
        >
          Arc
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex text-sm px-4 py-2 rounded-lg transition-colors duration-150 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm px-4 py-2 rounded-lg font-medium transition-opacity duration-150 hover:opacity-85 active:scale-[0.98]"
            style={{ background: 'var(--accent-violet)', color: '#fff' }}
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center"
        style={{ height: '100vh', minHeight: 700 }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80"
            alt="Gym"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(8,8,8,0.35) 0%, rgba(8,8,8,0.80) 55%, rgba(8,8,8,1) 100%)',
            }}
          />
        </div>

        <div className="relative z-10 text-center px-6 max-w-[800px] mx-auto">
          <p className="section-label mb-6 inline-block" style={{ color: 'var(--accent-cyan)' }}>
            AI-Powered Fitness
          </p>

          <h1
            className="font-extrabold leading-none mb-6"
            style={{
              fontSize: 'clamp(36px, 8vw, 80px)',
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
            }}
          >
            Track Your Journey.<br />
            See Your Future.
          </h1>

          <p
            className="text-lg leading-relaxed mb-10 mx-auto"
            style={{ color: 'var(--text-secondary)', maxWidth: 500 }}
          >
            Arc uses AI to show you what consistent training can achieve — then holds you
            accountable every step of the way.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 px-8 py-3.5 rounded-lg font-medium text-base transition-opacity duration-150 hover:opacity-85 active:scale-[0.98]"
              style={{ background: 'var(--accent-violet)', color: '#fff' }}
            >
              Start Your Transformation
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-3.5 rounded-lg font-medium text-base transition-colors duration-150 border border-[var(--border-default)] hover:border-[var(--border-strong)]"
              style={{ color: 'var(--text-primary)' }}
            >
              See How It Works
            </Link>
          </div>

          <p className="mt-8 text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Join 1,000+ athletes tracking their transformation
          </p>
        </div>
      </section>

      {/* ── Social proof strip ──────────────────────────────── */}
      <div
        className="py-10"
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-0 sm:gap-8 text-center px-6">
          {[
            { stat: '10K+',    label: 'Workouts Logged' },
            { stat: '94%',     label: 'Users See Progress in 30 Days' },
            { stat: '3 Views', label: 'AI Physique Analysis' },
          ].map(({ stat, label }) => (
            <div key={stat} className="py-5 sm:py-0 border-b border-[var(--border-subtle)] sm:border-b-0 last:border-b-0 last:pb-0">
              <div
                className="text-2xl font-bold tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {stat}
              </div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature sections ────────────────────────────────── */}
      {features.map((feature, i) => {
        const Mockup = feature.mockup
        return (
          <section
            key={feature.label}
            className="py-16 md:py-28 px-6 md:px-16"
            style={{
              background: i % 2 === 1 ? 'var(--bg-surface)' : 'var(--bg-primary)',
              borderTop: i % 2 === 1 ? '1px solid var(--border-subtle)' : 'none',
              borderBottom: i % 2 === 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div
              className={`max-w-5xl mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-center ${
                feature.imageLeft
                  ? 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1'
                  : ''
              }`}
            >
              <div className="order-2 md:order-none">
                <Mockup />
              </div>
              <div className="order-1 md:order-none">
                <p className="section-label mb-4">{feature.label}</p>
                <h2
                  className="font-extrabold leading-tight mb-5"
                  style={{
                    fontSize: 'clamp(32px, 3.5vw, 44px)',
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.03em',
                  }}
                >
                  {feature.headline.map((line, j) => (
                    <span key={j}>
                      {line}
                      {j < feature.headline.length - 1 && <br />}
                    </span>
                  ))}
                </h2>
                <p
                  className="text-base leading-relaxed mb-6"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {feature.body}
                </p>
                {feature.bullets.length > 0 && (
                  <ul className="space-y-3">
                    {feature.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-center gap-3 text-sm"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <span
                          className="flex-shrink-0 h-px"
                          style={{ width: 16, background: 'var(--accent-cyan)' }}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        )
      })}

      {/* ── How it works ────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-28 px-6 md:px-16"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <p className="section-label mb-4">The Process</p>
            <h2
              className="font-extrabold"
              style={{
                fontSize: 'clamp(32px, 3.5vw, 44px)',
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
              }}
            >
              Simple. Consistent. Effective.
            </h2>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Violet dot connector */}
            <div
              className="absolute top-8 hidden sm:flex items-center"
              style={{
                left: 'calc(16.67% + 28px)',
                right: 'calc(16.67% + 28px)',
                height: 1,
              }}
            >
              {Array.from({ length: 24 }).map((_, k) => (
                <span
                  key={k}
                  className="flex-1 flex justify-center"
                >
                  <span
                    style={{
                      display: 'block',
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      background: 'rgba(124,58,237,0.4)',
                    }}
                  />
                </span>
              ))}
            </div>

            {steps.map((step, i) => (
              <div key={step.title} className="text-center relative">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 relative z-10"
                  style={{
                    background: 'var(--bg-primary)',
                    border: '1px solid rgba(124,58,237,0.4)',
                  }}
                >
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {i + 1}
                  </span>
                </div>
                <h3 className="font-bold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────── */}
      <section
        className="py-32 px-6 text-center"
        style={{
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <p className="section-label mb-5">Get Started</p>
        <h2
          className="font-extrabold mb-10 mx-auto"
          style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            color: 'var(--text-primary)',
            letterSpacing: '-0.03em',
            maxWidth: 520,
          }}
        >
          Your Best Physique Starts Today.
        </h2>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-10 py-4 rounded-lg font-medium text-base transition-opacity duration-150 hover:opacity-85 active:scale-[0.98]"
          style={{ background: 'var(--accent-violet)', color: '#fff' }}
        >
          Create Your Free Account
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-5 text-sm" style={{ color: 'var(--text-tertiary)' }}>
          No credit card required &middot; Cancel anytime
        </p>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        className="py-8 px-5 sm:px-8 md:px-16 flex flex-col sm:flex-row items-center sm:justify-between gap-1"
        style={{
          background: 'var(--bg-primary)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Arc &copy; 2026
        </span>
        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Built with AI
        </span>
      </footer>
    </div>
  )
}
