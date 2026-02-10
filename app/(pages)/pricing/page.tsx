'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, Coins, Zap, Crown, Star, ArrowRight, Sparkles } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'weekly' | 'yearly'>('weekly');
  const plans = [
    {
      id: 'lite',
      name: 'Lite',
      description: 'Perfect for beginners and casual creators',
      coins: { weekly: 600, yearly: 4000 },
      price: { weekly: 7.99, yearly: 39.99 },
      originalPrice: { weekly: null, yearly: null },
      period: 'per week / per year',
      popular: false,
      color: 'gray',
      features: {
        speed: 'Standard Speed (1.0x)',
        imageDiscount: '70% Off',
        videoDiscount: '70% Off',
        support: 'Standard Support',
        hdOutput: true,
        imageModels: true,
        videoModels: true,
        priority: false,
        api: false,
      },
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'Best value for serious creators',
      coins: { weekly: 1200, yearly: 8000 },
      price: { weekly: 9.99, yearly: 69.99 },
      originalPrice: { weekly: 19.99, yearly: 139.98 },
      period: 'per week / per year',
      popular: true,
      discount: '50% OFF',
      color: 'blue',
      features: {
        speed: 'Fast Speed (1.5x)',
        imageDiscount: '50% Off',
        videoDiscount: '50% Off',
        support: 'Priority Support',
        hdOutput: true,
        imageModels: true,
        videoModels: true,
        priority: true,
        api: false,
      },
    },
    {
      id: 'max',
      name: 'Max',
      description: 'Maximum power for professionals and teams',
      coins: { weekly: 3500, yearly: 25000 },
      price: { weekly: 29.99, yearly: 169 },
      originalPrice: { weekly: 99.99, yearly: 499.99 },
      period: 'per week / per year',
      popular: false,
      discount: '70% OFF',
      color: 'purple',
      features: {
        speed: 'Ultra Fast Speed (2.0x)',
        imageDiscount: 'FREE',
        videoDiscount: '30% Off',
        support: 'VIP Support',
        hdOutput: true,
        imageModels: true,
        videoModels: true,
        priority: true,
        api: true,
      },
    },
  ];

  const features = [
    { name: 'Coins Included', description: 'Number of coins included in your plan' },
    { name: 'Generation Speed', description: 'Faster generation for paid plans' },
    { name: 'HD Output', description: 'High-resolution output quality' },
    { name: 'Image Generation', description: 'Access to all image models' },
    { name: 'Video Generation', description: 'Access to all video models' },
    { name: 'Image Generation Cost', description: 'Discount on image generation' },
    { name: 'Video Generation Cost', description: 'Discount on video generation' },
    { name: 'Priority Support', description: 'Faster response times' },
    { name: 'API Access', description: 'Programmatic access (coming soon)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Flexible pricing for every need</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Choose the plan that fits your creative needs. All plans include access to our complete suite of
              AI tools. Start with free credits and upgrade as you grow.
            </p>
          </div>
        </section>

        {/* Pricing Toggle */}
        <section className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <div className="bg-white rounded-full p-1 flex items-center shadow-lg">
              <button
                onClick={() => setBillingCycle('weekly')}
                className={`px-8 py-3 rounded-full font-semibold transition ${
                  billingCycle === 'weekly'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-8 py-3 rounded-full font-semibold transition relative pr-12 ${
                  billingCycle === 'yearly'
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-2 right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                  Save 50%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-8 shadow-xl transition transform hover:scale-105 ${
                  plan.popular ? 'ring-4 ring-red-500' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}

                {/* Discount Badge */}
                {plan.discount && (
                  <div className="absolute top-6 right-6 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {plan.discount}
                  </div>
                )}

                {/* Plan Name */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>

                {/* Coins */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Coins className="w-6 h-6 text-yellow-500" />
                    <span className="text-4xl font-bold text-yellow-600">
                      {billingCycle === 'weekly' ? plan.coins.weekly : plan.coins.yearly}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">coins included</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">
                      ${billingCycle === 'weekly' ? plan.price.weekly : plan.price.yearly}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    per {billingCycle === 'weekly' ? 'week' : 'year'}
                  </p>
                  {billingCycle === 'weekly' && plan.originalPrice.weekly && (
                    <p className="text-gray-400 line-through text-sm">was ${plan.originalPrice.weekly}</p>
                  )}
                  {billingCycle === 'yearly' && plan.originalPrice.yearly && (
                    <p className="text-gray-400 line-through text-sm">was ${plan.originalPrice.yearly}</p>
                  )}
                </div>

                {/* Features */}
                <div className="mt-8 space-y-4">
                  {/* Speed */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-700">Speed</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{plan.features.speed}</span>
                  </div>

                  {/* HD Output */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-gray-700">HD Output</span>
                    </div>
                    <Check className="w-5 h-5 text-blue-500" />
                  </div>

                  {/* Image Models */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-700">Image Models</span>
                    </div>
                    <Check className="w-5 h-5 text-purple-500" />
                  </div>

                  {/* Video Models */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-pink-500" />
                      <span className="text-sm text-gray-700">Video Models</span>
                    </div>
                    <Check className="w-5 h-5 text-pink-500" />
                  </div>

                  {/* Image Cost */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm text-gray-700">Image Cost</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{plan.features.imageDiscount}</span>
                  </div>

                  {/* Video Cost */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-gray-700">Video Cost</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{plan.features.videoDiscount}</span>
                  </div>

                  {/* Support */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Support</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{plan.features.support}</span>
                  </div>

                  {/* API Access */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">API Access</span>
                    </div>
                    {plan.features.api ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Yearly Pricing Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Yearly Plans - Save 50%</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
              Commit to a yearly plan and save 50% compared to weekly billing. Perfect for serious creators and teams.
            </p>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-900">Plan</th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-900">Lite</th>
                      <th className="text-center py-4 px-4 font-semibold text-blue-600">Pro</th>
                      <th className="text-center py-4 px-4 font-semibold text-purple-600">Max</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium">Coins</td>
                      <td className="text-center py-4 px-4">
                        <span className="font-bold text-yellow-600">4,000</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="font-bold text-yellow-600">8,000</span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="font-bold text-yellow-600">25,000</span>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium">Yearly Price</td>
                      <td className="text-center py-4 px-4 font-bold">$39.99</td>
                      <td className="text-center py-4 px-4 font-bold">$69.99</td>
                      <td className="text-center py-4 px-4 font-bold">$169.00</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium">Equivalent Weekly</td>
                      <td className="text-center py-4 px-4">$0.77/week</td>
                      <td className="text-center py-4 px-4">$1.35/week</td>
                      <td className="text-center py-4 px-4">$3.25/week</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium">Speed</td>
                      <td className="text-center py-4 px-4">Standard (1.0x)</td>
                      <td className="text-center py-4 px-4 bg-yellow-100 rounded-lg font-semibold">Fast (1.5x)</td>
                      <td className="text-center py-4 px-4 bg-yellow-100 rounded-lg font-semibold">Ultra (2.0x)</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium">Image Generation</td>
                      <td className="text-center py-4 px-4">70% Off</td>
                      <td className="text-center py-4 px-4">50% Off</td>
                      <td className="text-center py-4 px-4 bg-green-100 rounded-lg font-semibold">FREE</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-4 font-medium">Video Generation</td>
                      <td className="text-center py-4 px-4">70% Off</td>
                      <td className="text-center py-4 px-4">50% Off</td>
                      <td className="text-center py-4 px-4">30% Off</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-medium">Support</td>
                      <td className="text-center py-4 px-4 text-gray-500">Standard</td>
                      <td className="text-center py-4 px-4 text-blue-600 font-semibold">Priority</td>
                      <td className="text-center py-4 px-4 text-purple-600 font-semibold">VIP</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Coin Usage Examples */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">What Can You Create?</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-lg">
              See what our coins can do for you
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">4,000 Coins</h3>
                <p className="text-gray-600 mb-4">Perfect for trying out</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>~200 standard images</li>
                  <li>~40 HD images</li>
                  <li>~20 short videos</li>
                </ul>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">8,000 Coins</h3>
                <p className="text-gray-600 mb-4">Best for regular creators</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>~400 standard images</li>
                  <li>~80 HD images</li>
                  <li>~40 short videos</li>
                </ul>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">25,000 Coins</h3>
                <p className="text-gray-600 mb-4">For power users & teams</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>~1,250 standard images</li>
                  <li>~250 HD images</li>
                  <li>~125 short videos</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-gray-900">What are coins?</h3>
                <p className="text-gray-600">
                  Coins are the currency used on Vispicy to generate images and videos. Each generation consumes a
                  certain number of coins based on the type, quality, and complexity of the content. Purchasing a plan
                  gives you a bundle of coins to use across all our AI tools.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-gray-900">Do coins expire?</h3>
                <p className="text-gray-600">
                  Yes, coins have a validity period based on your billing cycle. For weekly plans, coins expire 7 days
                  after purchase. For yearly plans, coins expire 365 days after purchase. This ensures you can make the
                  most of your subscription period.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-gray-900">Can I change plans later?</h3>
                <p className="text-gray-600">
                  Absolutely! You can upgrade or downgrade your plan at any time. When upgrading, you'll receive
                  additional coins immediately. Pro-rated refunds are available when moving to a lower-tier plan.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-gray-900">What payment methods do you accept?</h3>
                <p className="text-gray-600">
                  We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and various regional
                  payment methods. All payments are processed securely through our payment partners.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-gray-900">Is there a free trial?</h3>
                <p className="text-gray-600">
                  New users receive free credits to try out our platform. This allows you to experience our AI tools
                  before committing to a paid plan. Sign up today to claim your free credits and start creating!
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-3 text-gray-900">What's your refund policy?</h3>
                <p className="text-gray-600">
                  We offer a 7-day money-back guarantee for all new purchases. If you're not satisfied with our service,
                  contact our support team within 7 days for a full refund, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-12 text-white max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Creating?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of creators using Vispicy to bring their ideas to life. Start with free credits and
              experience the power of AI-generated visuals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/contact"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition text-lg"
              >
                Contact Sales
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
