# Soil2Crop multilingual and voice audit

Audit date: 2026-09-29

## A. Language system: PARTIAL

The route tree now has one LanguageProvider. Locale preference is stored in localStorage under soil2crop_language and synced through the existing farmer-language API when logged in. English fallback prevents missing keys from rendering undefined/null and logs omissions once in development. Six app locales are exposed: en, te, hi, ta, kn, ml.

English dictionary keys: 359. Missing locale keys are enumerated below. Missing keys currently fall back to English.

Common missing keys (162) for Telugu, Hindi, Tamil, Kannada, and Malayalam:

- cropSuitabilityTitle
- cropSuitabilitySubtitle
- naturalFarmingMode
- naturalFarmingDesc
- weatherInsights
- expectedRainfall
- noSignificantRainfall
- suitableCrops
- matchScore
- rainDependency
- inputCost
- marketRisk
- risks
- recommendations
- explanations
- profits
- estimatedYield
- marketPrice
- estimatedIncome
- basedOnAverage
- noteActualYields
- analyzingSoil
- missingSoilData
- advisoryDisclaimer
- marketPricesTitle
- filterPrices
- selectCropLabel
- selectLocationLabel
- viewPrices
- minPrice
- maxPrice
- avgPrice
- marketTrend
- rising
- falling
- stable
- lastUpdated
- noPriceData
- allCrops
- benefits
- eligibility
- visitWebsite
- governmentSchemesTitle
- schemeName
- category
- incomeSupport
- insurance
- soilManagement
- organicFarming
- irrigation
- notice
- usingDefaultSchemes
- alertsTitle
- voiceAlertsEnabled
- readingAlert
- markAllRead
- loadingAlerts
- noAlertsYet
- alertsWillAppearHere
- markRead
- readAloud
- delete
- smartAlerts
- aiPoweredNotifications
- success
- alertMarkedAsRead
- allAlertsMarkedAsRead
- alertDeleted
- failedToMarkAsRead
- failedToDelete
- profile
- language
- notifications
- selectAppLanguage
- currentLanguageCode
- preview
- autoUpdates
- cropCalendarAlerts
- languageUpdated
- appLanguageChangedTo
- cropCalendarTitle
- growingTimeline
- currentForecast
- criticalIrrigationWeeks
- week
- stage
- activity
- selectCropToView
- cropHealthCheck
- uploadCropImage
- cameraCapture
- analyzeCrop
- analyzing
- healthStatus
- possibleIssue
- suggestedAction
- takeOrUploadPhoto
- captureInstructions
- uploadInstructions
- healthy
- moderateStress
- diseased
- confidence
- howItWorks
- aiAnalysisDescription
- pleaseWait
- submit
- cancel
- save
- edit
- add
- yes
- no
- ok
- factorCoverage
- noRecommendations
- selectCropForFertilizer
- fertilizerAdvisorySelected
- nextActions
- cropRuleUnavailable
- weatherUnavailable
- waterLocalDataUnavailable
- soilNutrientUnavailable
- soilNutrientNeedsReview
- parameter_ph
- parameter_nitrogen
- parameter_phosphorus
- parameter_potassium
- parameter_electricalConductivity
- parameter_organicCarbon
- parameter_sulphur
- parameter_zinc
- parameter_iron
- parameter_manganese
- parameter_copper
- parameter_boron
- parameter_soilType
- factorPhMatch
- factorPhOutside
- factorPhRuleUnavailable
- factorSoilMatch
- factorSoilMismatch
- factorSoilMissing
- factorSoilRuleUnavailable
- factorNoMatch
- factorSeasonUnavailable
- factorRainfallUnavailable
- factorStagesUnavailable
- factorWithinConfiguredRange
- factorOutsideConfiguredRange
- cropWaterUnavailable
- irrigationRainfallWeatherUnavailable
- cropCatalogEmpty
- voiceUnsupported
- fertilizerSoilUnavailable
- fertilizerSoilNeedsReview
- settingsTitle
- farmerNameLabel
- farmerIdLabel
- previewAutoUpdates
- notificationsTitle
- calendarAlertsReminder

