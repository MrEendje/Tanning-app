# ☀️ Sunny — Tan Coach

Een veilige tan-coach met Duolingo/Apple-vibe. Op basis van jouw huidtype en de
échte UV-index vertelt Sunny hoe lang je veilig kunt zonnen, met streaks, XP en badges.

## Starten

```bash
npm install
npm run dev
```

Open daarna http://localhost:5173 (opent vanzelf). Voor het echte mobiele gevoel:
open de browser-devtools en zet 'm op een telefoon-formaat (iPhone).

## Wat zit erin

- **Onboarding** — welkom met Sunny, huidtint kiezen, Fitzpatrick mini-quiz, locatie, doel.
- **Vandaag** — UV-gauge, "veilig X min vandaag", Sunny-advies, beste zon-moment.
- **Zon-sessie** — live timer/ring, omdraai-reminders 🔄, smeer-reminder 🧴, schuil-waarschuwing ⛱️.
  - Tip: de **8× demo**-knop versnelt de tijd zodat je de reminders snel ziet. Zet op 1× voor echt.
- **Voortgang** — streak, sessies, zontijd + weekgrafiek.
- **Profiel** — level, XP, huidprofiel, doel, badges.

## Techniek

- React + Vite + Tailwind CSS, Framer Motion voor animaties.
- UV-data via [Open-Meteo](https://open-meteo.com) (gratis, geen API-key) + browser-geolocatie.
  Zonder locatie valt de app netjes terug op een schatting.
- Alles lokaal opgeslagen in LocalStorage — geen backend, geen account.

> ⚠️ De veilige-tijd-berekening is een vereenvoudigd prototype-model, geen medisch advies.

Zie [DESIGN.md](DESIGN.md) voor het volledige concept.
