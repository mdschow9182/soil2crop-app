import { useEffect, useState } from 'react';
import api from '@/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

/**
 * Get temperature status color
 */
const getTemperatureColor = (temp: number) => {
    if (temp < 25) return 'text-blue-600 bg-blue-100 border-blue-500';
    if (temp >= 25 && temp <= 35) return 'text-green-600 bg-green-100 border-green-500';
    return 'text-red-600 bg-red-100 border-red-500';
};

/**
 * Get humidity status color
 */
const getHumidityColor = (humidity: number) => {
    if (humidity < 60) return 'text-yellow-600 bg-yellow-100 border-yellow-500';
    if (humidity >= 60 && humidity <= 80) return 'text-green-600 bg-green-100 border-green-500';
    return 'text-red-600 bg-red-100 border-red-500';
};

/**
 * Get soil moisture status color
 */
const getSoilMoistureColor = (moisture: number) => {
    if (moisture < 35) return 'text-red-600 bg-red-100 border-red-500';
    if (moisture >= 35 && moisture <= 60) return 'text-green-600 bg-green-100 border-green-500';
    return 'text-blue-600 bg-blue-100 border-blue-500';
};

/**
 * IoT Dashboard Component - Real-time Sensor Monitoring
 * Displays live sensor data with auto-refresh, simulation, and intelligent pump control
 */
