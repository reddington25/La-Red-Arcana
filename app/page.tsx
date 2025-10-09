import { MatrixRain } from '@/components/matrix-rain/MatrixRain'
import { HeroSection } from '@/components/homepage/HeroSection'
import { HowItWorks } from '@/components/homepage/HowItWorks'
import { SocialProof } from '@/components/homepage/SocialProof'
import { FAQ } from '@/components/homepage/FAQ'
import { FinalCTA } from '@/components/homepage/FinalCTA'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white relative">
      {/* Matrix Rain Background */}
      <MatrixRain />
      
      {/* Homepage Sections */}
      <HeroSection />
      <HowItWorks />
      <SocialProof />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
