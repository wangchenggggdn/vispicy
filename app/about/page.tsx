'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { Sparkles, Users, Target, Eye, HeartHandshake, Shield, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Empowering Creativity with AI
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Vispicy is a cutting-edge AI creative platform that transforms imagination into reality.
              We're on a mission to make professional-quality visual content creation accessible to everyone,
              regardless of their technical expertise or artistic background.
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-10 shadow-lg">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Story</h2>
                </div>
              </div>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  Founded in 2023, Vispicy emerged from a simple observation: while AI technology was advancing rapidly,
                  the tools to harness this power remained complex and inaccessible to most creators. We believed that
                  everyone deserves access to professional-grade creative tools.
                </p>
                <p className="text-lg">
                  Our team of AI researchers, designers, and engineers came together with a shared vision: to build a
                  platform that combines the power of advanced AI models with an intuitive, user-friendly interface.
                  We wanted to create something that digital artists, marketing teams, content creators, and businesses
                  could all use to bring their ideas to life.
                </p>
                <p className="text-lg">
                  Today, Vispicy serves thousands of users worldwide, generating over 50,000 unique creations.
                  We've built four powerful AI tools—Text to Image, Image to Image, Text to Video, and Image to Video—
                  each designed to unlock new possibilities in visual content creation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-red-100 rounded-lg">
                  <Target className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                To democratize creative expression by providing accessible, powerful AI tools that empower anyone
                to create professional-quality visual content. We believe creativity should know no boundaries—
                neither technical nor financial.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Eye className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                A world where anyone, anywhere can transform their ideas into stunning visual reality.
                We envision a future where AI augments human creativity, enabling new forms of artistic expression
                and making visual storytelling accessible to all.
              </p>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Our Core Values</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Innovation */}
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Innovation First</h3>
                <p className="text-gray-600">
                  We constantly push the boundaries of what's possible with AI, investing in research and
                  development to bring you the latest advancements in generative AI technology.
                </p>
              </div>

              {/* User-Centric */}
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">User-Centric Design</h3>
                <p className="text-gray-600">
                  Every feature we build is designed with our users in mind. We listen to feedback,
                  iterate rapidly, and ensure our tools are intuitive and accessible to everyone.
                </p>
              </div>

              {/* Quality */}
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Quality Excellence</h3>
                <p className="text-gray-600">
                  We never compromise on quality. From output resolution to generation speed, every aspect
                  of our platform is optimized to deliver the best possible results.
                </p>
              </div>

              {/* Trust */}
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Trust & Security</h3>
                <p className="text-gray-600">
                  Your privacy and data security are our top priorities. We use enterprise-grade encryption
                  and never share your creations without your explicit permission.
                </p>
              </div>

              {/* Accessibility */}
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartHandshake className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Accessibility</h3>
                <p className="text-gray-600">
                  Creative tools should be accessible to everyone. We offer flexible pricing, free credits
                  to get started, and plans that scale with your needs.
                </p>
              </div>

              {/* Transparency */}
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Transparency</h3>
                <p className="text-gray-600">
                  We believe in being open about our capabilities, limitations, and pricing. No hidden fees,
                  no surprise charges, and clear communication about what our AI can and cannot do.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Powered by Advanced AI</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
              Our platform leverages state-of-the-art generative AI models to deliver exceptional results
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-3 text-purple-600">Text to Image</h3>
                <p className="text-gray-600">
                  Advanced diffusion models trained on billions of images, capable of generating
                  stunning visuals in any style you can imagine.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-3 text-blue-600">Image to Image</h3>
                <p className="text-gray-600">
                  Sophisticated image understanding and transformation algorithms that enable
                  style transfer, enhancement, and creative variations.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-3 text-pink-600">Video Generation</h3>
                <p className="text-gray-600">
                  Cutting-edge video synthesis models that create smooth, high-quality animations
                  from text descriptions or static images.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 py-16 bg-gradient-to-r from-red-600 to-orange-600">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-5xl font-bold mb-2">1000+</div>
                <div className="text-red-100">Active Users</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">50K+</div>
                <div className="text-red-100">Creations Made</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">4</div>
                <div className="text-red-100">AI Tools</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">99.9%</div>
                <div className="text-red-100">Uptime</div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Get in Touch</h2>
            <p className="text-xl text-gray-600 mb-8">
              Have questions about Vispicy? We'd love to hear from you.
              Our team is here to help you make the most of our AI creative tools.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:opacity-90 transition text-lg"
              >
                Contact Us
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-red-600 hover:text-red-600 transition text-lg"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Vispicy</h3>
            <p className="text-sm text-gray-600">
              AI-powered creative tools for everyone. Transform your ideas into stunning visuals.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Tools</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/text-to-image" className="hover:text-red-600 transition">Text to Image</Link></li>
              <li><Link href="/image-to-image" className="hover:text-red-600 transition">Image to Image</Link></li>
              <li><Link href="/text-to-video" className="hover:text-red-600 transition">Text to Video</Link></li>
              <li><Link href="/image-to-video" className="hover:text-red-600 transition">Image to Video</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/about" className="hover:text-red-600 transition">About Us</Link></li>
              <li><Link href="/pricing" className="hover:text-red-600 transition">Pricing</Link></li>
              <li><Link href="/contact" className="hover:text-red-600 transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/privacy" className="hover:text-red-600 transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-red-600 transition">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-600 pt-8 border-t border-gray-200">
          <p>&copy; {new Date().getFullYear()} Vispicy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
