"use client";

import { useEffect, useState } from "react";

export default function Hero() {
  const validAllStrings = [
    "Translations for ALL.",
    "Переводы для ВСЕХ.",
    "Traductions pour TOUS.",
    "Traducciones para TODOS.",
    "Übersetzungen für ALLE.",
    "Traduzioni per TUTTI.",
    "全ての人の 翻訳。",
    "모두를 위한 번역.",
    "Todos os idiomas.",
    "Traduções para TODOS.",
    "ການແປສໍາລັບ ທຸກຄົນ."
  ]
  const [allString, setAllString] = useState(["Translations for", "ALL."]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const string = validAllStrings[index];
      setIndex((index + 1) % validAllStrings.length);
      const split = string.split(" ")

      // Word in capital is "ALL" - extract it.
      const all = split[split.length - 1];
      const rest = split.slice(0, split.length - 1).join(" ");
      setAllString([rest, all]);
    }, 750);

    return () => {
      clearInterval(interval);
    };
  }, [index, allString]);

  return (
    <section className="relative">

      {/* Illustration behind hero content */}
      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 pointer-events-none -z-1" aria-hidden="true">
        <svg width="1360" height="578" viewBox="0 0 1360 578" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="illustration-01">
              <stop stopColor="#FFF" offset="0%" />
              <stop stopColor="#EAEAEA" offset="77.402%" />
              <stop stopColor="#DFDFDF" offset="100%" />
            </linearGradient>
          </defs>
          <g fill="url(#illustration-01)" fillRule="evenodd">
            <circle cx="1232" cy="128" r="128" />
            <circle cx="155" cy="443" r="64" />
          </g>
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Hero content */}
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">

          {/* Section header */}
          <div className="text-center pb-12 md:pb-16">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tighter justify-center text-center tracking-tighter mb-4" data-aos="zoom-y-out" style={{ whiteSpace: "nowrap" }}>{allString[0]} <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-teal-400">{allString[1]}</span></h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-xl text-gray-600 mb-8" data-aos="zoom-y-out" data-aos-delay="150">Loqui provides free, open-source, and community-driven translations for ALL Minecraft mods.</p>
              <div className="max-w-xs mx-auto sm:max-w-none sm:flex sm:justify-center" data-aos="zoom-y-out" data-aos-delay="300">
                <div>
                  <a className="btn text-white bg-blue-600 hover:bg-blue-700 w-full mb-4 sm:w-auto sm:mb-0" href="https://app.lokalise.com/public/892314276620448bc4e5c0.98736537/">Help Translate</a>
                </div>
                <div>
                  <a className="btn text-white bg-gray-900 hover:bg-gray-800 w-full sm:w-auto sm:ml-4" href="http://modrinth.com/mod/loqui">Download</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}