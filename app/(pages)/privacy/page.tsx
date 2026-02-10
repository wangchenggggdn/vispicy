import Link from 'next/link';
import { Shield, Eye, Lock, UserCheck, Trash2, Mail } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy - Vispicy AI',
  description: 'Learn how Vispicy protects your privacy and handles your data. Our comprehensive privacy policy explains data collection, usage, and your rights.',
};

export default function PrivacyPage() {
  const lastUpdated = 'January 15, 2025';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Your privacy is our top priority. This policy explains how we collect, use, and protect your personal information.
            </p>
            <p className="text-sm text-gray-500 mt-4">
              Last Updated: {lastUpdated}
            </p>
          </div>
        </section>

        {/* Quick Navigation */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Quick Navigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a href="#information-collection" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition">
                <Eye className="w-5 h-5" />
                <span>Information We Collect</span>
              </a>
              <a href="#information-usage" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition">
                <UserCheck className="w-5 h-5" />
                <span>How We Use Your Information</span>
              </a>
              <a href="#data-protection" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition">
                <Lock className="w-5 h-5" />
                <span>Data Protection & Security</span>
              </a>
              <a href="#user-rights" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition">
                <Trash2 className="w-5 h-5" />
                <span>Your Rights & Choices</span>
              </a>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Introduction */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Introduction</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Vispicy ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered creative platform. By using Vispicy, you agree to the terms of this policy.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We believe in transparency and want you to understand exactly what data we collect and why. We collect only the information necessary to provide you with the best possible service and experience.
                </p>
              </div>
            </div>

            {/* Information We Collect */}
            <div id="information-collection" className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">1. Personal Information</h3>
                  <p className="text-gray-700 mb-3">We collect information that identifies you personally, including:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Account Information:</strong> Name, email address, username, and password when you create an account</li>
                    <li><strong>Profile Information:</strong> Profile picture, bio, and optional demographic information</li>
                    <li><strong>Payment Information:</strong> Billing address and payment method details (processed securely through third-party payment processors)</li>
                    <li><strong>Communication Data:</strong> Messages you send to our support team</li>
                  </ul>
                </div>

                {/* Usage Information */}
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">2. Usage Information</h3>
                  <p className="text-gray-700 mb-3">We automatically collect information about your use of our service:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
                    <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and error reports</li>
                    <li><strong>Generation Data:</strong> Prompts, parameters, and settings used for AI generations</li>
                    <li><strong>Log Files:</strong> Server access logs and analytics data</li>
                  </ul>
                </div>

                {/* Created Content */}
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">3. Content You Create</h3>
                  <p className="text-gray-700 mb-3">Information related to your creative works on our platform:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li><strong>Generated Content:</strong> Images and videos you create using our AI tools</li>
                    <li><strong>Upload Data:</strong> Reference images you upload for image-to-image or image-to-video features</li>
                    <li><strong>Prompts:</strong> Text descriptions and instructions you provide to the AI</li>
                    <li><strong>Preferences:</strong> Your saved settings, favorite models, and custom configurations</li>
                  </ul>
                </div>

                {/* Cookies and Tracking */}
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">4. Cookies and Tracking Technologies</h3>
                  <p className="text-gray-700 mb-3">We use cookies and similar technologies to:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                    <li>Remember your preferences and login session</li>
                    <li>Analyze usage patterns to improve our service</li>
                    <li>Personalize your experience based on your activity</li>
                    <li>Track the effectiveness of our marketing campaigns</li>
                  </ul>
                  <p className="text-gray-700 mt-3">
                    You can control cookies through your browser settings, but disabling cookies may affect functionality.
                  </p>
                </div>

                {/* Third-Party Information */}
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">5. Third-Party Information</h3>
                  <p className="text-gray-700">When you use third-party services to sign in (e.g., Google, GitHub), we receive information that you authorize them to share with us, such as your name and email address.</p>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div id="information-usage" className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We use the collected information for various purposes to provide and improve our service:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Service Delivery</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Process your AI generation requests</li>
                      <li>• Manage your account and subscriptions</li>
                      <li>• Provide customer support</li>
                      <li>• Process payments and transactions</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Service Improvement</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Analyze usage patterns and trends</li>
                      <li>• Improve AI model performance</li>
                      <li>• Develop new features and tools</li>
                      <li>• Fix bugs and technical issues</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Communication</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Send service-related notifications</li>
                      <li>• Respond to your inquiries</li>
                      <li>• Share updates and new features</li>
                      <li>• Send marketing communications (opt-in)</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Security & Compliance</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Detect and prevent fraud</li>
                      <li>• Ensure platform security</li>
                      <li>• Comply with legal obligations</li>
                      <li>• Enforce our Terms of Service</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Protection & Security */}
            <div id="data-protection" className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Lock className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Data Protection & Security</h2>
              </div>

              <div className="space-y-4 text-gray-700">
                <p className="leading-relaxed">
                  We implement industry-standard security measures to protect your information:
                </p>

                <div className="space-y-4 mt-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-900">Encryption:</strong>
                      <p className="text-gray-700">All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-900">Access Control:</strong>
                      <p className="text-gray-700">Strict access controls and authentication systems limit access to personal data.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-900">Regular Audits:</strong>
                      <p className="text-gray-700">We conduct regular security audits and penetration testing.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-900">Secure Infrastructure:</strong>
                      <p className="text-gray-700">Our infrastructure is hosted on secure cloud platforms with SOC 2 Type II certification.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-gray-900">Data Minimization:</strong>
                      <p className="text-gray-700">We collect only the data necessary to provide our services.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                  <p className="text-sm text-gray-700">
                    <strong>Important:</strong> While we take extensive security measures, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                  </p>
                </div>
              </div>
            </div>

            {/* Information Sharing */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Information Sharing & Disclosure</h2>

              <div className="space-y-6 text-gray-700">
                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">We Do Not Sell Your Personal Data</h3>
                  <p className="leading-relaxed">
                    We never sell your personal information to third parties. Your data is only shared in the following circumstances:
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Service Providers</h3>
                  <p className="leading-relaxed mb-2">We work with trusted third-party companies to help us operate our service:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Cloud Hosting:</strong> AWS, Google Cloud for infrastructure</li>
                    <li><strong>Payment Processing:</strong> Stripe, PayPal for transactions</li>
                    <li><strong>Analytics:</strong> Google Analytics for usage insights</li>
                    <li><strong>Authentication:</strong> NextAuth for user authentication</li>
                  </ul>
                  <p className="text-sm text-gray-600 mt-2">
                    These service providers have limited access to your data only to perform specific tasks on our behalf.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Legal Requirements</h3>
                  <p className="leading-relaxed">
                    We may disclose your information if required to do so by law or in response to valid legal requests from public authorities, including to meet national security or law enforcement requirements.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900">Business Transfers</h3>
                  <p className="leading-relaxed">
                    In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new owner.
                  </p>
                </div>
              </div>
            </div>

            {/* Your Rights */}
            <div id="user-rights" className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Your Rights & Choices</h2>
              </div>

              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  You have the following rights regarding your personal information:
                </p>

                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-bold text-gray-900">Access & Portability</h4>
                    <p className="text-gray-700 text-sm">
                      Request a copy of your personal data and information about how we use it.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-bold text-gray-900">Correction</h4>
                    <p className="text-gray-700 text-sm">
                      Update or correct inaccurate or incomplete information.
                    </p>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-bold text-gray-900">Deletion</h4>
                    <p className="text-gray-700 text-sm">
                      Request deletion of your personal data, subject to legal and operational requirements.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-bold text-gray-900">Object to Processing</h4>
                    <p className="text-gray-700 text-sm">
                      Object to the processing of your personal data in certain circumstances.
                    </p>
                  </div>

                  <div className="border-l-4 border-pink-500 pl-4">
                    <h4 className="font-bold text-gray-900">Restrict Processing</h4>
                    <p className="text-gray-700 text-sm">
                      Request that we limit how we use your personal information.
                    </p>
                  </div>

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h4 className="font-bold text-gray-900">Withdraw Consent</h4>
                    <p className="text-gray-700 text-sm">
                      Withdraw consent at any time where we rely on consent as the legal basis for processing.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-bold text-gray-900">Opt-Out of Marketing</h4>
                    <p className="text-gray-700 text-sm">
                      Unsubscribe from marketing communications at any time.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <h4 className="font-bold text-gray-900 mb-2">How to Exercise Your Rights</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    To exercise any of these rights, please contact us at:
                  </p>
                  <p className="text-gray-900 font-semibold">
                    <Mail className="w-4 h-4 inline mr-1" />
                    vispicy@gmail.com
                  </p>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Data Retention</h2>

              <div className="text-gray-700 space-y-4">
                <p className="leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy. Specifically:
                </p>

                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Active Accounts:</strong> While your account is active</li>
                  <li><strong>Generated Content:</strong> Until you delete it or close your account</li>
                  <li><strong>Transaction Records:</strong> For 7 years (as required by tax law)</li>
                  <li><strong>Support Communications:</strong> For 3 years</li>
                  <li><strong>Analytics Data:</strong> Aggregated data may be retained indefinitely</li>
                </ul>

                <p className="leading-relaxed">
                  Upon account deletion, your personal information will be deleted within 30 days, except where we are required to retain it by law.
                </p>
              </div>
            </div>

            {/* Children's Privacy */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Children's Privacy</h2>

              <div className="text-gray-700 space-y-4">
                <p className="leading-relaxed">
                  Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will delete such information.
                </p>

                <p className="leading-relaxed">
                  If we discover that we have collected personal information from a child under 13 without parental consent, we will take steps to remove that information from our servers.
                </p>
              </div>
            </div>

            {/* International Data Transfers */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">International Data Transfers</h2>

              <div className="text-gray-700">
                <p className="leading-relaxed">
                  Your information may be transferred to and processed in countries other than your country of residence. Our servers are located in the United States, and we may transfer data to other countries where we operate or where our service providers are located.
                </p>

                <p className="leading-relaxed mt-4">
                  When we transfer your data internationally, we ensure appropriate safeguards are in place to protect your privacy and data security in accordance with this Privacy Policy and applicable laws.
                </p>
              </div>
            </div>

            {/* Changes to This Policy */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Changes to This Privacy Policy</h2>

              <div className="text-gray-700">
                <p className="leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                </p>

                <p className="leading-relaxed mt-4">
                  We encourage you to review this Privacy Policy periodically. Your continued use of our service after any changes constitutes acceptance of the updated policy.
                </p>

                <div className="bg-gray-100 rounded-lg p-4 mt-6">
                  <p className="text-sm text-gray-700">
                    <strong>Material Changes:</strong> For any material changes to this Privacy Policy, we will also notify you via email or through a prominent notice on our platform at least 30 days before the changes take effect.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>

              <div className="space-y-4">
                <p className="leading-relaxed opacity-90">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
                </p>

                <div className="bg-white/10 rounded-lg p-4 mt-4">
                  <p className="font-semibold mb-2">Privacy Contact:</p>
                  <p className="opacity-90">
                    Email: <a href="mailto:vispicy@gmail.com" className="underline">vispicy@gmail.com</a>
                  </p>
                  <p className="opacity-90">
                    Address: 123 AI Street, Tech Hub, San Francisco, CA 94105, United States
                  </p>
                </div>

                <p className="text-sm opacity-75 mt-4">
                  We will respond to your inquiry within 30 days of receipt.
                </p>
              </div>
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