Additional ta missing keys (6):

- farmerSupport
- farmerSupportSubtitle
- askFarmingQuestion
- reportCropProblem
- farmingTips
- contactSupport

Additional kn missing keys (6):

- farmerSupport
- farmerSupportSubtitle
- askFarmingQuestion
- reportCropProblem
- farmingTips
- contactSupport

Additional ml missing keys (6):

- farmerSupport
- farmerSupportSubtitle
- askFarmingQuestion
- reportCropProblem
- farmingTips
- contactSupport

## B. Voice system: PARTIAL

Voice selection maps en/te/hi/ta/kn/ml to en-IN/te-IN/hi-IN/ta-IN/kn-IN/ml-IN. Shared helper checks SpeechSynthesis and SpeechSynthesisUtterance, chooses exact locale first and truthful fallback after, sets utterance.lang to the selected voice locale, and cancels prior speech. VoiceButton reports fallback voice name/locale and reports unsupported playback. The duplicate provider and farmer-facing VoiceDebug panel were removed from normal screens. Alerts, tutorials, assistant, command prompts, and compatibility voiceMessages use the shared TTS helper; mic command recognition remains its separate input feature.

Actual OS/browser inventory and audible regional-language voices: NOT VERIFIED. Headless Chrome/Edge did not provide usable DOM/voice output here. Tests use mocked voices only in test files. No installed regional voice is claimed.

## C. Dynamic text status: PARTIAL

Crop advice factor text, soil summary, fertilizer/irrigation status, and calendar labels use dictionary keys. Dynamic API values, units, crop names, scientific identifiers, and calendar descriptions remain verbatim as required. Backend-provided prose and English mock/fallback content in several screens is not machine-translated.

## D. Per-language status

English: PASS for dictionary completeness; browser voice is not verified.
Telugu: PARTIAL; 162/359 keys missing.
Hindi: PARTIAL; 162/359 keys missing.
Tamil: PARTIAL; 168/359 keys missing.
Kannada: PARTIAL; 168/359 keys missing.
Malayalam: PARTIAL; 168/359 keys missing.

## E. Voice status by language

English, Telugu, Hindi, Tamil, Kannada, Malayalam: PARTIAL. Locale mapping/fallback behavior has automated coverage, but no installed browser voice was observed and no audible manual test was completed for any locale.

## F. Remaining hard-coded English UI/content findings

- SoilReport: extracted-value review prompt, validation/upload/save toasts, Unit label, and some error text remain English. Parameter labels use locale dictionary keys and fall back to English where missing.
- CropSuggestion: fertilizer nutrient names and missing/review sentences fall back to English in regional locales where their keys/parameter terms are missing. API crop names and values stay unchanged.
- CropCalendar: calendar summary title uses the existing localized cropCalendar key; calendar schedule/API-provided text remains verbatim. Fixed location name Andhra Pradesh is data. In regional-language speech, English API sowing/harvesting text is omitted rather than misread as translated.
- Settings: profile/language selector labels and some status labels use English fallback.
- Alerts: several UI labels use English fallback. Static sample alerts have locale keys; real backend alert text is left unchanged and is not spoken as regional-language speech.
- MarketDashboard and MarketTrends: several page headings, loading/filter/table/explanation labels and speech summaries remain English or API-provided.
- GovernmentDashboard: loading/empty labels, headings, scheme defaults, and category text remain English.
- Tutorials: detailed step text/categories remain English. Shared TTS is used, but localized content was not verified.
- AIFarmerAssistant: welcome/suggested prompts are literal English; response localization depends on the existing endpoint and was not live-verified.
- VoiceCommands: recognition commands and prompts are English-only and recognition uses en-US.

## G. Remaining voice/fallback issues

