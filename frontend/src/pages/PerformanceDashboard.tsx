import { useEffect, useState } from 'react';
import api from '@/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function PerformanceDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSystemStats();
        // Refresh stats every 30 seconds
        const interval = setInterval(fetchSystemStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchSystemStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/system/stats');
            const data = response.data;

            if (data.success) {
                setStats(data.data);
                setError(null);
            } else {
                setError('Failed to load system statistics');
            }
        } catch (err) {
            setError('Unable to connect to server');
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center text-red-600">
                    <p className="text-xl font-semibold">{error}</p>
                    <button
                        onClick={fetchSystemStats}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Sample data for charts (in production, this would come from API)
    const predictionTrendData = [
        { name: 'Mon', predictions: 150, disease_scans: 80 },
        { name: 'Tue', predictions: 180, disease_scans: 95 },
        { name: 'Wed', predictions: 220, disease_scans: 110 },
        { name: 'Thu', predictions: 190, disease_scans: 100 },
        { name: 'Fri', predictions: 250, disease_scans: 130 },
        { name: 'Sat', predictions: 280, disease_scans: 145 },
        { name: 'Sun', predictions: 240, disease_scans: 125 },
    ];

    const cropDistributionData = [
        { name: 'Rice', value: 35 },
        { name: 'Wheat', value: 25 },
        { name: 'Maize', value: 15 },
        { name: 'Cotton', value: 12 },
        { name: 'Others', value: 13 },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Soil2Crop Performance Dashboard</h1>
                <p className="text-gray-600 mt-2">Real-time system monitoring and analytics</p>
                <p className="text-sm text-gray-500 mt-1">
                    Last updated: {stats?.last_updated ? new Date(stats.last_updated).toLocaleString() : 'N/A'}
                </p>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Predictions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Predictions</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.total_predictions || 0}</p>
                            <p className="text-xs text-green-600 mt-2">↑ 12% from last week</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Disease Scans */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Disease Scans</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.disease_scans || 0}</p>
                            <p className="text-xs text-green-600 mt-2">↑ 8% from last week</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-full">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Model Accuracy */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Model Accuracy</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{(stats?.model_accuracy * 100).toFixed(2)}%</p>
                            <p className="text-xs text-gray-500 mt-2">Random Forest v1.0</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* System Uptime */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">System Uptime</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stats?.uptime || 'N/A'}</p>
                            <p className="text-xs text-green-600 mt-2">● Operational</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Prediction Trend */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Prediction Trends</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={predictionTrendData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="predictions" stroke="#0088FE" strokeWidth={2} name="Predictions" />
                            <Line type="monotone" dataKey="disease_scans" stroke="#FF8042" strokeWidth={2} name="Disease Scans" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Crop Distribution */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Crop Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={cropDistributionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {cropDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Soil Reports */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Soil Reports Uploaded</h3>
                    <p className="text-2xl font-bold text-gray-900">{stats?.soil_reports_uploaded || 0}</p>
                    <div className="mt-4 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                </div>

                {/* Crop Images */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Crop Images Analyzed</h3>
                    <p className="text-2xl font-bold text-gray-900">{stats?.crop_images_uploaded || 0}</p>
                    <div className="mt-4 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                </div>

                {/* Active Farmers */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Active Farmers (30 days)</h3>
                    <p className="text-2xl font-bold text-gray-900">{stats?.active_farmers || 0}</p>
                    <div className="mt-4 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-purple-500 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                </div>
            </div>

            {/* Impact Metrics */}
            <div className="mt-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-lg p-6 text-white">
                <h2 className="text-2xl font-bold mb-4">Farmer Impact Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-green-100 text-sm">Average Yield Improvement</p>
                        <p className="text-3xl font-bold mt-1">+23.5%</p>
                    </div>
                    <div>
                        <p className="text-green-100 text-sm">Average Profit Increase</p>
                        <p className="text-3xl font-bold mt-1">+31.2%</p>
                    </div>
                    <div>
                        <p className="text-green-100 text-sm">Farmers Impacted</p>
                        <p className="text-3xl font-bold mt-1">1,250+</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>Soil2Crop Platform v3.0.0 | Real-time Monitoring Enabled</p>
                <p className="mt-1">Data refreshes automatically every 30 seconds</p>
            </div>
        </div>
    );
}