export default function IoTDashboard() {
    const [sensorData, setSensorData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [simulateMode, setSimulateMode] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [sensorHistory, setSensorHistory] = useState<any[]>([]);
    const { toast } = useToast();

    // Configuration - Backend API endpoints using environment variable
    const FARMER_ID = localStorage.getItem('farmer_id') || 'test123';
    const FETCH_INTERVAL = 5000; // 5 seconds for real-time updates
    
    // Pump control constants with hysteresis
    const LOW_THRESHOLD = 35;
    const HIGH_THRESHOLD = 60;
    const MIN_ON_TIME = 10000;   // 10 seconds
    const MIN_OFF_TIME = 10000;  // 10 seconds
    
    // Pump state management
    const [pumpState, setPumpState] = useState("OFF");
    const [lastSwitchTime, setLastSwitchTime] = useState(Date.now());
    const [manualMode, setManualMode] = useState(false);

    /**
     * Simulate small variation in sensor values
     */
    const simulateVariation = (value: number, range: number = 2) => {
        const variation = (Math.random() * range - range / 2);
        return Math.round((value + variation) * 10) / 10;
    };

    /**
     * Intelligent pump control with hysteresis and motor protection
     */
    const updatePumpState = (moisture: number) => {
        const now = Date.now();
        const timeSinceLastSwitch = now - lastSwitchTime;
        
        // Calculate remaining cooldown time
        if (pumpState === "ON" && moisture <= HIGH_THRESHOLD) {
            const remainingCooldown = Math.max(0, MIN_ON_TIME - timeSinceLastSwitch);
            setCooldown(Math.ceil(remainingCooldown / 1000));
        } else if (pumpState === "OFF" && moisture >= LOW_THRESHOLD) {
            const remainingCooldown = Math.max(0, MIN_OFF_TIME - timeSinceLastSwitch);
            setCooldown(Math.ceil(remainingCooldown / 1000));
        } else {
            setCooldown(0);
        }

        // Check if we can switch the pump
        if (
            moisture < LOW_THRESHOLD &&
            pumpState === "OFF" &&
            timeSinceLastSwitch > MIN_OFF_TIME
        ) {
            setPumpState("ON");
            setLastSwitchTime(now);
            console.log('[Pump Control] Pump turned ON - Low moisture detected');
            return "ON";
        }
        
        else if (
            moisture > HIGH_THRESHOLD &&
            pumpState === "ON" &&
            timeSinceLastSwitch > MIN_ON_TIME
        ) {
            setPumpState("OFF");
            setLastSwitchTime(now);
            console.log('[Pump Control] Pump turned OFF - High moisture detected');
            return "OFF";
        }
        
        // Maintain current state
        return pumpState;
    };

    /**
     * Manual pump control
     */
    const togglePump = async (newState: string) => {
        try {
            setManualMode(true);
            setPumpState(newState);
            
            // Send manual control command to backend
            await api.post('/api/iot/pump-control', {
                farmer_id: FARMER_ID,
                pump_state: newState,
                mode: 'manual'
            });
            
            console.log(`[Manual Control] Pump turned ${newState} by user`);
            
            // Reset to auto mode after 5 minutes if not switched again
            setTimeout(() => {
                setManualMode(false);
            }, 300000); // 5 minutes
            
        } catch (err: any) {
            console.error('[Manual Control] Error:', err);
            toast({
                title: "Control Failed",
                description: "Failed to update pump state. Please try again.",
                variant: "destructive",
            });
        }
    };

    /**
     * Fetch sensor data from backend API
     */
    const fetchSensorData = async () => {
        try {
            setError(null);
            console.log('[IoT Dashboard] Fetching sensor data for:', FARMER_ID);
            
            const response = await api.get(`/api/iot/sensor-data/${FARMER_ID}`);
            
            console.log('[IoT Dashboard] Response received:', response.data);

            if (response.data.success) {
                const newData = response.data.data;
                
                // Apply intelligent pump control
                const newPumpState = updatePumpState(newData.soil_moisture);
                
                // Update sensor data with pump state
                const updatedData = {
                    ...newData,
                    pump: newPumpState
                };
                
                setSensorData(updatedData);
                setLastUpdated(new Date());
                
                // Add to history for charts (keep last 10 readings)
                setSensorHistory(prev => {
                    const newHistory = [...prev, {
                        ...updatedData,
                        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
                    }];
                    // Keep only last 10 readings
                    return newHistory.slice(-10);
                });
                
                console.log('[IoT Dashboard] Sensor data updated successfully:', updatedData);
            } else {
                console.warn('[IoT Dashboard] Response success is false');
                setError('Unexpected response format from server');
            }
        } catch (err: any) {
            console.error('[IoT Dashboard] Error fetching sensor data:', err);
            setError(err.response?.data?.message || 'Failed to fetch sensor data. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Simulate new sensor readings with dynamic variations
     */
    const simulateSensorData = async () => {
        try {
            setSimulateMode(true);
            
            // Generate realistic variations from current values
            const simulatedData = {
                farmer_id: FARMER_ID,
                temperature: simulateVariation(sensorData?.temperature || 28, 3),
                humidity: simulateVariation(sensorData?.humidity || 65, 5),
                soil_moisture: simulateVariation(sensorData?.soil_moisture || 45, 4),
                ph: simulateVariation(sensorData?.ph || 6.5, 0.3),
                nitrogen: simulateVariation(sensorData?.nitrogen || 120, 8)
            };

            console.log('[Simulation] Sending sensor data:', simulatedData);
            
            await api.post('/api/iot/sensor-data', simulatedData);

            // Refresh to get updated data
            await fetchSensorData();
            
            console.log('[Simulation] Sensor data updated successfully');
        } catch (err: any) {
            console.error('[Simulation] Error:', err);
            setError('Failed to simulate sensor data');
        } finally {
            setSimulateMode(false);
        }
    };

    // Fetch data on mount and auto-refresh every 5 seconds
    useEffect(() => {
        fetchSensorData();
        const interval = setInterval(fetchSensorData, FETCH_INTERVAL);
        
        // Auto-simulate sensor data every 30 seconds for demo purposes
        const simulationInterval = setInterval(() => {
            // Only auto-simulate if there's existing data (user is viewing dashboard)
            if (sensorData && cooldown === 0) {
                simulateSensorData();
            }
        }, 30000); // Every 30 seconds
        
        return () => {
            clearInterval(interval);
            clearInterval(simulationInterval);
        };
    }, [sensorData, cooldown]);

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
            {/* Header with Controls */}
            <div className="mb-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">🌾 IoT Sensor Dashboard</h1>
                        <p className="text-gray-600 mt-2">Real-time sensor monitoring & automation</p>
                        {lastUpdated && (
                            <p className="text-sm text-gray-500 mt-1">
                                Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={simulateSensorData}
                        disabled={simulateMode || loading}
                        className={`px-6 py-3 rounded-lg font-semibold shadow-lg transform transition-all ${
                            simulateMode
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-105'
                        } text-white`}
                    >
                        {simulateMode ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Simulating...
                            </span>
                        ) : (
                            <span>🔄 Simulate Sensors</span>
                        )}
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

            {/* Sensor Cards Grid with Alerts */}
            {sensorData && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {/* Temperature Card */}
                    <div className={`bg-white rounded-lg shadow-lg p-4 border-l-4 transition-all duration-500 ${getTemperatureColor(sensorData.temperature)}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-full transition-all duration-500 ${
                                    sensorData.temperature < 25 ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                                    sensorData.temperature <= 35 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                                    'bg-gradient-to-br from-red-400 to-red-600'
                                }`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">🌡 Temperature</p>
                                    <p className="text-2xl font-bold transition-all duration-500">{sensorData.temperature}°C</p>
                                </div>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full font-semibold transition-all duration-500">
                                {sensorData.temperature < 25 ? '❄️ Cold' :
                                 sensorData.temperature <= 35 ? '✅ Optimal' :
                                 '🔥 Hot'}
                            </span>
                        </div>
                    </div>

                    {/* Humidity Card */}
                    <div className={`bg-white rounded-lg shadow-lg p-4 border-l-4 transition-all duration-500 ${getHumidityColor(sensorData.humidity)}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-full transition-all duration-500 ${
                                    sensorData.humidity < 60 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                    sensorData.humidity <= 80 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                                    'bg-gradient-to-br from-red-400 to-red-600'
                                }`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">💧 Humidity</p>
                                    <p className="text-2xl font-bold transition-all duration-500">{sensorData.humidity}%</p>
                                </div>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full font-semibold transition-all duration-500">
                                {sensorData.humidity < 60 ? '⚠️ Low' :
                                 sensorData.humidity <= 80 ? '✅ Good' :
                                 '🚨 High'}
                            </span>
                        </div>
                    </div>

                    {/* Soil Moisture Card */}
                    <div className={`bg-white rounded-lg shadow-lg p-4 border-l-4 transition-all duration-500 ${getSoilMoistureColor(sensorData.soil_moisture)}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-full transition-all duration-500 ${
                                    sensorData.soil_moisture < 35 ? 'bg-gradient-to-br from-red-400 to-red-600' :
                                    sensorData.soil_moisture <= 60 ? 'bg-gradient-to-br from-green-400 to-green-600' :
                                    'bg-gradient-to-br from-blue-400 to-blue-600'
                                }`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">💧 Soil Moisture</p>
                                    <p className="text-2xl font-bold transition-all duration-500">{sensorData.soil_moisture}%</p>
                                </div>
                            </div>
                            <span className="text-xs px-2 py-1 rounded-full font-semibold transition-all duration-500">
                                {sensorData.soil_moisture < 35 ? '🚨 Dry' :
                                 sensorData.soil_moisture <= 60 ? '✅ Optimal' :
                                 '💧 Wet'}
                            </span>
                        </div>
                    </div>

                    {/* pH Level Card */}
                    <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-purple-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-br from-purple-400 to-pink-500 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">🧪 pH Level</p>
                                    <p className="text-2xl font-bold text-gray-900">{sensorData.ph?.toFixed(1)}</p>
                                </div>
                            </div>
                            {(sensorData.ph < 6 || sensorData.ph > 7.5) && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold">⚠️ Check</span>
                            )}
                        </div>
                    </div>

                    {/* Nitrogen Card */}
                    <div className="bg-white rounded-lg shadow-lg p-4 border-l-4 border-emerald-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-3 rounded-full">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">🌱 Nitrogen</p>
                                    <p className="text-2xl font-bold text-gray-900">{sensorData.nitrogen} kg/ha</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pump Status Card */}
                    <div className="bg-white rounded-lg shadow-lg p-4 col-span-2 border-l-4 border-blue-600">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className={`p-3 rounded-full ${sensorData.pump === 'ON' ? 'bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse' : 'bg-gradient-to-br from-gray-400 to-gray-600'}`}>
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">🚰 Water Pump</p>
                                    <p className={`text-2xl font-bold ${sensorData.pump === 'ON' ? 'text-blue-600' : 'text-gray-600'}`}>
                                        {sensorData.pump}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-500 font-semibold">
                                    {manualMode ? '⚙️ Manual Mode' : '🤖 Auto Mode'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {manualMode ? 'User controlled' : 'Moisture-based'}
                                </p>
                                {sensorData.pump === 'ON' && (
                                    <p className="text-xs text-blue-600 font-bold mt-1">💧 Active</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Manual Control Buttons */}
                        <div className="mt-4 pt-4 border-t flex gap-3">
                            <button
                                onClick={() => togglePump("ON")}
                                disabled={manualMode && sensorData.pump === "ON"}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                                    sensorData.pump === "ON"
                                        ? 'bg-blue-600 text-white cursor-default'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105'
                                }`}
                            >
                                💧 Turn ON
                            </button>
                            <button
                                onClick={() => togglePump("OFF")}
                                disabled={manualMode && sensorData.pump === "OFF"}
                                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                                    sensorData.pump === "OFF"
                                        ? 'bg-gray-600 text-white cursor-default'
                                        : 'bg-gray-500 hover:bg-gray-600 text-white hover:scale-105'
                                }`}
                            >
                                ⏹ Turn OFF
                            </button>
                        </div>
                        {manualMode && (
                            <p className="mt-2 text-xs text-orange-600 font-semibold">
                                ⏱ Manual mode active - Will return to auto in 5 minutes
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Auto-refresh indicator */}
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 mb-6">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Auto-refreshing every 30 seconds</span>
            </div>

            {/* Optimal Ranges Guide */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-3">📊 Optimal Sensor Ranges</h2>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-semibold">🌡 Temperature:</span>
                        <span className="text-green-700 font-medium">25-35°C</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-semibold">💧 Humidity:</span>
                        <span className="text-green-700 font-medium">60-80%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-semibold">💧 Soil Moisture:</span>
                        <span className="text-green-700 font-medium">35-60%</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-semibold">🧪 pH Level:</span>
                        <span className="text-green-700 font-medium">6.0-7.5</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="font-semibold">🌱 Nitrogen:</span>
                        <span className="text-green-700 font-medium">100-250 kg/ha</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    <p>✅ Values outside these ranges will show alerts</p>
                </div>
            </div>
        </div>
    );
}
