'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, MessageSquare, Send, MapPin, Phone, Clock, Github, Twitter, Linkedin } from 'lucide-react';
import Footer from '@/components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'General inquiries and support',
      contact: 'vispicy.ai@gmail.com',
      link: 'mailto:vispicy.ai@gmail.com',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our support team',
      contact: 'Available 24/7',
      link: '#',
    },
    {
      icon: Phone,
      title: 'Phone',
      description: 'Call us for urgent matters',
      contact: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
    },
  ];

  const officeLocations = [
    {
      city: 'San Francisco',
      country: 'United States',
      address: '123 AI Street, Tech Hub, CA 94105',
    },
    {
      city: 'London',
      country: 'United Kingdom',
      address: '456 Innovation Road, Tech City, EC1A 1BB',
    },
    {
      city: 'Singapore',
      country: 'Singapore',
      address: '789 Future Avenue, Central, 018956',
    },
  ];

  const faqs = [
    {
      question: 'How do I get started with Vispicy?',
      answer: 'Simply sign up for a free account to receive initial credits. You can then explore all our AI tools - Text to Image, Image to Image, Text to Video, and Image to Video. No credit card required to start.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and various regional payment methods. All transactions are secured with industry-standard encryption.',
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 7-day money-back guarantee for all new purchases. If you\'re not satisfied with our service, contact our support team within 7 days for a full refund.',
    },
    {
      question: 'Can I use Vispicy for commercial purposes?',
      answer: 'Absolutely! All content created on Vispicy can be used for both personal and commercial projects. You retain full ownership of your creations.',
    },
    {
      question: 'How do I contact technical support?',
      answer: 'For technical support, please email vispicy.ai@gmail.com or use the live chat feature on our website. Our support team is available 24/7 to assist you.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Have questions about Vispicy? We're here to help. Reach out to our team for support,
              sales inquiries, partnership opportunities, or just to say hello.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href={method.link}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition group"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition">
                  <method.icon className="w-7 h-7 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <p className="text-red-600 font-semibold">{method.contact}</p>
              </a>
            ))}
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="sales">Sales Question</option>
                    <option value="billing">Billing Issue</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Send className="w-5 h-5" />
                  <span>{loading ? 'Sending...' : 'Send Message'}</span>
                </button>

                {error && (
                  <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg text-center font-semibold">
                    {error}
                  </div>
                )}

                {submitted && !error && (
                  <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg text-center font-semibold">
                    Thank you! We'll get back to you soon.
                  </div>
                )}
              </form>
            </div>

            {/* Contact Info & Office Hours */}
            <div className="space-y-6">
              {/* Office Hours */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <Clock className="w-8 h-8 text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">Office Hours</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Monday - Friday</span>
                    <span className="font-semibold text-gray-900">9:00 AM - 6:00 PM (PST)</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                    <span className="text-gray-600">Saturday</span>
                    <span className="font-semibold text-gray-900">10:00 AM - 4:00 PM (PST)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sunday</span>
                    <span className="font-semibold text-gray-900">Closed</span>
                  </div>
                </div>
                <p className="mt-4 text-sm text-gray-500">
                  * Support is available 24/7 through email and live chat
                </p>
              </div>

              {/* Office Locations */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="w-8 h-8 text-red-600" />
                  <h3 className="text-xl font-bold text-gray-900">Our Offices</h3>
                </div>
                <div className="space-y-4">
                  {officeLocations.map((office, index) => (
                    <div key={index} className="pb-4 border-b border-gray-100 last:border-0">
                      <h4 className="font-semibold text-gray-900">{office.city}, {office.country}</h4>
                      <p className="text-sm text-gray-600 mt-1">{office.address}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Follow Us</h3>
                <div className="grid grid-cols-3 gap-4">
                  <a
                    href="https://twitter.com/vispicy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition group"
                  >
                    <Twitter className="w-8 h-8 text-gray-600 group-hover:text-blue-500 mb-2" />
                    <span className="text-xs text-gray-600">Twitter</span>
                  </a>
                  <a
                    href="https://github.com/vispicy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition group"
                  >
                    <Github className="w-8 h-8 text-gray-600 group-hover:text-gray-900 mb-2" />
                    <span className="text-xs text-gray-600">GitHub</span>
                  </a>
                  <a
                    href="https://linkedin.com/company/vispicy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition group"
                  >
                    <Linkedin className="w-8 h-8 text-gray-600 group-hover:text-blue-700 mb-2" />
                    <span className="text-xs text-gray-600">LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container mx-auto px-4 py-16 bg-white">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-center text-gray-600 mb-12 text-lg">
              Find quick answers to common questions
            </p>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition cursor-pointer"
                >
                  <summary className="font-semibold text-gray-900 list-none flex items-center justify-between">
                    {faq.question}
                    <span className="text-red-600 text-2xl leading-none">+</span>
                  </summary>
                  <p className="mt-4 text-gray-600 leading-relaxed">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Support Resources */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Support Resources</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/pricing"
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition text-center group"
              >
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Pricing Info</h3>
                <p className="text-sm text-gray-600">Learn about our plans and pricing</p>
              </Link>

              <a
                href="#"
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition text-center group"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                  <span className="text-3xl">📚</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Documentation</h3>
                <p className="text-sm text-gray-600">Guides and tutorials for all features</p>
              </a>

              <a
                href="#"
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition text-center group"
              >
                <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                  <span className="text-3xl">🎥</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Video Tutorials</h3>
                <p className="text-sm text-gray-600">Watch step-by-step video guides</p>
              </a>

              <a
                href="#"
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition text-center group"
              >
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition">
                  <span className="text-3xl">👥</span>
                </div>
                <h3 className="font-bold text-lg mb-2">Community</h3>
                <p className="text-sm text-gray-600">Join our community of creators</p>
              </a>
            </div>
          </div>
        </section>

        {/* Response Time Promise */}
        <section className="container mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-12 text-white max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Our Response Time Promise</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div>
                <div className="text-4xl font-bold mb-2">&lt; 1 hour</div>
                <div className="text-red-100">Critical Issues</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">&lt; 6 hours</div>
                <div className="text-red-100">General Inquiries</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">&lt; 24 hours</div>
                <div className="text-red-100">Feature Requests</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
