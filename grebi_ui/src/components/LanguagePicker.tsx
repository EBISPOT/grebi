import { KeyboardArrowDown } from "@mui/icons-material";
import countryCodeToFlagEmoji from "country-code-to-flag-emoji";
import React from "react";

export default function LanguagePicker({
  languages,
  lang,
  onChangeLang,
}: {
  languages:string[],
  lang: string;
  onChangeLang: (lang: string) => void;
}) {
  return (
    <div className="flex items-center group relative text-md">
      <select
        className="input-default appearance-none pr-7 z-20 bg-transparent cursor-pointer max-w-xs"
        onChange={(e) => {
          onChangeLang(e.target.value);
        }}
        value={lang}
      >
        {languages.map((lang) => {
          return (
            <option key={lang} value={lang}>
              {getEmoji(lang)}&nbsp;&nbsp;{lang}
            </option>
          );
        })}
      </select>
      <div className="absolute right-2 top-2 z-10 text-neutral-default group-focus:text-neutral-dark group-hover:text-neutral-dark">
        <KeyboardArrowDown fontSize="medium" />
      </div>
    </div>
  );
}

function getEmoji(lang: string) {
  // handle special cases
  return countryCodeToFlagEmoji(
    {
      en: "en-GB",
      cs: "cs-CZ",
      zh: "zh-CN",
    }[lang] || lang
  );
}
