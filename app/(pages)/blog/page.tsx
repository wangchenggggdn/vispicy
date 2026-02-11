import Link from 'next/link';
import { Calendar, Clock, ArrowRight, TrendingUp } from 'lucide-react';
import { blogPosts } from '@/lib/blog-data';

export const metadata = {
  title: 'Blog - Vispicy AI Tutorials & Insights',
  description: 'Explore the latest AI trends, tutorials, and creative tips. Learn how to make the most of Vispicy\'s AI image and video generation tools.',
};

export default function BlogPage() {
  // Sort posts by date, featured posts first
  const sortedPosts = [...blogPosts].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-red-600" />
              <span className="text-red-600 font-semibold">Blog</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              AI Insights, Tutorials & Tips
            </h1>
            <p className="text-xl text-gray-600">
              Stay updated with the latest trends in AI image and video generation
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedPosts.map((post) => {
              const categoryColors = {
                image: 'from-purple-400 to-pink-500',
                video: 'from-pink-400 to-rose-500',
                tutorial: 'from-blue-400 to-cyan-500',
                tips: 'from-orange-400 to-red-500',
              };

              const categoryLabels = {
                image: 'AI Image',
                video: 'AI Video',
                tutorial: 'Tutorial',
                tips: 'Tips',
              };

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition overflow-hidden group"
                >
                  {/* Blog Card Image Placeholder */}
                  <div className={`h-48 bg-gradient-to-br ${categoryColors[post.category]} group-hover:scale-105 transition duration-300 relative`}>
                    {post.featured && (
                      <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        ⭐ Featured
                      </div>
                    )}
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-2xl font-bold opacity-50">{categoryLabels[post.category]}</span>
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="p-6">
                    {/* Category & Meta */}
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-medium capitalize">
                        {categoryLabels[post.category]}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Read Time & Link */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition group"
                      >
                        Read
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-red-600 to-orange-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Create?
          </h2>
          <p className="text-xl text-red-50 mb-8 max-w-2xl mx-auto">
            Start generating amazing AI content with Vispicy today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/text-to-image"
              className="px-8 py-3 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition shadow-lg"
            >
              Try Text to Image
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-red-600 transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
