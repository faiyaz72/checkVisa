import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";

countries.registerLocale(enLocale);

export type Country = {
  code: string;
  name: string;
  flagCode: string;
};

export function buildCountry(code: string): Country {
  return {
    code,
    name: countries.getName(code, "en") ?? code,
    flagCode: code.toLowerCase(),
  };
}

export function getAllWorldCountries(): Country[] {
  return Object.entries(countries.getNames("en", { select: "official" }))
    .map(([code, name]) => ({ code, name, flagCode: code.toLowerCase() }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
