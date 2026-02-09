import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import { blogPosts } from '@/lib/blog-data';

export const metadata = {
  title: 'Blog - Vispicy',
  description: 'Discover the latest insights, tutorials, and tips about AI image and video generation. Learn how to create stunning visuals with Vispicy.',
};

export default function BlogPage() {
  // Get featured post
  const featuredPost = blogPosts.find(post => post.featured);

  // Group remaining posts by category
  const categories = {
    image: blogPosts.filter(post => post.category === 'image' && !post.featured),
    video: blogPosts.filter(post => post.category === 'video' && !post.featured),
    tutorial: blogPosts.filter(post => post.category === 'tutorial' && !post.featured),
    tips: blogPosts.filter(post => post.category === 'tips' && !post.featured),
  };

  const categoryInfo = {
    image: { title: 'AI Image Generation', color: 'purple', description: 'Master the art of AI-powered image creation' },
    video: { title: 'AI Video Generation', color: 'pink', description: 'Create stunning videos with AI technology' },
    tutorial: { title: 'Tutorials', color: 'blue', description: 'Step-by-step guides to maximize your creativity' },
    tips: { title: 'Tips & Tricks', color: 'orange', description: 'Expert insights to enhance your workflow' },
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <BookOpen className="w-12 h-12 text-red-600 mr-3" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Vispicy Blog
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Explore our comprehensive guides, tutorials, and insights on AI image and video generation.
              Learn how to harness the power of AI to bring your creative vision to life.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{blogPosts.length} Articles</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                <span>Regular Updates</span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Post - Most Prominent Position */}
        {featuredPost && (
          <div className="container mx-auto px-4 pb-16">
            <div className="max-w-5xl mx-auto">
              <div className="relative mb-4">
                <span className="absolute -top-3 left-4 bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10 flex items-center">
                  <span className="animate-pulse mr-2">🔥</span> FEATURED
                  <span className="animate-pulse ml-2">🔥</span>
                </span>
              </div>
              <Link
                href={`/blog/${featuredPost.slug}`}
                className="group block bg-gradient-to-br from-red-600 via-orange-600 to-yellow-600 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2"
              >
                <div className="bg-white rounded-3xl p-1">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image/Visual Side */}
                    <div className="bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 p-12 flex items-center justify-center min-h-[400px]">
                      <div className="text-center text-white">
                        <div className="text-8xl mb-6">🎬</div>
                        <h3 className="text-3xl font-bold mb-4">World-First Exclusive</h3>
                        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-lg font-semibold">
                          Only on Vispicy
                        </div>
                      </div>
                    </div>

                    {/* Content Side */}
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                          BREAKING NEWS
                        </span>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {featuredPost.readTime}
                          </span>
                        </div>
                      </div>

                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 group-hover:text-red-600 transition leading-tight">
                        {featuredPost.title}
                      </h2>

                      <p className="text-lg text-gray-600 mb-6 line-clamp-3">
                        {featuredPost.excerpt}
                      </p>

                      <div className="flex items-center text-red-600 font-bold text-lg group-hover:translate-x-2 transition-transform">
                        <span>Read Now - Exclusive Access</span>
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Blog Posts by Category */}
        <div className="container mx-auto px-4 pb-16">
          {Object.entries(categories).map(([categoryKey, posts]) => {
            if (posts.length === 0) return null;

            const info = categoryInfo[categoryKey as keyof typeof categoryInfo];
            const colorClasses = {
              purple: 'from-purple-600 to-purple-700',
              pink: 'from-pink-600 to-pink-700',
              blue: 'from-blue-600 to-blue-700',
              orange: 'from-orange-600 to-orange-700',
            };

            return (
              <div key={categoryKey} className="mb-16">
                <div className={`mb-8 bg-gradient-to-r ${colorClasses[info.color as keyof typeof colorClasses]} rounded-2xl p-8 text-white`}>
                  <h2 className="text-3xl font-bold mb-2">{info.title}</h2>
                  <p className="opacity-90">{info.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-200"
                    >
                      {post.coverImage && (
                        <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-red-600 transition">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center text-red-600 font-semibold text-sm group-hover:translate-x-2 transition-transform">
                          <span>Read More</span>
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-12 text-white max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Creating?</h2>
            <p className="text-lg mb-8 opacity-90">
              Apply what you've learned and start creating stunning AI-generated content with Vispicy today.
            </p>
            <Link
              href="/text-to-image"
              className="inline-block px-8 py-4 bg-white text-red-600 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Try for Free
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
