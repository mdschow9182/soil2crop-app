import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { speakMessage } from '@/utils/voiceAssistant';

export default function VoiceCommands() {
    const navigate = useNavigate();
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [commands, setCommands] = useState<string[]>([]);
    const [error, setError] = useState('');

    // Voice command mappings
    const voiceCommandMap: Record<string, string> = {
        'recommend crops': '/dashboard',
        'crop recommendation': '/dashboard',
        'soil analysis': '/soil-upload',
        'upload soil': '/soil-upload',
        'disease detection': '/crop-health',
        'rice disease detection': '/crop-health',
        'check weather': '/weather',
        'market prices': '/market-prices',
        'mandi prices': '/market-prices',
        'my profile': '/profile',
        'help': '/help',
        'success stories': '/success-stories',
        'crop calendar': '/crop-calendar',
        'iot dashboard': '/iot-dashboard'
    };

    useEffect(() => {
        // Check for browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            setError('Speech recognition not supported in this browser. Please use Chrome or Edge.');
        }
    }, []);

    const startListening = () => {
        try {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();

            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
                setError('');
            };

            recognition.onresult = (event: any) => {
                const spokenText = event.results[0][0].transcript.toLowerCase().trim();
                setTranscript(spokenText);
                processVoiceCommand(spokenText);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setError(event.error === 'no-speech' ? 'No speech detected. Please try again.' : 'Speech recognition error.');
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        } catch (err) {
            console.error('Error starting speech recognition:', err);
            setError('Failed to start voice recognition.');
        }
    };

    const processVoiceCommand = (command: string) => {
        // Add to command history
        setCommands(prev => [command, ...prev.slice(0, 9)]);

        // Find matching route
        let matchedRoute = '';

        for (const [voiceCmd, route] of Object.entries(voiceCommandMap)) {
            if (command.includes(voiceCmd)) {
                matchedRoute = route;
                break;
            }
        }

        if (matchedRoute) {
            // Speak confirmation
            speak(`Navigating to ${matchedRoute.replace('-', ' ')}`);
            // Navigate
            setTimeout(() => navigate(matchedRoute), 1000);
        } else {
            // No match found
            speak('Command not recognized. Please try again.');
            setError('Command not recognized. Available commands: recommend crops, soil analysis, disease detection, etc.');
        }
    };

    const speak = (text: string) => {
        // Voice command prompts are currently English, so keep their voice locale truthful.
        speakMessage(text, 'en');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-gray-900">🎤 Voice Commands</h1>
                <p className="text-gray-600 mt-2">Hands-free farming interface - Just speak!</p>
            </div>

            {/* Main Voice Button */}
            <div className="max-w-md mx-auto mb-8">
                <button
                    onClick={startListening}
                    disabled={isListening}
                    className={`w-full py-6 rounded-full text-white text-2xl font-bold transition-all transform hover:scale-105 ${isListening
                            ? 'bg-red-600 animate-pulse'
                            : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
                        }`}
                >
                    {isListening ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Listening...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center">
                            <svg className="h-8 w-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            Tap to Speak
                        </span>
                    )}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                        ⚠️ {error}
                    </div>
                )}
            </div>

            {/* Current Transcript */}
            {transcript && (
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-sm font-medium text-gray-600 mb-2">You Said:</h3>
                        <p className="text-2xl font-bold text-gray-900">"{transcript}"</p>
                    </div>
                </div>
            )}

            {/* Available Commands */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Available Voice Commands</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(voiceCommandMap).map((cmd, index) => (
                            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <span className="text-green-600">🎙️</span>
                                <span className="text-gray-900 font-medium">"{cmd}"</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Command History */}
                {commands.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">📜 Recent Commands</h2>
                        <div className="space-y-2">
                            {commands.map((cmd, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <span className="text-blue-600">▶️</span>
                                    <span className="text-gray-700">{cmd}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
                    <h3 className="font-bold text-blue-900 mb-2">💡 How to Use:</h3>
                    <ol className="space-y-2 text-blue-800">
                        <li>1. Click the "Tap to Speak" button above</li>
                        <li>2. Clearly say a command like "Recommend crops" or "Disease detection"</li>
                        <li>3. The system will navigate to the appropriate page</li>
                        <li>4. You'll hear a confirmation message</li>
                    </ol>
                    <p className="mt-4 text-sm text-blue-700">
                        <strong>Note:</strong> Works best in Chrome or Edge browsers. Make sure your microphone is enabled.
                    </p>
                </div>
            </div>
        </div>
    );
}
