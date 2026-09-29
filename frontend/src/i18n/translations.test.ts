import { describe, expect, it } from "vitest";
import { farmerJourneyTranslationKeys, supportedLanguages, translate, translationCoverage, translations } from "./translations";

describe("multilingual fallback", () => {
  it("defines all six supported language dictionaries", () => {
    expect(supportedLanguages.map(({ code }) => code)).toEqual(["en", "te", "hi", "ta", "kn", "ml"]);
    supportedLanguages.forEach(({ code }) => {
      expect(translations[code].login).toBeTruthy();
      expect(translations[code].soilHealthSummary).toBeTruthy();
      expect(translations[code].matchedFactors).toBeTruthy();
      expect(translations[code].irrigationAdvisory).toBeTruthy();
    });
  });

  it("uses English for missing keys and a safe message for unknown keys", () => {
    const missingKey = translationCoverage.te[0];
    expect(missingKey).toBeTruthy();
    expect(translate("te", missingKey)).toBe(translations.en[missingKey as keyof typeof translations.en]);
    expect(translate("te", "doesNotExist")).toBe("Translation unavailable");
    expect(translate("not-a-language", "login")).toBe(translations.en.login);
  });

  it("reports every untranslated English dictionary key by locale", () => {
    expect(translationCoverage.te.length).toBeGreaterThan(0);
    expect(translationCoverage.ml.length).toBeGreaterThan(0);
  });

  it("has explicit translations for the farmer journey in all five regional languages", () => {
    ( ["te", "hi", "ta", "kn", "ml"] as const).forEach((language) => {
      const untranslatedJourneyKeys = farmerJourneyTranslationKeys.filter((key) =>
        translationCoverage[language].includes(key),
      );
      expect(untranslatedJourneyKeys, `${language} missing farmer journey strings`).toEqual([]);
    });
  });

  it("translates dynamic crop advice templates without changing inserted values", () => {
    ( ["te", "hi", "ta", "kn", "ml"] as const).forEach((language) => {
      expect(translate(language, "fertilizerSoilUnavailable")).toContain("{nutrient}");
      expect(translate(language, "factorPhMatch")).not.toBe(translations.en.factorPhMatch);
      expect(translate(language, "irrigationNoPrescription")).not.toBe(translations.en.irrigationNoPrescription);
      expect(translate(language, "calendarUnverifiedNotice")).not.toBe(translations.en.calendarUnverifiedNotice);
    });
  });

  it("localizes the known catalog water and soil categories used in crop advice", () => {
    ( ["te", "hi", "ta", "kn", "ml"] as const).forEach((language) => {
      for (const key of ["catalogWaterLow", "catalogWaterMedium", "catalogWaterHigh", "catalogSoilSandy", "catalogSoilLoamy", "catalogSoilClay"] as const) {
        expect(translate(language, key)).not.toBe(translations.en[key]);
      }
    });
  });
});
