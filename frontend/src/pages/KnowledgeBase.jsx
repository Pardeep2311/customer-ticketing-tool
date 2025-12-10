import { useState, useEffect } from 'react';
import { Search, BookOpen, HelpCircle, Star, Tag } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import Input from '../components/ui/input';
import Button from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { getArticles, getKnowledgeCategories } from '../api/knowledge';
import { toast } from 'sonner';

const KnowledgeBase = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await getArticles({
        category_id: selectedCategory || undefined,
        search: searchTerm || undefined
      });
      if (response.success) {
        setArticles(response.data.articles || []);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getKnowledgeCategories();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSearch = () => {
    fetchArticles();
  };

  return (
    <DashboardLayout userRole={user?.role}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Knowledge Base</h1>
          <p className="text-gray-400">Find answers to common questions and solutions</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search articles, FAQs, or solutions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
            <BookOpen className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="text-white font-semibold mb-1">All Articles</h3>
            <p className="text-gray-400 text-sm">Browse all knowledge base articles</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
            <HelpCircle className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="text-white font-semibold mb-1">FAQs</h3>
            <p className="text-gray-400 text-sm">Frequently asked questions</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer">
            <Star className="w-8 h-8 text-yellow-500 mb-2" />
            <h3 className="text-white font-semibold mb-1">Favorites</h3>
            <p className="text-gray-400 text-sm">Your bookmarked articles</p>
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Popular Articles</h2>
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-gray-400" />
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-1 text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No articles found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="bg-gray-900 p-4 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold mb-1">{article.title}</h3>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{article.content}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Tag className="w-3 h-3" />
                          <span>{article.category_name || 'Uncategorized'}</span>
                        </span>
                        <span>👁 {article.views || 0} views</span>
                        <span>👍 {article.helpful_count || 0} helpful</span>
                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TODO: Add pagination, filters, article detail modal */}
      </div>
    </DashboardLayout>
  );
};

export default KnowledgeBase;

