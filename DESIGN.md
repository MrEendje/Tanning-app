# ☀️ Sunny — Tan Coach App — Design Concept

> Veilig bruinen + persoonlijke tan-coach. Web-prototype (React + Tailwind).
> Warme zon-gradients, Duolingo-achtige gamification, Apple-achtige polish, met mascotte **Sunny**.

---

## 1. Concept in één zin
Een vrolijke coach die je op basis van je huidtype én de échte UV-index van vandaag
vertelt hoe lang je veilig kunt zonnen — en je met streaks, XP en badges motiveert
om elke dag veilig (en gelijkmatig) bruin te worden.

## 2. De mascotte — "Sunny"
Een vriendelijk, rond zonnetje met simpele ogen/lach. Verandert van gezicht en kleur
mee met het advies:
- 🟢 Rustige glimlach → veilig zonnen
- 🟡 Knipoog → smeren / opletten
- 🔴 Bezorgd + zonnebril → UV te hoog / bijna verbrand → schuilen!
Sunny geeft korte, aanmoedigende tekstjes ("Lekker bezig! Nog 12 min veilig 🌞").

## 3. Kleurenpalet — "Warme zon-gradients"

| Rol | Kleur | Hex |
|-----|-------|-----|
| Sunrise primair | perzik-oranje | `#FF9E5E` |
| Gradient start | warm geel | `#FFD06B` |
| Gradient eind | zonsondergang-roze | `#FF6F91` |
| Accent / actie | diep oranje | `#FF6B35` |
| Achtergrond | warme crème | `#FFF8F0` |
| Kaart / glas | wit 80% + blur | `rgba(255,255,255,.8)` |
| Tekst primair | warm donkerbruin | `#3A2A20` |
| Tekst zacht | taupe | `#9C8579` |

**Hoofd-gradient:** `linear-gradient(135deg, #FFD06B 0%, #FF9E5E 50%, #FF6F91 100%)`

**UV-index schaal (gauge-kleuren):**
`0–2` groen `#6BCB77` · `3–5` geel `#FFD93D` · `6–7` oranje `#FF9E5E` ·
`8–10` rood `#FF5E5E` · `11+` paars `#B05CFF`

## 4. Typografie
- Koppen: groot, rond, vet (bv. *Poppins* / *SF-achtig*) — Duolingo-energie.
- Body: schoon en leesbaar (system / Inter).
- Cijfers (UV, timers): extra groot en vet — het hero-element.

## 5. Schermflow

```
Onboarding ──► Home (Vandaag) ──► Sessie-coach
   │                │                  │
   │                ├──► Voortgang (stats)
   │                └──► Profiel (badges/level/huidprofiel)
```

### A. Onboarding (eenmalig)
1. **Welkom** — Sunny zwaait, korte pitch, "Laten we beginnen".
2. **Kies je huidtint** — visuele schaal van huidtinten (tik er één).
3. **Mini-quiz (Fitzpatrick)** — 3–4 vragen (haar, ogen, "verbrand je snel?") → huidtype I–VI.
4. **Locatie** — vraag toestemming voor echte UV-data (Open-Meteo, gratis, geen key).
5. **Doel** — bv. "base tan in 2 weken" / "veilig onderhouden". → klaar, confetti 🎉

### B. Home — "Vandaag" (hero-scherm)
- Grote **UV-gauge** (ring) met huidige UV-index + kleur.
- **"Veilig vandaag: 35 min"** — berekend uit huidtype × UV.
- Sunny-mascotte met advies van het moment.
- Mini weer/locatie + beste zon-moment vandaag.
- Streak-vlam 🔥 + XP-balk bovenin.
- Grote knop: **"Start zon-sessie"**.

### C. Sessie-coach (live)
- Live **timer / voortgangsring** richting je veilige limiet.
- Huidige UV + verstreken tijd.
- **Omdraai-reminder** (tikje + Sunny: "Draai om! 🔄") op intervallen.
- **Smeer-countdown** (elke ~2u opnieuw insmeren).
- **Schuil-waarschuwing** als je je limiet nadert (rood, trilling).
- Einde sessie → XP, eventueel badge, terug naar Home.

### D. Voortgang (stats)
- Grafieken: zontijd per dag/week, streak-historie, XP over tijd.
- Geen verplichte foto's (privacy-vriendelijk, jouw keuze).

### E. Profiel
- Level + XP, badges-galerij, actieve doelen/challenges.
- Huidprofiel (type I–VI) + instellingen.

## 6. Gamification (Duolingo-stijl)
- **XP & levels** voor elke veilige sessie en gehaald doel.
- **Badges/achievements**: 'Eerste sessie', '7-dagen streak', 'Altijd ingesmeerd', 'Gelijkmatig gebruind'.
- **Doelen & challenges**: persoonlijk tan-doel + wekelijkse challenge.
- (Streak-teller zichtbaar maar XP is de motor.)

## 7. Techniek (prototype)
- **React + Vite + Tailwind CSS** voor de web-app.
- **Framer Motion** voor micro-animaties (Sunny, ringen, confetti, transities).
- **Open-Meteo UV API** (gratis, geen API-key) + browser-geolocatie.
- LocalStorage voor profiel/streak/XP (geen backend nodig voor prototype).
- Mobiel-first layout (telefoon-formaat), later om te zetten naar native.

---

### ✅ Ter goedkeuring
Akkoord met dit concept (naam **Sunny**, palet, schermflow, tech)? Dan bouw ik als
eerste het **Home/"Vandaag"-scherm** volledig uit als showcase, daarna de rest.
Laat ook weten als je iets wil aanpassen (naam, kleuren, schermen).