- Browser voice inventory and playback for all six locales remain unverified; availability depends on browser/OS.
- English fallback dictionary entries keep UI safe but do not make that content translated.
- Market, tutorial, crop-health, and assistant voice content has not been manually validated end-to-end in the selected language.
- Server-supplied calendar/market/assistant prose is not machine-translated.

## H. Files changed in this audit

frontend/src/App.tsx; frontend/src/main.tsx; frontend/src/context/LanguageContext.tsx; frontend/src/i18n/translations.ts; frontend/src/components/LanguageSwitcher.tsx; frontend/src/components/LanguageSelector.tsx; frontend/src/components/VoiceButton.tsx; frontend/src/components/VoiceDebug.tsx; frontend/src/pages/Login.tsx; frontend/src/pages/Settings.tsx; frontend/src/pages/SoilReport.tsx; frontend/src/pages/CropSuggestion.tsx; frontend/src/pages/CropCalendar.tsx; frontend/src/pages/Alerts.tsx; frontend/src/components/AIFarmerAssistant.tsx; frontend/src/pages/Tutorials.tsx; frontend/src/pages/VoiceCommands.tsx; frontend/src/utils/voiceMessages.ts; frontend/src/utils/voiceAssistant.ts; tests in frontend/src/context/LanguageContext.test.tsx, frontend/src/i18n/translations.test.ts, frontend/src/pages/CropCalendar.test.tsx, frontend/src/utils/voiceAssistant.test.ts.

## I. Tests and builds

- Frontend tests: 14 passed, 5 files.
- TypeScript: npx tsc --noEmit passed.
- Production build: passed. Existing CSS @import ordering and large output chunk warnings remain.
- Full ESLint: failed with 74 errors and 21 warnings across the existing frontend. Widespread any-type and other lint errors remain; touched SoilReport/Tutorials also contain pre-existing any-type errors.
- Backend tests were not run because no backend files were modified.

## J. Runtime and manual checks

- Existing frontend http://localhost:8080: basic HTTP request returned 200. Port was occupied, so no duplicate dev server was started.
- Existing backend http://localhost:5001: basic HTTP request returned 200.
- Farmer upload/extraction/review/verification/advice/fertilizer/irrigation/calendar/voice journey: NOT VERIFIED. No browser-driven test farmer/report was available.
- Responsive checks at 320, 375, 390, 412, 768 px and text clipping/overflow: NOT VERIFIED. JSDOM cannot measure real browser layout.
- Browser console and audible language check: NOT VERIFIED.

## Overall

This is a partial stabilization. Safe fallback, locale selection, localized crop-advice/calendar presentation, and shared voice fallback handling are in place. Translation coverage, several English-only screens/content paths, real browser voices, and end-to-end/mobile acceptance remain outstanding. No agronomic recommendation rules were changed.

## Phase 1 farmer-presentation update — 2026-09-29

This update covers the prioritized farmer journey only. It does not claim complete multilingual support.

### Translation coverage

