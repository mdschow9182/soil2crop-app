import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, AlertCircle, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import api from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

interface HelpHistoryProps {
  farmerId?: string;
  onBack?: () => void;
}

interface HelpRequest {
  id: string;
  category: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  resolution?: string;
  resolvedAt?: string;
  farmerSatisfaction?: number;
  createdAt: string;
}

export const HelpHistory = ({ farmerId, onBack }: HelpHistoryProps) => {
  const { language } = useLanguage();
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [rating, setRating] = useState<number>(0);

  useEffect(() => {
    if (farmerId) {
      fetchHelpRequests();
    }
  }, [farmerId]);

  const fetchHelpRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/help/my-requests', {
        params: { farmerId, limit: 20 }
      });
      
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error: any) {
      console.error('[HelpHistory] Error fetching requests:', error);
      toast.error('Failed to load help history');
    } finally {
      setLoading(false);
    }
  };

  const handleRateRequest = async (requestId: string, ratingValue: number) => {
    try {
      await api.put(`/api/help/${requestId}/rate`, {
        rating: ratingValue,
        comments: ''
      });
      
      toast.success(
        language === 'te' 
          ? 'ధన్యవాదాలు! మీ రేటింగ్ నమోదు చేయబడింది'
          : language === 'hi'
          ? 'धन्यवाद! आपकी रेटिंग दर्ज कर ली गई'
          : 'Thank you! Your rating has been recorded'
      );
      
      fetchHelpRequests(); // Refresh
      setSelectedRequest(null);
      setRating(0);
    } catch (error: any) {
      console.error('[HelpHistory] Error rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };

    const labels: Record<string, string> = {
      open: language === 'te' ? 'తెరిచింది' : language === 'hi' ? 'खुला' : 'Open',
      in_progress: language === 'te' ? 'ప్రగతిలో' : language === 'hi' ? 'प्रगति पर' : 'In Progress',
      resolved: language === 'te' ? 'పరిష్కరించబడింది' : language === 'hi' ? 'हल किया गया' : 'Resolved',
      closed: language === 'te' ? 'మూసివేయబడింది' : language === 'hi' ? 'बंद' : 'Closed'
    };

    return (
      <Badge className={variants[status] || variants.open}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, string> = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600'
    };

    const labels: Record<string, string> = {
      low: language === 'te' ? 'తక్కువ' : language === 'hi' ? 'कम' : 'Low',
      medium: language === 'te' ? 'మధ్యస్థం' : language === 'hi' ? 'मध्यम' : 'Medium',
      high: language === 'te' ? 'అధిక' : language === 'hi' ? 'उच्च' : 'High',
      urgent: language === 'te' ? 'అత్యవసరం' : language === 'hi' ? 'तत्काल' : 'Urgent'
    };

    return (
      <Badge variant="outline" className={variants[priority] || variants.medium}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  if (selectedRequest) {
    return (
      <div className="space-y-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => {
            setSelectedRequest(null);
            setRating(0);
          }}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {language === 'te' ? 'తిరిగి వెళ్ళు' : language === 'hi' ? 'वापस जाएं' : 'Back'}
        </Button>

        {/* Request Details */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{selectedRequest.subject}</h3>
            <div className="flex gap-2">
              {getStatusBadge(selectedRequest.status)}
              {getPriorityBadge(selectedRequest.priority)}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p><strong>{language === 'te' ? 'వర్గం:' : language === 'hi' ? 'श्रेणी:' : 'Category:'}</strong> {selectedRequest.category}</p>
            <p><strong>{language === 'te' ? 'తేదీ:' : language === 'hi' ? 'दिनांक:' : 'Date:'}</strong> {new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">{language === 'te' ? 'వివరణ:' : language === 'hi' ? 'विवरण:' : 'Description:'}</p>
            <p className="text-gray-700">{selectedRequest.description}</p>
          </div>

          {selectedRequest.resolution && (
            <div className="space-y-2 bg-green-50 p-3 rounded-lg">
              <p className="font-semibold text-green-800 flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                {language === 'te' ? 'పరిష్కారం:' : language === 'hi' ? 'समाधान:' : 'Resolution:'}
              </p>
              <p className="text-green-700">{selectedRequest.resolution}</p>
              {selectedRequest.resolvedAt && (
                <p className="text-sm text-green-600">
                  {language === 'te' ? 'పరిష్కరించిన తేదీ:' : language === 'hi' ? 'समाधान दिनांक:' : 'Resolved on:'}{' '}
                  {new Date(selectedRequest.resolvedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}

          {/* Rating Section */}
          {selectedRequest.status === 'resolved' && !selectedRequest.farmerSatisfaction && (
            <div className="space-y-2 border-t pt-4">
              <p className="font-semibold flex items-center">
                <Star className="mr-2 h-4 w-4" />
                {language === 'te' ? 'మీ అనుభవం ఎలా ఉంది?' : language === 'hi' ? 'आपका अनुभव कैसा रहा?' : 'How was your experience?'}
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRating(star);
                      handleRateRequest(selectedRequest.id, star);
                    }}
                    className={rating >= star ? 'bg-yellow-100 border-yellow-500' : ''}
                  >
                    ⭐
                  </Button>
                ))}
              </div>
            </div>
          )}

          {selectedRequest.farmerSatisfaction && (
            <Alert className="bg-yellow-50">
              <AlertDescription className="flex items-center">
                <Star className="mr-2 h-4 w-4 text-yellow-600" />
                {language === 'te' 
                  ? `మీ రేటింగ్: ${selectedRequest.farmerSatisfaction}/5 ⭐`
                  : language === 'hi'
                  ? `आपकी रेटिंग: ${selectedRequest.farmerSatisfaction}/5 ⭐`
                  : `Your rating: ${selectedRequest.farmerSatisfaction}/5 ⭐`}
              </AlertDescription>
            </Alert>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-0 h-auto text-sm"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {language === 'te' ? 'తిరిగి వెళ్ళు' : language === 'hi' ? 'वापस जाएं' : 'Back'}
        </Button>
        <h3 className="text-lg font-bold">
          {language === 'te' ? 'మీ అభ్యర్థనలు' : language === 'hi' ? 'आपके अनुरोध' : 'Your Requests'}
        </h3>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Empty State */}
      {!loading && requests.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {language === 'te' 
              ? 'మీరు ఇంకా ఏ అభ్యర్థనలను సమర్పించలేదు'
              : language === 'hi'
              ? 'आपने अभी तक कोई अनुरोध नहीं जमा किया है'
              : 'You haven\'t submitted any requests yet'}
          </AlertDescription>
        </Alert>
      )}

      {/* Requests List */}
      {!loading && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold line-clamp-1">{request.subject}</h4>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {new Date(request.createdAt).toLocaleDateString()}
                    {getPriorityBadge(request.priority)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
