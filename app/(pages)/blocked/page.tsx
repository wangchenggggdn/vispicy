import { Globe, Mail } from 'lucide-react';

export const metadata = {
  title: 'Service Not Available in Your Region',
  description: 'This service is not available in your region.',
};

export default function BlockedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Globe className="w-10 h-10 text-gray-400" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Service Not Available
          </h1>

          {/* Message */}
          <p className="text-lg text-gray-600 mb-6">
            We apologize, but this service is currently not available in your region.
          </p>

          {/* Additional Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <p className="text-sm text-gray-600 mb-4">
              This restriction is due to licensing and regulatory requirements. We appreciate your understanding.
            </p>
            <p className="text-sm text-gray-600">
              If you believe this is an error or have questions, please contact our support team.
            </p>
          </div>

          {/* Contact Section */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Need Assistance?
            </h2>
            <a
              href="mailto:vispicy.ai@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <Mail className="w-5 h-5" />
              <span>Contact Support</span>
            </a>
          </div>

          {/* Footer Note */}
          <p className="text-xs text-gray-500 mt-8">
            Your IP address and location have been logged for security purposes.
          </p>
        </div>

        {/* Back to Home Button (hidden functionality) */}
        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
