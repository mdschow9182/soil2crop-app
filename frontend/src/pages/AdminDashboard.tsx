import { useEffect, useState } from 'react';
import api from '@/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAdminStats();
        fetchHealthCheck();

        // Auto-refresh every 60 seconds
        const interval = setInterval(() => {
            fetchAdminStats();
            fetchHealthCheck();
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const fetchAdminStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            const data = response.data;

            if (data.success) {
                setStats(data.data);
                setError(null);
            } else {
                setError('Failed to load admin statistics');
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Unable to connect to server');
        } finally {
            setLoading(false);
        }
    };

    const fetchHealthCheck = async () => {
        try {
            const response = await api.get('/admin/health');
            const data = response.data;

            if (data.success) {
                setHealth(data.data);
            }
        } catch (err) {
            console.error('Error fetching health:', err);
        }
    };

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
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
                        onClick={fetchAdminStats}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Sample data for charts
    const usageData = [
        { name: 'Predictions', value: stats?.usage?.total_predictions || 0 },
        { name: 'Soil Reports', value: stats?.usage?.soil_reports || 0 },
        { name: 'Disease Scans', value: stats?.usage?.disease_scans || 0 },
        { name: 'Help Requests', value: stats?.usage?.help_requests || 0 }
    ];

    const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">⚙️ Admin Control Panel</h1>
                    <p className="text-gray-600 mt-2">System monitoring and analytics</p>
                </div>
                <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${health?.status === 'healthy'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {health?.status === 'healthy' ? '✓ System Healthy' : '⚠️ System Issues'}
                    </span>
                    <button
                        onClick={() => { fetchAdminStats(); fetchHealthCheck(); }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {/* Health Status */}
            {health && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">🏥 System Health</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Database</p>
                            <p className={`text-xl font-bold ${health.components.database === 'connected'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}>
                                {health.components.database === 'connected' ? '✓ Connected' : '✗ Disconnected'}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Uptime</p>
                            <p className="text-xl font-bold text-gray-900">
                                {(health.uptime / 3600).toFixed(2)} hours
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Memory Usage</p>
                            <p className="text-xl font-bold text-gray-900">
                                {((health.components.memory_usage.heapUsed / 1024 / 1024).toFixed(0))} MB
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Last Check</p>
                            <p className="text-xl font-bold text-gray-900">
                                {new Date(health.timestamp).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Farmers */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Farmers</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stats?.users?.total_farmers || 0}
                            </p>
                            <p className="text-xs text-green-600 mt-2">
                                Active (30d): {stats?.users?.active_last_30_days || 0}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Total Predictions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Total Predictions</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stats?.usage?.total_predictions || 0}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">All time</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Model Accuracy */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Model Accuracy</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {(stats?.system?.model_accuracy * 100).toFixed(2)}%
                            </p>
                            <p className="text-xs text-gray-500 mt-2">Random Forest v1.0</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* System Uptime */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 font-medium">System Uptime</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">
                                {stats?.system?.uptime || 'N/A'}
                            </p>
                            <p className="text-xs text-green-600 mt-2">● Operational</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Usage Distribution */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Usage Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={usageData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {usageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* API Calls */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">API Activity</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[
                            { name: 'Today', calls: stats?.system?.api_calls_today || 0 }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="calls" fill="#3B82F6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Detailed Statistics Table */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Detailed Statistics</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Metric
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Value
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Total Farmers
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {stats?.users?.total_farmers || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Active
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Soil Reports Uploaded
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {stats?.usage?.soil_reports || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Normal
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Disease Scans
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {stats?.usage?.disease_scans || 0}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Operational
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Database Connection
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {health?.components.database === 'connected' ? 'Connected' : 'Disconnected'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${health?.components.database === 'connected'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {health?.components.database === 'connected' ? 'Healthy' : 'Critical'}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 text-center text-gray-500 text-sm">
                <p>Admin Dashboard v1.0 | Last updated: {new Date().toLocaleString()}</p>
                <p className="mt-1">Auto-refresh enabled (every 60 seconds)</p>
            </div>
        </div>
    );
}
