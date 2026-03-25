import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { UnitProvider } from '@/lib/context/UnitContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { Header } from '@/components/layout/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, full_name, unit_preference')
    .eq('id', user.id)
    .single()

  // Redirect to onboarding if profile is incomplete
  if (!profile?.username) {
    redirect('/onboarding')
  }

  return (
    <UnitProvider initialPreference={profile?.unit_preference ?? 'metric'}>
      <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header userName={profile?.full_name} />
          <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
            {children}
          </main>
        </div>
        <MobileNav />
      </div>
    </UnitProvider>
  )
}
