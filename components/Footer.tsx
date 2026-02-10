import Link from 'next/link';

export default function Footer() {
  return (
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
  );
}
