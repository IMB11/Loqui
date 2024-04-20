export const metadata = {
  title: 'Loqui - Translations for all.',
  description: 'Free, open-source and community driven translations for all your favorite Minecraft mods.',
}

import Hero from '@/components/hero'
import Features from '@/components/features'
import Support from '@/components/support'
import Testimonials from '@/components/testimonials'

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Testimonials />
      <Support />
    </>
  )
}
