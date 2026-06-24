import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sunny from '../components/Sunny'
import { SKIN_TYPES, getLocation } from '../lib/uv'
import { sound } from '../lib/sound'

// Fitzpatrick-style quiz: scores nudge the picked skin type.
const QUIZ = [
  {
    q: 'Welke kleur heeft je haar van nature?',
    options: [
      { label: 'Rood / lichtblond', score: -2 },
      { label: 'Blond', score: -1 },
      { label: 'Bruin', score: 1 },
      { label: 'Donkerbruin / zwart', score: 2 },
    ],
  },
  {
    q: 'Wat gebeurt er als je zonder bescherming in de zon ligt?',
    options: [
      { label: 'Ik verbrand altijd, word nooit bruin', score: -2 },
      { label: 'Ik verbrand makkelijk', score: -1 },
      { label: 'Ik word bruin, soms een beetje rood', score: 1 },
      { label: 'Ik word snel bruin, verbrand nooit', score: 2 },
    ],
  },
  {
    q: 'Wat is de kleur van je ogen?',
    options: [
      { label: 'Lichtblauw / grijs', score: -2 },
      { label: 'Blauw / groen', score: -1 },
      { label: 'Bruin', score: 1 },
      { label: 'Donkerbruin', score: 2 },
    ],
  },
]

