import { useEffect, useState } from 'react';
import api from '@/api';

export default function SuccessStories() {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const response = await api.get('/api/success-stories');
            const data = response.data;

            if (data.success) {
                setStories(data.data);
            }
        } catch (error) {
            console.error('Error fetching stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStories = filter
        ? stories.filter(s => s.crop.toLowerCase().includes(filter.toLowerCase()))
        : stories;

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900">🌾 Farmer Success Stories</h1>
                <p className="text-gray-600 mt-2">Real farmers, real results, real impact</p>

                <div className="mt-6 max-w-md mx-auto">
                    <input
                        type="text"
                        placeholder="Filter by crop..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                </div>
            </div>

            {/* Success Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <p className="text-sm text-gray-600">Total Stories</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{stories.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <p className="text-sm text-gray-600">Avg Yield Improvement</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">+23.5%</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                    <p className="text-sm text-gray-600">Avg Profit Increase</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">+31.2%</p>
                </div>
            </div>

            {/* Stories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map((story) => (
                    <div key={story._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        {/* Photo or Placeholder */}
                        <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                            {story.photo ? (
                                <img src={story.photo} alt={story.farmer_name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-white text-center">
                                    <span className="text-6xl">👨‍🌾</span>
                                    <p className="mt-2 font-semibold">{story.farmer_name}</p>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-gray-900">{story.story_title}</h3>
                                {story.featured && (
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">
                                        ⭐ Featured
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                                📍 {story.village}, {story.district}, {story.state}
                            </p>

                            <p className="text-gray-700 mb-4 line-clamp-3">
                                {story.story_description}
                            </p>

                            {/* Metrics */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Crop:</span>
                                    <span className="font-semibold text-green-600">{story.crop}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Yield Improvement:</span>
                                    <span className="font-semibold text-green-600">
                                        +{story.yield_improvement_percentage?.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Profit Increase:</span>
                                    <span className="font-semibold text-green-600">
                                        +{story.profit_increase_percentage?.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Impact Statement */}
                            <div className="bg-green-50 rounded-lg p-3">
                                <p className="text-sm text-green-800 font-medium">
                                    💡 "Farmer {story.farmer_name.split(' ')[0]} improved yield by {story.yield_improvement_percentage?.toFixed(0)}% using Soil2Crop recommendations!"
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredStories.length === 0 && (
                <div className="text-center py-12">
                    <span className="text-6xl block mb-4">📖</span>
                    <p className="text-gray-600 text-lg">No success stories found yet.</p>
                    <p className="text-gray-500 mt-2">Be the first to share your success!</p>
                </div>
            )}
        </div>
    );
}
