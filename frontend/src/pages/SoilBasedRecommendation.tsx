import { Navigate } from 'react-router-dom';

// Compatibility page: crop advice now always comes from the saved-report workflow.
export default function SoilBasedRecommendation() {
  return <Navigate to="/crop-suggestion" replace />;
}
