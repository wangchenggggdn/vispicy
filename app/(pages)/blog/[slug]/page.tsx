'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, BookOpen, Share2, Check } from 'lucide-react';
import { blogPosts } from '@/lib/blog-data';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BlogPostPage() {
  const params = useParams();
  const post = blogPosts.find((p) => p.slug === params.slug);
  const [copied, setCopied] = useState(false);

  if (!post) {
    notFound();
  }

  // Find related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter((p) => p.category === post.category && p.id !== post.id)
    .slice(0, 3);

  const categoryColors = {
    image: 'bg-purple-100 text-purple-700',
    video: 'bg-pink-100 text-pink-700',
    tutorial: 'bg-blue-100 text-blue-700',
    tips: 'bg-orange-100 text-orange-700',
  };

  const categoryLabels = {
    image: 'AI Image Generation',
    video: 'AI Video Generation',
    tutorial: 'Tutorial',
    tips: 'Tips & Tricks',
  };

  // Update document title and meta description for SEO
  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Vispicy Blog`;
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', post.excerpt);
      }
    }
  }, [post]);

  // Helper function to copy text to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        <article className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link
              href="/blog"
              className="inline-flex items-center text-gray-600 hover:text-red-600 transition mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            {/* Article Header */}
            <header className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${categoryColors[post.category]}`}>
                  {categoryLabels[post.category]}
                </span>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readTime}
                  </span>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between border-t border-b border-gray-200 py-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{post.author}</div>
                    <div className="text-sm text-gray-500">Vispicy Team</div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    // Try native share API first (mobile)
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: post.title,
                          text: post.excerpt,
                          url: window.location.href,
                        });
                      } catch (err) {
                        // User cancelled or error - fallback to clipboard
                        copyToClipboard(window.location.href);
                      }
                    } else {
                      // Fallback to clipboard
                      copyToClipboard(window.location.href);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    copied
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      Share
                    </>
                  )}
                </button>
              </div>
            </header>

            {/* Cover Image */}
            {post.coverImage && (
              <div className="mb-12 rounded-xl overflow-hidden shadow-lg">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="bg-white rounded-xl shadow-sm p-8 md:p-12 mb-12">
              <div className="prose prose-lg max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-200"
                    >
                      {relatedPost.coverImage && (
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          <img
                            src={relatedPost.coverImage}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-red-600 transition">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-12 text-white text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
              <p className="text-lg mb-8 opacity-90">
                Apply what you've learned and start creating stunning AI-generated content with Vispicy.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/text-to-image"
                  className="px-8 py-4 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
                >
                  Try Text to Image
                </Link>
                <Link
                  href="/text-to-video"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition text-lg"
                >
                  Try Text to Video
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}