- The test-enforced farmer journey contains 191 keys covering navigation, login, soil upload/review/extraction, soil summary, recommendation explanations and factor labels, fertilizer/irrigation states, crop-calendar labels, alerts, settings, and voice controls.
- All 191 keys are explicitly present for each regional locale: Telugu, Hindi, Tamil, Kannada, and Malayalam. Dynamic fertilizer templates retain their `{nutrient}` placeholder. Crop names, scientific names, reported values, units, identifiers, and API values remain data and are not translated.
- Current dictionary coverage: English 359/359; Telugu 272/359; Hindi 272/359; Tamil 272/359; Kannada 272/359; Malayalam 272/359. Each regional locale still has 87 untranslated, non-priority English dictionary keys.
- Remaining common untranslated keys: `cropSuitabilityTitle`, `cropSuitabilitySubtitle`, `naturalFarmingMode`, `naturalFarmingDesc`, `weatherInsights`, `expectedRainfall`, `noSignificantRainfall`, `suitableCrops`, `matchScore`, `rainDependency`, `inputCost`, `marketRisk`, `risks`, `recommendations`, `explanations`, `profits`, `estimatedYield`, `marketPrice`, `estimatedIncome`, `basedOnAverage`, `noteActualYields`, `analyzingSoil`, `missingSoilData`, `advisoryDisclaimer`, `marketPricesTitle`, `filterPrices`, `selectCropLabel`, `selectLocationLabel`, `viewPrices`, `minPrice`, `maxPrice`, `avgPrice`, `marketTrend`, `rising`, `falling`, `stable`, `lastUpdated`, `noPriceData`, `allCrops`, `benefits`, `eligibility`, `visitWebsite`, `governmentSchemesTitle`, `schemeName`, `category`, `incomeSupport`, `insurance`, `soilManagement`, `organicFarming`, `irrigation`, `notice`, `usingDefaultSchemes`, `cropCalendarTitle`, `growingTimeline`, `currentForecast`, `criticalIrrigationWeeks`, `week`, `stage`, `activity`, `selectCropToView`, `cropHealthCheck`, `uploadCropImage`, `cameraCapture`, `analyzeCrop`, `analyzing`, `healthStatus`, `possibleIssue`, `suggestedAction`, `takeOrUploadPhoto`, `captureInstructions`, `uploadInstructions`, `healthy`, `moderateStress`, `diseased`, `confidence`, `howItWorks`, `aiAnalysisDescription`, `pleaseWait`, `submit`, `cancel`, `save`, `edit`, `add`, `yes`, `no`, `ok`, `fertilizerAdvisorySelected`, `cropRuleUnavailable`, `previewAutoUpdates`, `notificationsTitle`, `calendarAlertsReminder`.
- The six support labels formerly absent in Tamil, Kannada, and Malayalam are now present.

### Dynamic text and voice

- Crop advice factor codes are mapped to localized text for known project factor codes; unknown codes render a localized unavailable label rather than a raw technical identifier. Soil parameter labels and unavailable/review explanations for fertilizer and irrigation use dictionary keys. Non-English API failures now use localized generic page errors rather than displaying English backend error messages.
- Crop-calendar labels and warnings are translated. The existing API response values remain unchanged: `backend/routes/cropCalendar.js` returns schedule/value fields from its `cropCalendarDB`, and those values are shown verbatim. They have not been translated because no safe source-backed translation data exists. This is a known dynamic-content limitation.
- Voice uses the existing shared `voiceAssistant` helper. It requests `en-IN`, `te-IN`, `hi-IN`, `ta-IN`, `kn-IN`, or `ml-IN`, reports the actual selected voice/fallback through its selection result, cancels prior speech, and returns a safe fallback result if voice enumeration or playback fails. Automated tests use mocked browser voices; they do not establish that any regional voice is installed.
- The normal `VoiceButton` now shows a compact translated Listen/Stop control and no longer prints the voice name/locale diagnostic beside farmer content. Unsupported browsers receive a localized availability message. Developer diagnostics remain outside the farmer control.
- Actual browser voice inventory/playback and the full farmer journey: **NOT VERIFIED — browser voice playback unavailable in this environment.**

### Verification for this update

- Frontend tests: 20 passed across 6 files.
- TypeScript: `npx tsc --noEmit` passed.
- Production build: passed. Existing CSS `@import` order and large-chunk warnings remain.
- Browser playback, browser console, and full farmer journey were not verified. No PWA/APK conversion was started.

### Files changed for this update

- `frontend/src/i18n/translations.ts`
- `frontend/src/i18n/translations.test.ts`
- `frontend/src/utils/voiceAssistant.ts`
- `frontend/src/utils/voiceAssistant.test.ts`
- `frontend/src/components/VoiceButton.tsx`
- `frontend/src/components/VoiceButton.test.tsx`
- `frontend/src/pages/CropSuggestion.tsx`
- `frontend/src/pages/CropCalendar.tsx`
- `MULTILINGUAL_VOICE_AUDIT.md`
