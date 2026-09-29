import React, { useState, useEffect } from 'react';
import api from '@/api';

interface FarmHealthScore {
  score: number;
  rating: string;
  color: string;
  breakdown: {
    soil: { score: number; weight: string; status: string };
    weather: { score: number; weight: string; status: string };
    crop: { score: number; weight: string; status: string };
  };
  recommendations: Array<{
    category: string;
    priority: string;
    text: string;
    action: string;
  }>;
}

const FarmHealthGauge: React.FC<{ score: number; color: string }> = ({ score, color }) => {
  const percentage = (score / 100) * 180; // 180 degrees for semicircle

  return (
    <div className="relative w-64 h-32 overflow-hidden">
      {/* Background arc */}
      <div
        className="absolute bottom-0 w-full h-full bg-gray-200 rounded-t-full"
        style={{ transform: 'rotate(0deg)' }}
      />

      {/* Colored arc - rotates based on score */}
      <div
        className="absolute bottom-0 w-full h-full rounded-t-full transition-all duration-1000 ease-out"
        style={{
          background: `conic-gradient(from 180deg at 50% 100%, ${color} 0deg, ${color} ${percentage}deg, transparent ${percentage}deg)`,
          transform: 'rotate(0deg)'
        }}
      />

      {/* Score display */}
      <div className="absolute bottom-0 w-full h-24 flex flex-col items-end justify-center pr-16">
        <span className="text-5xl font-bold" style={{ color }}>
          {score}
        </span>
      </div>

      {/* Rating label */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-600">
        Health Score
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors: Record<string, string> = {
    Healthy: 'bg-green-100 text-green-800',
    Moderate: 'bg-yellow-100 text-yellow-800',
    Concerning: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const RecommendationCard: React.FC<{
  recommendation: { category: string; priority: string; text: string; action: string };
}> = ({ recommendation }) => {
  const priorityColors: Record<string, string> = {
    High: 'border-l-red-500',
    Medium: 'border-l-yellow-500',
    Low: 'border-l-green-500'
  };

  return (
    <div className={`bg-white border-l-4 ${priorityColors[recommendation.priority]} p-4 rounded shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800">{recommendation.category}</h4>
        <span className={`text-xs px-2 py-1 rounded ${recommendation.priority === 'High' ? 'bg-red-100 text-red-800' :
            recommendation.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
          }`}>
          {recommendation.priority}
        </span>
      </div>
      <p className="text-gray-600 text-sm mb-2">{recommendation.text}</p>
      <p className="text-gray-800 text-sm font-medium">💡 {recommendation.action}</p>
    </div>
  );
};

const FarmHealthScoreWidget: React.FC<{ farmerId: string }> = ({ farmerId }) => {
  const [scoreData, setScoreData] = useState<FarmHealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScore = async () => {
      try {
        const response = await api.get('/api/farm-health-score', { params: { farmerId } });
        setScoreData(response.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load farm health score');
        setLoading(false);
      }
    };

    if (farmerId) {
      fetchScore();
    }
  }, [farmerId]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !scoreData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-red-600">
        <p>⚠️ {error || 'Unable to load health score'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">🏥 Farm Health Score</h3>

      {/* Gauge */}
      <div className="flex justify-center mb-6">
        <FarmHealthGauge score={scoreData.score} color={scoreData.color} />
      </div>

      {/* Overall Rating */}
      <div className="text-center mb-6">
        <p className="text-2xl font-bold" style={{ color: scoreData.color }}>
          {scoreData.rating}
        </p>
        <p className="text-sm text-gray-600 mt-1">Overall Farm Health</p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Soil Health</p>
          <p className="text-2xl font-bold">{scoreData.breakdown.soil.score}</p>
          <StatusBadge status={scoreData.breakdown.soil.status} />
          <p className="text-xs text-gray-500 mt-1">({scoreData.breakdown.soil.weight})</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Weather</p>
          <p className="text-2xl font-bold">{scoreData.breakdown.weather.score}</p>
          <StatusBadge status={scoreData.breakdown.weather.status} />
          <p className="text-xs text-gray-500 mt-1">({scoreData.breakdown.weather.weight})</p>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Crops</p>
          <p className="text-2xl font-bold">{scoreData.breakdown.crop.score}</p>
          <StatusBadge status={scoreData.breakdown.crop.status} />
          <p className="text-xs text-gray-500 mt-1">({scoreData.breakdown.crop.weight})</p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 mb-2">💡 Recommendations</h4>
        {scoreData.recommendations.map((rec, idx) => (
          <RecommendationCard key={idx} recommendation={rec} />
        ))}
      </div>
    </div>
  );
};

export default FarmHealthScoreWidget;
