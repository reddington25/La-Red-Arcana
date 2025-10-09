import { FeaturedSpecialistsCarousel } from './FeaturedSpecialistsCarousel'
import { PlatformMetrics } from './PlatformMetrics'
import { ActivityFeed } from './ActivityFeed'
import { Testimonials } from './Testimonials'

export function SocialProof() {
  return (
    <section className="py-20 px-4">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
        La Red en Acción
      </h2>
      
      {/* Featured Specialists Carousel */}
      <FeaturedSpecialistsCarousel />
      
      {/* Platform Metrics */}
      <PlatformMetrics />
      
      {/* Real-time Activity Feed */}
      <ActivityFeed />
      
      {/* Student Testimonials */}
      <Testimonials />
    </section>
  )
}
