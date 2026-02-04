'use client';

import Link from 'next/link';
import { ImageIcon, VideoIcon, Sparkles, Zap, Shield, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';

export const dynamic = 'force-dynamic';

// Sample works data with descriptive alt text for SEO
const sampleWorks = [
  {
    id: 1,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1614730341194-75c60740a2d3?w=400&h=400&fit=crop',
    title: 'Cyberpunk City',
    alt: 'AI-generated cyberpunk cityscape with neon lights and futuristic buildings'
  },
  {
    id: 2,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ez97e20?w=400&h=400&fit=crop',
    title: 'Fantasy Forest',
    alt: 'Magical fantasy forest created by AI with glowing mushrooms and ethereal lighting'
  },
  {
    id: 3,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=400&h=400&fit=crop',
    title: 'AI Portrait',
    alt: 'Professional AI-generated portrait with realistic details and lighting'
  },
  {
    id: 4,
    type: 'image',
    url: 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=400&h=400&fit=crop',
    title: 'Artistic Painting',
    alt: 'AI-created artistic painting in impressionist style with vibrant colors'
  },
];

export default function Home() {
  // JSON-LD Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Vispicy',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1000',
    },
    description: 'AI-powered creative tools for generating stunning images and videos from text descriptions or reference images.',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <Header />

        {/* Hero Section - Semantic HTML with SEO keywords */}
        <header className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent leading-tight">
              Create Stunning Visuals with AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your imagination into reality with Vispicy's advanced AI image and video generation tools.
              From text to images, image to image, to dynamic videos – bring your creative vision to life in seconds.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <Link
                href="/text-to-image"
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:opacity-90 transition shadow-lg text-lg"
                aria-label="Start creating for free with Vispicy AI tools"
              >
                Start Creating for Free
              </Link>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-20" itemScope itemType="https://schema.org/Organization">
            <div className="text-center bg-white rounded-xl p-6 shadow-sm">
              <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">50,000+</div>
              <div className="text-gray-600">Creations Made</div>
            </div>
            <div className="text-center bg-white rounded-xl p-6 shadow-sm">
              <div className="text-4xl font-bold text-pink-600 mb-2">4</div>
              <div className="text-gray-600">Powerful AI Tools</div>
            </div>
          </div>
        </header>

        <main>
          {/* AI Tools Showcase - Semantic Section */}
          <section className="container mx-auto px-4 py-16" aria-labelledby="ai-tools-heading">
            <h2 id="ai-tools-heading" className="text-3xl font-bold text-center text-gray-900 mb-4">
              Powerful AI Creative Tools
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Explore our suite of AI-powered tools designed to transform your creative workflow
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Text to Image */}
              <article itemScope itemType="https://schema.org/SoftwareApplication">
                <Link href="/text-to-image" className="group block">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-purple-200 h-full">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition flex-shrink-0">
                        <ImageIcon className="w-8 h-8 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-gray-800" itemProp="name">
                          Text to Image
                        </h3>
                        <p className="text-gray-600 mb-4" itemProp="description">
                          Generate stunning images from text descriptions. Simply describe your vision, and our AI creates high-quality images in multiple styles and resolutions.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2" />
                            <span>Multiple artistic styles</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2" />
                            <span>High-resolution output</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2" />
                            <span>Fast generation</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>

              {/* Image to Image */}
              <article itemScope itemType="https://schema.org/SoftwareApplication">
                <Link href="/image-to-image" className="group block">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-blue-200 h-full">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition flex-shrink-0">
                        <ImageIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-gray-800" itemProp="name">
                          Image to Image
                        </h3>
                        <p className="text-gray-600 mb-4" itemProp="description">
                          Transform and enhance your images with AI. Upload a reference image, describe your desired changes, and watch the magic happen.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" />
                            <span>Style transfer</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" />
                            <span>Image enhancement</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2" />
                            <span>Creative variations</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>

              {/* Text to Video */}
              <article itemScope itemType="https://schema.org/SoftwareApplication">
                <Link href="/text-to-video" className="group block">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-pink-200 h-full">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition flex-shrink-0">
                        <VideoIcon className="w-8 h-8 text-pink-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-gray-800" itemProp="name">
                          Text to Video
                        </h3>
                        <p className="text-gray-600 mb-4" itemProp="description">
                          Create dynamic video content from text descriptions. Bring your stories to life with AI-generated videos that captivate and engage.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-pink-600 mr-2" />
                            <span>Scene generation</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-pink-600 mr-2" />
                            <span>Motion creation</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-pink-600 mr-2" />
                            <span>HD quality output</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>

              {/* Image to Video */}
              <article itemScope itemType="https://schema.org/SoftwareApplication">
                <Link href="/image-to-video" className="group block">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-indigo-200 h-full">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition flex-shrink-0">
                        <VideoIcon className="w-8 h-8 text-indigo-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2 text-gray-800" itemProp="name">
                          Image to Video
                        </h3>
                        <p className="text-gray-600 mb-4" itemProp="description">
                          Animate your static images and turn them into dynamic videos. Perfect for social media, marketing, and creative projects.
                        </p>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 mr-2" />
                            <span>Smooth animations</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 mr-2" />
                            <span>Multiple effects</span>
                          </li>
                          <li className="flex items-center">
                            <CheckCircle2 className="w-4 h-4 text-indigo-600 mr-2" />
                            <span>Easy to use</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Link>
              </article>
            </div>
          </section>

          {/* Gallery Section */}
          <section className="container mx-auto px-4 py-16 bg-white" aria-labelledby="gallery-heading">
            <h2 id="gallery-heading" className="text-3xl font-bold text-center text-gray-900 mb-4">
              AI-Generated Showcase
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Explore stunning creations powered by Vispicy AI. Each image is generated entirely by artificial intelligence.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {sampleWorks.map((work) => (
                <div
                  key={work.id}
                  className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition"
                >
                  <img
                    src={work.url}
                    alt={work.alt}
                    title={work.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-semibold">{work.title}</h3>
                      <p className="text-white/80 text-sm">AI Generated</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Why Choose Vispicy */}
          <section className="container mx-auto px-4 py-16" aria-labelledby="why-heading">
            <h2 id="why-heading" className="text-3xl font-bold text-center text-gray-900 mb-4">
              Why Choose Vispicy
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Powerful AI technology meets intuitive design, giving you the tools to create without limits
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="text-center bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">High Quality Output</h3>
                <p className="text-gray-600">
                  Powered by advanced AI models generating high-resolution images and videos with stunning detail and vibrant colors
                </p>
              </div>

              <div className="text-center bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Lightning Fast</h3>
                <p className="text-gray-600">
                  Optimized AI processing delivers images in seconds and completes videos quickly, maximizing your creative efficiency
                </p>
              </div>

              <div className="text-center bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">Secure & Reliable</h3>
                <p className="text-gray-600">
                  Encrypted data transfer protects your privacy and creations, providing stable and reliable service you can trust
                </p>
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="container mx-auto px-4 py-16 bg-white" aria-labelledby="usecases-heading">
            <h2 id="usecases-heading" className="text-3xl font-bold text-center text-gray-900 mb-12">
              Perfect For Every Creative Need
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🎨</div>
                <h3 className="font-bold text-lg mb-2">Digital Artists</h3>
                <p className="text-sm text-gray-600">Generate concepts, explore styles, and accelerate your creative process</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">💼</div>
                <h3 className="font-bold text-lg mb-2">Marketing Teams</h3>
                <p className="text-sm text-gray-600">Create eye-catching visuals for campaigns and social media in minutes</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="font-bold text-lg mb-2">Content Creators</h3>
                <p className="text-sm text-gray-600">Produce unique images and videos that stand out and engage your audience</p>
              </div>
              <div className="text-center p-6">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="font-bold text-lg mb-2">Businesses</h3>
                <p className="text-sm text-gray-600">Professional visuals for presentations, websites, and marketing materials</p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 py-20">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-12 text-white max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Create Amazing Content?</h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Join thousands of creators using Vispicy to bring their ideas to life. Start with free credits and upgrade for premium features.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/text-to-image"
                  className="px-8 py-4 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
                >
                  Try Free Now
                </Link>
                <Link
                  href="/subscription"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition text-lg"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer - Semantic HTML */}
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
              <nav aria-label="AI tools navigation">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/text-to-image" className="hover:text-red-600 transition">Text to Image</Link></li>
                  <li><Link href="/image-to-image" className="hover:text-red-600 transition">Image to Image</Link></li>
                  <li><Link href="/text-to-video" className="hover:text-red-600 transition">Text to Video</Link></li>
                  <li><Link href="/image-to-video" className="hover:text-red-600 transition">Image to Video</Link></li>
                </ul>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <nav aria-label="Company navigation">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/about" className="hover:text-red-600 transition">About Us</Link></li>
                  <li><Link href="/pricing" className="hover:text-red-600 transition">Pricing</Link></li>
                  <li><Link href="/contact" className="hover:text-red-600 transition">Contact</Link></li>
                </ul>
              </nav>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <nav aria-label="Legal navigation">
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><Link href="/privacy" className="hover:text-red-600 transition">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-red-600 transition">Terms of Service</Link></li>
                </ul>
              </nav>
            </div>
          </div>
          <div className="text-center text-sm text-gray-600 pt-8 border-t border-gray-200">
            <p>&copy; {new Date().getFullYear()} Vispicy. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
