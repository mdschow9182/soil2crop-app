# Soil2Crop development verification checklist

This is a development checklist, not evidence that a feature works. Mark an item **VERIFIED** only after its screen renders in a real browser and its primary interaction succeeds. Route responses, compilation, and production builds do not count as browser verification.

## Core farmer flows

| Feature | Browser check | Status | Evidence / issue |
| --- | --- | --- | --- |
| Development voice diagnostics | Open `/dev/language-voice-diagnostics` in the development build and check heading, subtitle, and runtime console. | PARTIAL | Headless Edge loaded both labels at `http://localhost:8080/dev/language-voice-diagnostics`; no JS exception/console runtime errors. Speech output was not audibly verified. |
| Mobile More menu | Open More at a phone viewport; check navigation and assistant/support actions. | PARTIAL | At 360 x 800, Edge opened the menu and showed both assistant and support actions; panel open/close was not confirmed. |
| Homepage / dev server | Load `/` and the diagnostics route on the configured development port. | VERIFIED | Vite ran on port 8080; both URLs returned HTTP 200 and the diagnostics component rendered in Edge. |
| Login | Sign in with a valid test account; check invalid input and failed login feedback. | NOT VERIFIED | |
| Soil Report | Open the page, choose upload/manual entry, and verify controls. | NOT VERIFIED | |
| Soil report upload | Upload a supported PDF and image; check size/type errors and progress. | NOT VERIFIED | |
| PDF/image extraction | Confirm extracted values and source/review notes match the uploaded report. | NOT VERIFIED | |
| Farmer review | Edit extracted values and units before saving. | NOT VERIFIED | |
| Soil verification | Submit reviewed values and confirm the returned report is the saved/verified report. | NOT VERIFIED | |
| Soil health summary | Confirm available, missing, and needs-review values and units. | NOT VERIFIED | |
| Crop Suggestions | Request advice from the verified report; check factors, missing inputs, and disclaimer. | NOT VERIFIED | |
| Crop Details | Open a crop and confirm displayed details use returned crop data. | NOT VERIFIED | |
| Crop Calendar | Complete the flow in the dedicated checklist below. | PARTIAL | Headless Edge rendered the page, changed crop from Rice to Maize, and received HTTP 200 from the local calendar API. The full login/verified-report flow remains untested. |
| Fertilizer Advisory | Check source/status and verify no quantity is shown without a configured nutrient basis. | NOT VERIFIED | |
| Irrigation Advisory | Check water category and weather/rainfall availability; verify no unsupported schedule is shown. | NOT VERIFIED | |
| Language switching | Check page title, navigation, buttons, persistence, and stale text after switching. | PARTIAL | Diagnostics table showed translated rows for six locales; in-app language switching and persistence still need browser checks. |
| Voice Listen/Stop | Exercise each language and lifecycle case in the dedicated checklist below. | PARTIAL | Headless Edge reported ended events for English and five regional tests. Audio was not independently audible; device playback remains unverified. |
| Alerts | Load alerts and exercise read, mark-read, and empty/error states. | NOT VERIFIED | |
| Government Schemes | Load the list and open a scheme link. | NOT VERIFIED | |
| Tutorials | Open a tutorial and test its available media/actions. | NOT VERIFIED | |
| Market Dashboard | Load market data and verify loading, success, and error states. | NOT VERIFIED | |
| Market Trends | Load a trend and verify its displayed values and source. | NOT VERIFIED | |
| AI Farmer Assistant / AI Chatbot | Send a question, verify the response/error state, then test Listen/Stop if available. | NOT VERIFIED | |

## Crop Calendar browser test

Use a test farmer and a verified soil report. Record actual UI and network evidence for each step; do not invent missing calendar data.

- [ ] Login → Soil Report → verified report → Crop Advice → select crop → Crop Calendar.
- [x] Calendar renders; crop selector changed Rice to Maize in Edge. State selector showed the configured Andhra Pradesh value.
- [x] Network panel showed Rice and Maize calendar requests to the local API, both HTTP 200.
- [x] Sowing/harvesting, fertilizer stages, irrigation stages, and best practices rendered without `undefined` or `null` text.
- [x] The calendar source warning was visible; returned values were displayed as provided. A duplicate `mm` unit was corrected in the UI.
- [x] The page labels calendar data unverified because the API contains no source reference. No weather/rainfall values were added.
- [ ] Verify this content against a real verified report and a trusted local source.

