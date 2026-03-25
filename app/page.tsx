import Link from 'next/link'
import { Dumbbell, Camera, Sparkles, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const features = [
  {
    icon: Dumbbell,
    title: 'Workout Tracking',
    description: 'Log every set, rep, and weight. Automatically track personal records and training volume over time.',
    badge: null,
  },
  {
    icon: Camera,
    title: 'Photo Timeline',
    description: 'Upload weekly progress photos and see your transformation side-by-side. Visual proof of your hard work.',
    badge: null,
  },
  {
    icon: Sparkles,
    title: 'AI Physique Goal',
    description: 'Coming soon: AI-powered physique analysis, goal comparison scoring, and a 3D avatar that morphs toward your target body.',
    badge: 'Coming Soon',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-lg text-white">Arc</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        {/* Glow effect */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative space-y-6 max-w-2xl">
          <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-3 py-1">
            <Sparkles className="h-3 w-3 mr-1.5" />
            AI-powered physique tracking
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight">
            Arc
          </h1>

          <p className="text-xl md:text-2xl text-[#a1a1aa] font-light leading-relaxed">
            Track your transformation.{' '}
            <span className="text-white font-medium">See where you&apos;re going.</span>
          </p>

          <p className="text-base text-[#a1a1aa] max-w-md mx-auto">
            Log workouts, upload progress photos, and track your journey toward your goal physique — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/signup">
                Get Started <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="h-12 px-8 text-base">
              <Link href="/login">Log In</Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 pt-4">
            {['Free to start', 'No credit card', 'AI coming soon'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-[#a1a1aa]">
                <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-6 md:px-12 pb-24 max-w-5xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, badge }) => (
            <div
              key={title}
              className="relative bg-[#111111] border border-[#1a1a1a] rounded-2xl p-6 space-y-4 hover:border-[#2a2a2a] transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                {badge && (
                  <Badge variant="muted" className="text-xs">{badge}</Badge>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-white text-lg mb-2">{title}</h3>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">A</span>
          </div>
          <span className="font-semibold text-white">Arc</span>
        </div>
        <p className="text-xs text-[#a1a1aa]">Track your transformation. See where you&apos;re going.</p>
      </footer>
    </div>
  )
}
