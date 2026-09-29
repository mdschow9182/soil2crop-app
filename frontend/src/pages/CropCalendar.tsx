import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '@/api';
import { useLanguage } from '@/context/LanguageContext';
import { VoiceButton } from '@/components/VoiceButton';

export default function CropCalendar() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [calendar, setCalendar] = useState(null);
  const [crop, setCrop] = useState(() => location.state?.crop || localStorage.getItem('selectedCrop') || '');
  const [cropId, setCropId] = useState(() => location.state?.cropId || localStorage.getItem('selectedCropId') || '');
  const [state, setState] = useState(() => location.state?.state || localStorage.getItem('farmer_state') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!crop) setError(t.calendarSelectCrop);
    else if (!state) setError(t.calendarSelectState);
    else fetchCropCalendar(crop, state);
  }, []);

  const fetchCropCalendar = async (selectedCrop = crop, selectedState = state) => {
    const cropName = selectedCrop?.trim();
    const stateName = selectedState?.trim();
    if (!cropName) {
      setCalendar(null);
      setError(t.calendarSelectCrop);
      return;
    }
    if (!stateName) {
      setCalendar(null);
      setError(t.calendarSelectState);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCalendar(null);
      // The existing calendar route is keyed by its dataset's crop display name;
      // retain cropId for identity/navigation, but send the route's actual contract.
      const response = await api.get('/api/crop-calendar', { params: { crop: cropName, state: stateName } });
      const data = response.data;

      if (data.success === false) {
        setError(language === "en" ? data.message || t.calendarDataUnavailable : t.calendarDataUnavailable);
      } else if (data.data || data) {
        setCalendar(data.data || data);
      } else {
        setError(t.calendarDataUnavailable);
      }
    } catch (err) {
      console.error('Error fetching calendar:', err);
      setError(language === "en" && err instanceof Error ? err.message : t.calendarFetchFailed);
    } finally {
      setLoading(false);
    }
  };

  const voiceSowingTime = language === "en" ? calendar?.sowing_time?.display_text : t.calendarNotAvailable;
  const voiceHarvestingTime = language === "en" ? calendar?.harvesting_time?.display_text : t.calendarNotAvailable;

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl bg-gradient-to-br from-green-50 to-blue-50 px-3 py-4 pb-24 sm:px-6 sm:py-6 sm:pb-28" data-crop-id={cropId || undefined}>
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{t.cropCalendarTitle || t.cropCalendar}</h1>
        <p className="text-gray-600 mt-2">{t.calendarSubtitle}</p>
      </div>

      {/* Search Form */}
      <div className="mb-5 rounded-xl bg-white p-4 shadow-lg sm:mb-8 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.calendarCropLabel}
            </label>
            <input
              type="text"
              value={crop}
              onChange={(e) => {
                setCrop(e.target.value);
                setCropId('');
                localStorage.setItem('selectedCrop', e.target.value);
                localStorage.removeItem('selectedCropId');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder={t.calendarSelectCrop}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.calendarStateLabel}
            </label>
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                if (e.target.value) localStorage.setItem('farmer_state', e.target.value);
                else localStorage.removeItem('farmer_state');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">{t.calendarStateLabel}</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchCropCalendar()}
              disabled={loading || !crop.trim() || !state.trim()}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? t.calendarLoading : t.calendarGet}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center">
          <span className="text-6xl block mb-4">⚠️</span>
          <p className="text-red-800 text-lg font-semibold">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            {t.calendarGoBack}
          </button>
        </div>
      )}

      {!error && !calendar && !loading && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <span className="text-6xl block mb-4">🌱</span>
          <p className="text-gray-600 text-lg">{t.calendarNoCrop}</p>
          <p className="text-gray-500 mt-2">{t.calendarNoCropHelp}</p>
        </div>
      )}

      {/* Calendar Display */}
      {calendar && (
        <div className="space-y-6">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            {t.calendarUnverifiedNotice}
          </div>
                  <VoiceButton language={language} message={`${t.cropCalendarTitle || t.cropCalendar}. ${crop}. ${t.calendarSowingTime}: ${voiceSowingTime || t.calendarNotAvailable}. ${t.calendarHarvestingTime}: ${voiceHarvestingTime || t.calendarNotAvailable}.`} />
          {/* Basic Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{t.calendarSowingTime}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {calendar?.sowing_time?.display_text || t.calendarNotAvailable}
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded-full">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{t.calendarHarvestingTime}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {calendar?.harvesting_time?.display_text || t.calendarNotAvailable}
                  </p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-full">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{t.calendarDuration}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {calendar?.duration_days || t.calendarNotAvailable} {t.days}
                  </p>
                </div>
                <div className="bg-blue-100 p-4 rounded-full">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Fertilizer Schedule */}
          <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.calendarFertilizerSchedule}</h2>
            <div className="space-y-4">
              {calendar?.fertilizer_schedule?.length ? calendar.fertilizer_schedule.map((fert, index) => (
                <div key={index} className="rounded-lg border border-green-200 bg-green-50/50 p-3">
                  <p className="font-semibold leading-snug text-gray-900">{fert.stage}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>{t.calendarTiming}:</strong> {fert.timing}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>{t.calendarType}:</strong> {fert.fertilizer_type} - {fert.amount_per_hectare}
                  </p>
                  <p className="text-sm text-gray-600">
                    {fert.application_method && <><strong>{t.calendarMethod}:</strong> {fert.application_method}</>}
                  </p>
                </div>
              )) : <p className="text-gray-500">{t.calendarNoFertilizerSchedule}</p>}
            </div>
          </div>

          {/* Irrigation Schedule */}
          <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.calendarIrrigationSchedule}</h2>
            <div className="space-y-4">
              {calendar?.irrigation_schedule?.length ? calendar.irrigation_schedule.map((irr, index) => (
                <div key={index} className="rounded-lg border border-blue-200 bg-blue-50/50 p-3">
                  <p className="font-semibold text-gray-900">{irr.stage}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>{t.calendarWhen}:</strong> {irr.days_after_sowing}
                  </p>
                  {irr.water_requirement_mm && (
                    <p className="text-sm text-gray-600">
                      <strong>{t.calendarWater}:</strong> {String(irr.water_requirement_mm).trim()}{/mm\s*$/i.test(String(irr.water_requirement_mm)) ? "" : " mm"}
                    </p>
                  )}
                  {irr.frequency && (
                    <p className="text-sm text-gray-600">
                      <strong>{t.calendarFrequency}:</strong> {irr.frequency}
                    </p>
                  )}
                </div>
              )) : <p className="text-gray-500">{t.calendarNoIrrigationSchedule}</p>}
            </div>
          </div>

          {/* Best Practices */}
          <div className="rounded-xl bg-white p-4 shadow-lg sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.calendarBestPractices}</h2>
            <div className="space-y-3">
              {calendar?.best_practices?.length ? calendar.best_practices.map((practice, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <span className="text-green-600 font-bold text-lg">✓</span>
                  <div>
                    <p className="font-semibold text-gray-900">{practice.title}</p>
                    <p className="text-sm text-gray-600">{practice.description}</p>
                    {practice.timing && (
                      <p className="text-xs text-gray-500 mt-1">{t.calendarTiming}: {practice.timing}</p>
                    )}
                  </div>
                </div>
              )) : <p className="text-gray-500">{t.calendarNoBestPractices}</p>}
            </div>
          </div>

          {/* Expected Outcomes */}
          <div className="rounded-xl bg-gradient-to-r from-green-700 to-blue-700 p-4 text-white shadow-lg sm:p-6">
            <h2 className="text-xl font-bold mb-4">{t.calendarExpectedOutcomes}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-green-100 text-sm">{t.calendarExpectedYield}</p>
                <p className="text-2xl font-bold mt-1">
                  {calendar?.expected_yield_kg_per_hectare?.min || t.calendarNotAvailable} - {calendar?.expected_yield_kg_per_hectare?.max || t.calendarNotAvailable} kg/hectare
                </p>
              </div>
              <div>
                <p className="text-green-100 text-sm">{t.calendarExpectedProfit}</p>
                <p className="text-2xl font-bold mt-1">
                  ₹{calendar?.expected_profit_inr_per_hectare?.min ?? t.calendarNotAvailable} - ₹{calendar?.expected_profit_inr_per_hectare?.max ?? t.calendarNotAvailable} per hectare
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
