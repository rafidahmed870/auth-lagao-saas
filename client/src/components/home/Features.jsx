import React from 'react'
import { Shield, Users, Database, Plug, Key, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Deep Encryption',
    description:
      'Secure your software assets with industry-standard AES-256 encryption protocols.',
  },
  {
    icon: Users,
    title: 'User Control',
    description:
      'Manage your users, subscriptions, and device bindings in real-time.',
  },
  {
    icon: Database,
    title: 'Secure Storage',
    description:
      'Store and sync application data remotely with encrypted at-rest protection.',
  },
  {
    icon: Plug,
    title: 'Integrations',
    description:
      'Connect your workflow with Discord webhooks and automated event notifications.',
  },
  {
    icon: Key,
    title: 'License Engine',
    description:
      'Flexible license generation with customizable expiry and HWID locking.',
  },
  {
    icon: CheckCircle,
    title: 'Clean API',
    description:
      'A simple REST API designed for ease of use and rapid deployment.',
  },
]

function Features() {
  return (
    <section id="features" className="relative py-28 overflow-hidden border-b border-border">
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">
            Features
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-space-grotesk font-bold leading-tight max-w-2xl mx-auto mb-6">
            Everything you need to secure your software.
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            A comprehensive suite of integrated tools for authentication,
            monetization, and user engagement.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {features.map((f, i) => (
            <div
              key={i}
              className="group p-7 rounded-2xl border border-border bg-card/50 hover:border-blue-500/30 hover:bg-card/80 transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center mb-5">
                <f.icon className="w-5 h-5 text-blue-400" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-foreground mb-2">
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