export default function Onboarding({ onDone }) {
  const [accepted, setAccepted] = useState(false)
  const [step, setStep] = useState(0)
  const [skinId, setSkinId] = useState(3)
  const [quizScore, setQuizScore] = useState(0)
  const [quizIdx, setQuizIdx] = useState(0)
  const [goal, setGoal] = useState('glow')
  const [locStatus, setLocStatus] = useState('idle')

  const next = () => {
    sound.swoosh()
    setStep((s) => s + 1)
  }
  const totalSteps = 6

  function answerQuiz(score) {
    sound.select()
    const newScore = quizScore + score
    if (quizIdx < QUIZ.length - 1) {
      setQuizScore(newScore)
      setQuizIdx((i) => i + 1)
    } else {
      // map total score (-6..6) to a refined skin type, blended with the picked tint
      const refined = Math.max(1, Math.min(6, Math.round(skinId + newScore / 3)))
      setSkinId(refined)
      setQuizScore(newScore)
      next()
    }
  }

  async function requestLocation() {
    setLocStatus('loading')
    try {
      await getLocation()
      setLocStatus('granted')
    } catch {
      setLocStatus('denied')
    }
    setTimeout(next, 600)
  }

  // disclaimer gate — must be accepted before onboarding
  if (!accepted) {
    return (
      <div className="h-full bg-sun-soft flex flex-col px-6 py-8">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="flex flex-col items-center text-center">
            <div className="text-6xl animate-float">🛡️</div>
            <h1 className="font-display text-2xl font-extrabold text-cocoa mt-4">Even belangrijk</h1>
            <p className="text-taupe text-sm mt-2 max-w-xs">
              Sunny helpt je bewuster en veiliger te zonnen, maar lees dit eerst:
            </p>
          </div>

          <div className="glass rounded-[2rem] p-5 mt-5 text-sm text-cocoa leading-relaxed flex flex-col gap-3">
            <p>
              ⚠️ <b>Geen medisch advies.</b> Sunny geeft een indicatieve schatting op basis van UV
              en huidtype, geen medische of dermatologische diagnose.
            </p>
            <p>🔆 Elke huid reageert anders. Gebruik altijd je eigen oordeel en stop bij twijfel.</p>
            <p>🧴 Bescherm je huid: gebruik zonnebrand (SPF 30+), drink genoeg en vermijd de felle middagzon.</p>
            <p>🩺 Twijfel je over je huid of een moedervlek? Raadpleeg een (huid)arts.</p>
            <p>👤 Niet bedoeld voor kinderen of mensen met een verhoogd huidrisico.</p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.swoosh()
            setAccepted(true)
          }}
          className="btn-primary w-full mt-5"
        >
          Ik begrijp het &amp; ga akkoord
        </button>
      </div>
    )
  }

  return (
    <div className="h-full bg-sun-soft flex flex-col">
      {/* progress dots */}
      <div className="flex gap-1.5 px-6 pt-6">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? 'bg-sun-action' : 'bg-white/70'
            }`}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
        <AnimatePresence mode="wait">
          {/* 0 — Welcome */}
          {step === 0 && (
            <Step key="welcome">
              <div className="flex flex-col items-center text-center mt-6">
                <Sunny mood="happy" size={140} />
                <h1 className="font-display text-3xl font-extrabold text-cocoa mt-6">
                  Hoi, ik ben Sunny!
                </h1>
                <p className="text-taupe mt-3 leading-relaxed max-w-xs">
                  Ik help je <b>veilig</b> bruin te worden — op basis van jouw huid en de
                  échte UV-index van vandaag. Klaar om te stralen? ✨
                </p>
              </div>
            </Step>
          )}

          {/* 1 — Skin tint pick */}
          {step === 1 && (
            <Step key="tint">
              <Header title="Kies je huidtint" sub="Welke past het best bij jou (onbruin)?" />
              <div className="grid grid-cols-3 gap-3 mt-6">
                {SKIN_TYPES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      sound.select()
                      setSkinId(s.id)
                    }}
                    className={`aspect-square rounded-3xl border-4 transition-all ${
                      skinId === s.id ? 'border-sun-action scale-105 shadow-soft' : 'border-white/60'
                    }`}
                    style={{ backgroundColor: s.tint }}
                  />
                ))}
              </div>
              <p className="text-center text-sm text-taupe mt-5">
                {SKIN_TYPES.find((s) => s.id === skinId).desc}
              </p>
            </Step>
          )}

          {/* 2 — Quiz */}
          {step === 2 && (
            <Step key="quiz">
              <Header
                title="Een paar snelle vragen"
                sub={`Vraag ${quizIdx + 1} van ${QUIZ.length}`}
              />
              <h2 className="font-display text-xl font-bold text-cocoa mt-6 mb-4">
                {QUIZ[quizIdx].q}
              </h2>
              <div className="flex flex-col gap-3">
                {QUIZ[quizIdx].options.map((o) => (
                  <button
                    key={o.label}
                    onClick={() => answerQuiz(o.score)}
                    className="text-left rounded-2xl bg-white/80 px-5 py-4 font-semibold text-cocoa
                      shadow-sm active:scale-[0.98] transition-transform border border-white"
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </Step>
          )}

          {/* 3 — Location */}
          {step === 3 && (
            <Step key="loc">
              <div className="flex flex-col items-center text-center mt-4">
                <div className="text-6xl animate-float">📍</div>
                <Header
                  title="Echte UV waar jij bent"
                  sub="Met je locatie haal ik de actuele UV-index op (gratis, niets wordt opgeslagen)."
                />
                {locStatus === 'denied' && (
                  <p className="text-sm text-sun-action mt-4 font-semibold">
                    Geen locatie — geen probleem, ik gebruik een schatting. Je kunt het later aanzetten.
                  </p>
                )}
                {locStatus === 'granted' && (
                  <p className="text-sm text-green-600 mt-4 font-semibold">Locatie gevonden! ✅</p>
                )}
              </div>
            </Step>
          )}

          {/* 4 — Goal */}
          {step === 4 && (
            <Step key="goal">
              <Header title="Wat is je doel?" sub="Zo stem ik je coaching op je af." />
              <div className="flex flex-col gap-3 mt-6">
                {[
                  { id: 'glow', icon: '🌞', t: 'Mooie glow', d: 'Rustig en gelijkmatig kleur krijgen' },
                  { id: 'base', icon: '🏖️', t: 'Base tan opbouwen', d: 'Voorbereiden op vakantie' },
                  { id: 'maintain', icon: '✨', t: 'Onderhouden', d: 'Mijn kleur vasthouden' },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => {
                      sound.select()
                      setGoal(g.id)
                    }}
                    className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-left border-2 transition-all ${
                      goal === g.id ? 'border-sun-action bg-white shadow-soft' : 'border-transparent bg-white/70'
                    }`}
                  >
                    <span className="text-3xl">{g.icon}</span>
                    <span>
                      <span className="block font-display font-bold text-cocoa">{g.t}</span>
                      <span className="block text-sm text-taupe">{g.d}</span>
                    </span>
                  </button>
                ))}
              </div>
            </Step>
          )}

          {/* 5 — Done */}
          {step === 5 && (
            <Step key="done">
              <div className="flex flex-col items-center text-center mt-8">
                <Sunny mood="wink" size={150} />
                <h1 className="font-display text-3xl font-extrabold text-cocoa mt-6">
                  Je bent helemaal klaar! 🎉
                </h1>
                <p className="text-taupe mt-3 max-w-xs">
                  Ik heb je huidprofiel ingesteld op <b>{SKIN_TYPES.find((s) => s.id === skinId).label}</b>.
                  Tijd om veilig te gaan stralen.
                </p>
              </div>
            </Step>
          )}
        </AnimatePresence>
      </div>

      {/* footer button (quiz advances on tap, so hide there) */}
      {step !== 2 && (
        <div className="px-6 pb-8">
          {step === 3 ? (
            locStatus === 'idle' || locStatus === 'loading' ? (
              <button
                onClick={requestLocation}
                disabled={locStatus === 'loading'}
                className="btn-primary w-full"
              >
                {locStatus === 'loading' ? 'Bezig…' : 'Locatie delen'}
              </button>
            ) : (
              <button onClick={next} className="btn-primary w-full">Verder</button>
            )
          ) : step === 5 ? (
            <button
              onClick={() => {
                sound.success()
                onDone({ skinId, goal })
              }}
              className="btn-primary w-full"
            >
              Start met Sunny
            </button>
          ) : (
            <button onClick={next} className="btn-primary w-full">Verder</button>
          )}
          {step === 3 && locStatus === 'idle' && (
            <button onClick={next} className="w-full text-center text-taupe text-sm mt-3 font-semibold">
              Sla over
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Step({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

function Header({ title, sub }) {
  return (
    <div className="text-center mt-2">
      <h1 className="font-display text-2xl font-extrabold text-cocoa">{title}</h1>
      {sub && <p className="text-taupe text-sm mt-2 max-w-xs mx-auto">{sub}</p>}
    </div>
  )
}