## Multilingual browser test

Repeat in English, Telugu, Hindi, Tamil, Kannada, and Malayalam. Dynamic crop/catalog/API values may remain in their source language when no safe mapping exists.

| Locale | Selector/persistence | Title/navigation/buttons | Soil/report/advice/calendar | Fertilizer/irrigation/alerts | Listen/Stop | Status / notes |
| --- | --- | --- | --- | --- | --- | --- |
| English | NOT VERIFIED | PARTIAL | NOT VERIFIED | NOT VERIFIED | PARTIAL | Diagnostics rendered; headless speech ended event only, not audible. |
| Telugu | NOT VERIFIED | PARTIAL | NOT VERIFIED | NOT VERIFIED | PARTIAL | Diagnostics rows rendered; speech ended event only, not audible. |
| Hindi | NOT VERIFIED | PARTIAL | NOT VERIFIED | NOT VERIFIED | PARTIAL | Diagnostics rows rendered; speech ended event only, not audible. |
| Tamil | NOT VERIFIED | PARTIAL | NOT VERIFIED | NOT VERIFIED | PARTIAL | Diagnostics rows rendered; speech ended event only, not audible. |
| Kannada | NOT VERIFIED | PARTIAL | NOT VERIFIED | NOT VERIFIED | PARTIAL | Diagnostics rows rendered; speech ended event only, not audible. |
| Malayalam | NOT VERIFIED | PARTIAL | NOT VERIFIED | NOT VERIFIED | PARTIAL | Diagnostics rows rendered; speech ended event only, not audible. |

Record missing-key English fallbacks, persistence after reload, stale strings after a language switch, and broken glyphs/layout.

## Voice browser/device test

Open `/dev/language-voice-diagnostics` in a development build. Check both visible labels: “Voice Assistance Diagnostics” and “Development-only diagnostic page”. Record browser, OS/platform, support, voice inventory/name/locale, event result, and errors. Test in order: English, Telugu, Hindi, Tamil, Kannada, Malayalam. Never mark a language working unless audible playback succeeds on that device. If its voice is missing, record **Voice unavailable on this device**.

- [ ] Listen / Stop, speech start, cancellation, repeated Listen, and navigation during speech.
- [ ] Change language while speaking; ensure old speech stops and localized text updates.
- [ ] Long text completes in order; missing/unavailable voice reports honestly.
- [ ] Record actual English and regional playback result per browser/device.

## Responsive browser test

At each viewport below, inspect horizontal overflow, sticky navigation, 44px touch targets, readable cards, dialogs, forms, keyboard overlap, text wrapping, charts, and voice controls. Also check tablet (768px) and desktop.

| Viewport | Browser/device | Overflow / interaction notes | Status |
| --- | --- | --- | --- |
| 360 x 800 | Headless Edge | Dashboard: no horizontal overflow, bottom navigation visible, five actions render, Listen target is 44px. Forms and dialogs untested. | PARTIAL |
| 375 x 812 | Headless Edge | Dashboard: no horizontal overflow, bottom navigation visible, five actions render, Listen target is 44px. Forms and dialogs untested. | PARTIAL |
| 390 x 844 | Headless Edge | Dashboard: no horizontal overflow, bottom navigation visible, five actions render, Listen target is 44px. Forms and dialogs untested. | PARTIAL |
| 412 x 915 | Headless Edge | Dashboard: no horizontal overflow, bottom navigation visible, five actions render, Listen target is 44px. Forms and dialogs untested. | PARTIAL |
| 768px tablet | Headless Edge | Dashboard: no horizontal overflow, bottom navigation visible, five actions render, Listen target is 44px. Forms and dialogs untested. | PARTIAL |
| Desktop | Headless Edge | Dashboard: no horizontal overflow, bottom navigation visible, five actions render, Listen target is 44px. Forms and dialogs untested. | PARTIAL |

The dashboard-only checks at these widths found no horizontal overflow, visible five-item bottom navigation, five action cards, and a 44px Listen button. The More menu also opened at 360 x 800. Other screens and device keyboard behavior remain untested.
