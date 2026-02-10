import Link from 'next/link';
import Header from '@/components/Header';
import { FileText, AlertTriangle, Ban, Scale, Shield, Gift } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service - Vispicy AI',
  description: 'Read Vispicy\'s Terms of Service to understand the rules and guidelines for using our AI-powered creative platform.',
};

export default function TermsPage() {
  const lastUpdated = 'January 15, 2025';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              These terms govern your use of Vispicy's AI-powered creative platform. By using our service, you agree to these terms.
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
              <a href="#acceptance" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition">
                <FileText className="w-5 h-5" />
                <span>Acceptance of Terms</span>
              </a>
              <a href="#prohibited-uses" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition">
                <Ban className="w-5 h-5" />
                <span>Prohibited Uses</span>
              </a>
              <a href="#intellectual-property" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition">
                <Scale className="w-5 h-5" />
                <span>Intellectual Property</span>
              </a>
              <a href="#liability" className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition">
                <Shield className="w-5 h-5" />
                <span>Limitation of Liability</span>
              </a>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Acceptance of Terms */}
            <div id="acceptance" className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">1. Acceptance of Terms</h2>

              <div className="prose prose-gray max-w-none text-gray-700 space-y-4">
                <p className="leading-relaxed">
                  By accessing or using Vispicy ("Service"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to these Terms, please do not use our Service.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                  <p className="text-sm">
                    <strong>Age Requirement:</strong> You must be at least 13 years old to use this Service. By using this Service, you represent that you are at least 13 years old.
                  </p>
                </div>

                <p className="leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through a prominent notice on our platform. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.
                </p>
              </div>
            </div>

            {/* Description of Service */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">2. Description of Service</h2>

              <div className="text-gray-700 space-y-4">
                <p className="leading-relaxed">
                  Vispicy provides an AI-powered creative platform that enables users to generate images and videos using artificial intelligence. Our Service includes:
                </p>

                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Text to Image:</strong> Generate images from text descriptions</li>
                  <li><strong>Image to Image:</strong> Transform and modify existing images</li>
                  <li><strong>Text to Video:</strong> Create videos from text descriptions</li>
                  <li><strong>Image to Video:</strong> Convert static images into animated videos</li>
                  <li><strong>Account Management:</strong> User accounts, subscriptions, and payment processing</li>
                </ul>

                <p className="leading-relaxed">
                  We continuously improve and update our Service, which may include adding, removing, or modifying features. We reserve the right to modify or discontinue any aspect of the Service at any time without prior notice.
                </p>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <p className="text-sm">
                    <strong>Important:</strong> The Service is provided "as is" and may contain bugs or errors. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
                  </p>
                </div>
              </div>
            </div>

            {/* User Accounts */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">3. User Accounts</h2>

              <div className="text-gray-700 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Account Creation</h3>
                <p className="leading-relaxed">
                  To use certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Account Security</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>You are responsible for maintaining the confidentiality of your password and account</li>
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>You must notify us immediately of any unauthorized use of your account</li>
                  <li>You are responsible for any actions taken by anyone with access to your account</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Account Termination</h3>
                <p className="leading-relaxed">
                  We reserve the right to suspend or terminate your account at any time for any reason, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Breach of these Terms</li>
                  <li>Violation of applicable laws</li>
                  <li>Fraudulent or abusive behavior</li>
                  <li>Inactivity for an extended period (12 months or more)</li>
                </ul>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                  <p className="text-sm">
                    <strong>Termination:</strong> Upon termination, your right to use the Service will immediately cease. All provisions of the Terms which by their nature should survive termination shall survive, including ownership provisions, warranty disclaimers, and limitations of liability.
                  </p>
                </div>
              </div>
            </div>

            {/* Acceptable Use Policy */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">4. Acceptable Use Policy</h2>

              <div className="text-gray-700 space-y-4">
                <p className="leading-relaxed">
                  You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Content Restrictions</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Generate illegal content</li>
                      <li>• Create harmful or offensive content</li>
                      <li>• Produce violent or graphic material</li>
                      <li>• Generate sexual or explicit content</li>
                      <li>• Create content promoting hate speech</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Technical Restrictions</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Reverse engineer the Service</li>
                      <li>• Use automated bots or scrapers</li>
                      <li>• Attempt to gain unauthorized access</li>
                      <li>• Interfere with service operation</li>
                      <li>• Introduce malware or viruses</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Usage Restrictions</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Use free accounts for commercial purposes beyond limits</li>
                      <li>• Share accounts with others</li>
                      <li>• Circumvent usage limitations</li>
                      <li>• Create fake accounts</li>
                      <li>• Abuse promotional offers</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">Intellectual Property</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Infringe on others' copyrights</li>
                      <li>• Generate content mimicking public figures without consent</li>
                      <li>• Create trademark-infringing content</li>
                      <li>• Violate intellectual property rights</li>
                      <li>• Remove or modify copyright notices</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4">
                  <p className="text-sm">
                    <strong>AI Guidelines:</strong> Be transparent about AI-generated content when required by law or platform rules. Do not use our Service to create deceptive or misleading content.
                  </p>
                </div>
              </div>
            </div>

            {/* Prohibited Uses */}
            <div id="prohibited-uses" className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Ban className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">5. Prohibited Uses</h2>
              </div>

              <div className="text-gray-700 space-y-4">
                <p className="leading-relaxed">
                  The following uses of our Service are strictly prohibited:
                </p>

                <div className="space-y-4 mt-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold text-gray-900">Illegal Activities</h4>
                    <p className="text-sm mt-1">
                      Using the Service for any illegal purpose, including creating content that violates local, state, national, or international law.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold text-gray-900">Harmful Content</h4>
                    <p className="text-sm mt-1">
                      Creating content that promotes self-harm, suicide, eating disorders, or other harmful activities.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold text-gray-900">Harassment & Bullying</h4>
                    <p className="text-sm mt-1">
                      Generating content to harass, bully, threaten, or intimidate individuals or groups.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold text-gray-900">False Information</h4>
                    <p className="text-sm mt-1">
                      Creating and spreading false or misleading information, including deepfakes designed to deceive.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold text-gray-900">Privacy Violations</h4>
                    <p className="text-sm mt-1">
                      Generating content that violates an individual's privacy rights or reveals private information without consent.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold text-gray-900">Discriminatory Content</h4>
                    <p className="text-sm mt-1">
                      Creating content that promotes discrimination or disparages on the basis of race, religion, gender, age, nationality, disability, or sexual orientation.
                    </p>
                  </div>

                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-bold text-gray-900">Spam & Abuse</h4>
                    <p className="text-sm mt-1">
                      Using the Service to send spam, abuse other users, or overwhelm our systems with excessive requests.
                    </p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                  <p className="text-sm">
                    <strong>Consequences:</strong> We reserve the right to immediately suspend or terminate accounts that violate these prohibitions and to report illegal activities to law enforcement authorities.
                  </p>
                </div>
              </div>
            </div>

            {/* Intellectual Property Rights */}
            <div id="intellectual-property" className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Scale className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">6. Intellectual Property Rights</h2>
              </div>

              <div className="text-gray-700 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Vispicy's Intellectual Property</h3>
                <p className="leading-relaxed">
                  The Service, including all content, features, and functionality, is owned by Vispicy and is protected by copyright, trademark, and other intellectual property laws. You may not:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Modify, copy, or distribute our Service</li>
                  <li>Use our trademarks without written permission</li>
                  <li>Remove or modify any proprietary notices</li>
                  <li>Reverse engineer or attempt to extract source code</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Your Content</h3>
                <p className="leading-relaxed">
                  You retain ownership of content you create using our Service ("Your Content"). However, by using our Service, you grant us the following rights:
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mt-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <Gift className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>License to Use:</strong>
                      <p className="text-sm mt-1">
                        You grant us a non-exclusive, royalty-free, worldwide license to use, store, and process Your Content solely to provide and improve our Service.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong>Important Limitations:</strong>
                      <p className="text-sm mt-1">
                        We do not claim ownership of Your Content. We will not sell Your Content to third parties. You may delete Your Content at any time, though copies may remain in our backups for a limited period.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Generated Content Ownership</h3>
                <p className="leading-relaxed">
                  Subject to these Terms, you own all images and videos you generate using our Service. You may use generated content for both personal and commercial purposes. However, you must comply with all applicable laws and not use generated content in ways that violate these Terms.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6">DMCA Notice</h3>
                <p className="leading-relaxed">
                  If you believe your copyrighted work has been copied in a way that constitutes copyright infringement, please notify us at <a href="mailto:vispicy@gmail.com" className="text-red-600 hover:underline">vispicy@gmail.com</a>. We will respond to all notices in accordance with the DMCA and other applicable laws.
                </p>
              </div>
            </div>

            {/* Payment Terms */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">7. Payment Terms</h2>

              <div className="text-gray-700 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Subscription Plans</h3>
                <p className="leading-relaxed">
                  We offer various subscription plans with different pricing and features. Prices are displayed in USD unless otherwise noted. We reserve the right to modify prices at any time, with 30 days notice for existing subscribers.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Billing Cycle</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Subscriptions are billed on a weekly or yearly basis as selected during signup</li>
                  <li>Your subscription will automatically renew at the end of each billing period</li>
                  <li>You may cancel auto-renewal at any time through your account settings</li>
                  <li>Cancellation takes effect at the end of the current billing period</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Coins & Credits</h3>
                <p className="leading-relaxed">
                  Coins are our virtual currency used to pay for generations. Coins included in your subscription are valid for the duration of your billing period. Unused coins expire at the end of each billing period and do not roll over.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Refunds</h3>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-2">
                  <p className="text-sm">
                    <strong>7-Day Money-Back Guarantee:</strong> New subscribers may request a full refund within 7 days of their first purchase. After 7 days, refunds are issued at our discretion. To request a refund, contact <a href="mailto:vispicy@gmail.com" className="text-red-600 hover:underline">vispicy@gmail.com</a>.
                  </p>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Payment Processing</h3>
                <p className="leading-relaxed">
                  All payments are processed through secure third-party payment processors. We do not store your complete payment information on our servers. By providing payment information, you authorize us to charge your chosen payment method for your subscription.
                </p>
              </div>
            </div>

            {/* Limitation of Liability */}
            <div id="liability" className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">8. Limitation of Liability</h2>
              </div>

              <div className="text-gray-700 space-y-4">
                <p className="leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, VISPICY SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL, ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE.
                </p>

                <p className="leading-relaxed">
                  OUR TOTAL LIABILITY FOR ANY CLAIMS RELATING TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE 12 MONTHS PRECEDING THE CLAIM. IF YOU HAVE NOT PAID ANYTHING, OUR LIABILITY IS LIMITED TO $100.
                </p>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                  <p className="text-sm">
                    <strong>No Warranties:</strong> THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
                  </p>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-6">AI Output Disclaimer</h3>
                <p className="leading-relaxed">
                  AI-generated content may contain errors, inaccuracies, or unexpected results. You are responsible for reviewing all generated content before use. We do not guarantee that generated content will meet your requirements or expectations.
                </p>

                <p className="leading-relaxed">
                  We are not responsible for any damages arising from your use of generated content, including but not limited to reputational harm, legal claims, or financial losses.
                </p>
              </div>
            </div>

            {/* Indemnification */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">9. Indemnification</h2>

              <div className="text-gray-700">
                <p className="leading-relaxed">
                  You agree to defend, indemnify, and hold harmless Vispicy and our affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns, and employees, from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including but not limited to attorney's fees), resulting from or arising out of a) your use and access of the Service, by you or any person using your account and password; b) a breach of these terms; or c) Content posted on the Service.
                </p>
              </div>
            </div>

            {/* Dispute Resolution */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">10. Dispute Resolution</h2>

              <div className="text-gray-700 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Governing Law</h3>
                <p className="leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law provisions.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Arbitration Agreement</h3>
                <p className="leading-relaxed">
                  ANY DISPUTE, CLAIM, OR CONTROVERSY ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL BE RESOLVED BY BINDING ARBITRATION, RATHER THAN IN COURT, except that you may assert claims in small claims court if your claims qualify. The Federal Arbitration Act governs the interpretation and enforcement of this provision.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Class Action Waiver</h3>
                <p className="leading-relaxed">
                  YOU AND VISPICY AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
                </p>

                <div className="bg-gray-100 rounded-lg p-4 mt-4">
                  <p className="text-sm">
                    <strong>Exceptions:</strong> Nothing in this Agreement prevents either party from seeking injunctive relief in court for intellectual property infringement or other urgent matters.
                  </p>
                </div>
              </div>
            </div>

            {/* Termination */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">11. Termination</h2>

              <div className="text-gray-700 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Termination by You</h3>
                <p className="leading-relaxed">
                  You may terminate your account at any time by contacting us at <a href="mailto:vispicy@gmail.com" className="text-red-600 hover:underline">vispicy@gmail.com</a> or through your account settings. Upon termination, you will lose access to your account and any unused coins.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Termination by Vispicy</h3>
                <p className="leading-relaxed">
                  We may suspend or terminate your account immediately for any reason, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Breach of these Terms</li>
                  <li>Violation of applicable laws</li>
                  <li>Fraudulent activity</li>
                  <li>Abuse of the Service</li>
                  <li>Extended inactivity (12+ months)</li>
                </ul>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Effect of Termination</h3>
                <p className="leading-relaxed">
                  Upon termination, all rights granted to you under these Terms will cease. We will delete your account data within 30 days, except where required by law to retain it. Sections that by their nature should survive termination shall survive, including but not limited to Payment Terms, Intellectual Property, Limitation of Liability, and Indemnification.
                </p>
              </div>
            </div>

            {/* General Provisions */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">12. General Provisions</h2>

              <div className="text-gray-700 space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Entire Agreement</h3>
                <p className="leading-relaxed">
                  These Terms, together with our Privacy Policy, constitute the entire agreement between you and Vispicy regarding the Service.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Severability</h3>
                <p className="leading-relaxed">
                  If any provision of these Terms is held to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Waiver</h3>
                <p className="leading-relaxed">
                  Our failure to enforce any right or provision of these Terms shall not be deemed a waiver of such right or provision.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Assignment</h3>
                <p className="leading-relaxed">
                  You may not assign or transfer these Terms without our prior written consent. We may assign these Terms freely.
                </p>

                <h3 className="text-xl font-bold text-gray-900 mt-6">Force Majeure</h3>
                <p className="leading-relaxed">
                  We are not liable for any failure or delay in performance due to causes beyond our reasonable control, including but not limited to acts of God, war, strikes, or government regulations.
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
