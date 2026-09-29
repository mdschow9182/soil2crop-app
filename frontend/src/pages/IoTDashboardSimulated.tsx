import { useEffect, useState } from 'react';
import api from '@/api';

/**
 * IoT Dashboard Component - Simulated Sensors
 * Displays real-time simulated sensor data with auto-refresh
 */
export default function IoTDashboardSimulated() {
    const [sensorData, setSensorData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const FARMER_ID = localStorage.getItem('farmer_id') || 'demo-farmer';
    const REFRESH_INTERVAL = 5000; // 5 seconds

    /**
     * Fetch simulated sensor data
     */
    const fetchSensorData = async () => {
        try {
            setError(null);

            const response = await api.get(`/api/iot/sensor-data/${FARMER_ID}`);

            if (response.data.success) {
                const data = response.data.data;
                setSensorData({
                    ...data,
                    moisture: data.soil_moisture,
                    status: 'unknown',
                });
                setLastUpdated(new Date());
            }
        } catch (err: any) {
            console.error('Error fetching sensor data:', err);
            setError(err.response?.data?.message || 'Failed to fetch sensor data');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and auto-refresh
    useEffect(() => {
        fetchSensorData();

        // Auto-refresh every 5 seconds
        const interval = setInterval(fetchSensorData, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    /**
     * Get card color based on status
     */
    const getCardColor = (value: number, type: string) => {
        switch (type) {
            case 'temperature':
                return value > 38 ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500';

            case 'moisture':
                return value < 40 ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500';

            case 'ph':
                return (value < 6.0 || value > 7.2) ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500';

            case 'nitrogen':
                return (value < 90 || value > 220) ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500';

            default:
                return 'bg-green-50 border-green-500';
        }
    };

    /**
     * Get status badge
     */
    const getStatusBadge = (value: any, type: string) => {
        const isNormal = getCardColor(value as number, type).includes('green');
        return {
            text: isNormal ? 'Normal' : 'Warning',
            color: isNormal ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
        };
    };

    if (loading && !sensorData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Loading sensor data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">🌾 IoT Sensor Dashboard</h1>
                        <p className="text-gray-600 mt-2">Real-time simulated sensor monitoring</p>
                        {lastUpdated && (
                            <p className="text-sm text-gray-500 mt-1">
                                Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={fetchSensorData}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-red-800">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold">Error:</span>
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Overall Status */}
            {sensorData && (
                <div className={`mb-8 p-4 rounded-lg border-l-4 ${sensorData.status === 'critical' ? 'bg-red-50 border-red-500' :
                        sensorData.status === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                            'bg-green-50 border-green-500'
                    }`}>
                    <div className="flex items-center space-x-3">
                        {sensorData.status === 'critical' ? (
                            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : sensorData.status === 'warning' ? (
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                        <div>
                            <p className={`font-semibold ${sensorData.status === 'critical' ? 'text-red-800' :
                                    sensorData.status === 'warning' ? 'text-yellow-800' :
                                        'text-green-800'
                                }`}>
                                System Status: {sensorData.status.toUpperCase()}
                            </p>
                            {sensorData.warnings && sensorData.warnings.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {sensorData.warnings.map((warning: any, index: number) => (
                                        <li key={index} className="text-sm">
                                            ⚠️ {warning.message}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Sensor Cards Grid */}
            {sensorData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {/* Temperature Card */}
                    <div className={`rounded-2xl shadow-xl p-6 border-l-4 transform hover:scale-105 transition-transform ${getCardColor(sensorData.temperature, 'temperature')}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">🌡 Temperature</p>
                                <p className="text-4xl font-bold text-gray-900 mt-3">
                                    {sensorData.temperature}°C
                                </p>
                                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(sensorData.temperature, 'temperature').color}`}>
                                    {getStatusBadge(sensorData.temperature, 'temperature').text}
                                </span>
                            </div>
                            <div className="bg-gradient-to-br from-red-400 to-orange-500 p-4 rounded-full">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Moisture Card */}
                    <div className={`rounded-2xl shadow-xl p-6 border-l-4 transform hover:scale-105 transition-transform ${getCardColor(sensorData.moisture, 'moisture')}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">💧 Soil Moisture</p>
                                <p className="text-4xl font-bold text-gray-900 mt-3">
                                    {sensorData.moisture}%
                                </p>
                                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(sensorData.moisture, 'moisture').color}`}>
                                    {getStatusBadge(sensorData.moisture, 'moisture').text}
                                </span>
                            </div>
                            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-4 rounded-full">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* pH Card */}
                    <div className={`rounded-2xl shadow-xl p-6 border-l-4 transform hover:scale-105 transition-transform ${getCardColor(sensorData.ph, 'ph')}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">🧪 pH Level</p>
                                <p className="text-4xl font-bold text-gray-900 mt-3">
                                    {sensorData.ph}
                                </p>
                                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(sensorData.ph, 'ph').color}`}>
                                    {getStatusBadge(sensorData.ph, 'ph').text}
                                </span>
                            </div>
                            <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-4 rounded-full">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Nitrogen Card */}
                    <div className={`rounded-2xl shadow-xl p-6 border-l-4 transform hover:scale-105 transition-transform ${getCardColor(sensorData.nitrogen, 'nitrogen')}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">🌱 Nitrogen (N)</p>
                                <p className="text-4xl font-bold text-gray-900 mt-3">
                                    {sensorData.nitrogen} kg/ha
                                </p>
                                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(sensorData.nitrogen, 'nitrogen').color}`}>
                                    {getStatusBadge(sensorData.nitrogen, 'nitrogen').text}
                                </span>
                            </div>
                            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 rounded-full">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Pump Status Card */}
                    <div className={`rounded-2xl shadow-xl p-6 border-l-4 transform hover:scale-105 transition-transform ${sensorData.pump === 'ON' ? 'bg-blue-50 border-blue-500' : 'bg-gray-50 border-gray-500'
                        }`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">🚰 Pump Status</p>
                                <p className={`text-4xl font-bold mt-3 ${sensorData.pump === 'ON' ? 'text-blue-600' : 'text-gray-600'
                                    }`}>
                                    {sensorData.pump}
                                </p>
                                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${sensorData.pump === 'ON'
                                        ? 'text-blue-700 bg-blue-100'
                                        : 'text-gray-700 bg-gray-100'
                                    }`}>
                                    {sensorData.pump === 'ON' ? 'Irrigating' : 'Standby'}
                                </span>
                            </div>
                            <div className={`p-4 rounded-full ${sensorData.pump === 'ON'
                                    ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                                    : 'bg-gradient-to-br from-gray-400 to-gray-600'
                                }`}>
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-600">
                            <p>Auto-controlled based on soil moisture</p>
                            <p>Turns ON when moisture &lt; 40%</p>
                        </div>
                    </div>

                    {/* Timestamp Card */}
                    <div className="rounded-2xl shadow-xl p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-indigo-100 font-medium">📊 Live Data</p>
                                <p className="text-2xl font-bold mt-3">
                                    {lastUpdated ? lastUpdated.toLocaleTimeString('en-IN') : '--:--:--'}
                                </p>
                                <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold bg-white/20">
                                    Auto-refresh: 5s
                                </span>
                            </div>
                            <div className="bg-white/20 p-4 rounded-full">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="mt-6 text-sm text-indigo-100">
                            <p>Simulated IoT Sensors</p>
                            <p className="text-xs mt-1">Values update automatically</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Info Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">ℹ️ About This Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Sensor Ranges:</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li>🌡 Temperature: 25-40°C</li>
                            <li>💧 Soil Moisture: 30-80%</li>
                            <li>🧪 pH Level: 5.5-7.5</li>
                            <li>🌱 Nitrogen: 80-250 kg/ha</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Automation Rules:</h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li>🚰 Pump turns ON when moisture &lt; 40%</li>
                            <li>🚰 Pump turns OFF when moisture &gt; 40%</li>
                            <li>⚠️ Alerts generated for out-of-range values</li>
                            <li>🔄 Data refreshes every 5 seconds</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
