import { useEffect, useRef, useState } from "react";
import "./App.css";

type BreathingPhase = "Ready" | "Inhale" | "Hold" | "Exhale" | "Completed";

interface PhaseConfig {
  name: Exclude<BreathingPhase, "Ready" | "Completed">;
  duration: number;
  instruction: string;
}

const breathingPhases: PhaseConfig[] = [
  {
    name: "Inhale",
    duration: 4,
    instruction: "Breathe in slowly",
  },
  {
    name: "Hold",
    duration: 4,
    instruction: "Hold gently",
  },
  {
    name: "Exhale",
    duration: 6,
    instruction: "Release slowly",
  },
];

const totalCycles = 3;

function App() {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phase, setPhase] = useState<BreathingPhase>("Ready");
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isRunning, setIsRunning] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const timerRef = useRef<number | null>(null);

  const currentPhase = breathingPhases[phaseIndex];

  function speakInstruction(message: string): void {
    if (!voiceEnabled || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(message);
    speech.rate = 0.85;
    speech.pitch = 1;
    speech.volume = 0.9;

    window.speechSynthesis.speak(speech);
  }

  function startSession(): void {
    setPhaseIndex(0);
    setPhase("Inhale");
    setSecondsRemaining(breathingPhases[0].duration);
    setCurrentCycle(1);
    setIsRunning(true);
    speakInstruction("Inhale");
  }

  function pauseSession(): void {
    setIsRunning(false);
    window.speechSynthesis?.cancel();
  }

  function resumeSession(): void {
    setIsRunning(true);
    speakInstruction(phase);
  }

  function restartSession(): void {
    clearTimer();
    setPhaseIndex(0);
    setPhase("Ready");
    setSecondsRemaining(4);
    setCurrentCycle(1);
    setIsRunning(false);
    window.speechSynthesis?.cancel();
  }

  function clearTimer(): void {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function completeSession(): void {
    clearTimer();
    setPhase("Completed");
    setSecondsRemaining(0);
    setIsRunning(false);
    speakInstruction("Breathing session completed. Well done.");
  }

  function moveToNextPhase(): void {
    const nextPhaseIndex = phaseIndex + 1;

    if (nextPhaseIndex < breathingPhases.length) {
      const nextPhase = breathingPhases[nextPhaseIndex];

      setPhaseIndex(nextPhaseIndex);
      setPhase(nextPhase.name);
      setSecondsRemaining(nextPhase.duration);
      speakInstruction(nextPhase.name);

      return;
    }

    if (currentCycle < totalCycles) {
      setCurrentCycle((previousCycle) => previousCycle + 1);
      setPhaseIndex(0);
      setPhase("Inhale");
      setSecondsRemaining(breathingPhases[0].duration);
      speakInstruction("Inhale");

      return;
    }

    completeSession();
  }

  useEffect(() => {
    clearTimer();

    if (!isRunning || phase === "Ready" || phase === "Completed") {
      return;
    }

    timerRef.current = window.setInterval(() => {
      setSecondsRemaining((previousSeconds) => {
        if (previousSeconds <= 1) {
          window.setTimeout(moveToNextPhase, 0);
          return 0;
        }

        return previousSeconds - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, phase, phaseIndex, currentCycle]);

  const progress =
    phase === "Completed"
      ? 100
      : (((currentCycle - 1) * breathingPhases.length + phaseIndex) /
          (totalCycles * breathingPhases.length)) *
        100;

  return (
    <main className="app-shell">
      <section className="phone-frame">
        <header className="app-header">
          <div>
            <p className="brand-label">NeuraLife</p>
            <h1>Guided Breathing</h1>
          </div>

          <button
            className="voice-button"
            type="button"
            onClick={() => setVoiceEnabled((enabled) => !enabled)}
            aria-label="Toggle voice guidance"
          >
            {voiceEnabled ? "Voice On" : "Voice Off"}
          </button>
        </header>

        <section className="wellness-card">
          <p className="session-label">
            {phase === "Ready"
              ? "Relaxation Session"
              : phase === "Completed"
                ? "Session Complete"
                : `Cycle ${currentCycle} of ${totalCycles}`}
          </p>

          <div className={`breathing-visual phase-${phase.toLowerCase()}`}>
            <div className="outer-ring ring-one" />
            <div className="outer-ring ring-two" />

            <div className="breathing-circle">
              <span className="countdown">
                {phase === "Completed" ? "✓" : secondsRemaining}
              </span>
            </div>
          </div>

          <h2>{phase}</h2>

          <p className="instruction">
            {phase === "Ready"
              ? "Start when you feel comfortable."
              : phase === "Completed"
                ? "You have completed the breathing session."
                : currentPhase.instruction}
          </p>

          <div className="progress-area">
            <div className="progress-information">
              <span>Session progress</span>
              <span>{Math.round(progress)}%</span>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="controls">
            {phase === "Ready" && (
              <button
                className="primary-button"
                type="button"
                onClick={startSession}
              >
                Start Session
              </button>
            )}

            {phase !== "Ready" &&
              phase !== "Completed" &&
              (isRunning ? (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={pauseSession}
                >
                  Pause
                </button>
              ) : (
                <button
                  className="primary-button"
                  type="button"
                  onClick={resumeSession}
                >
                  Resume
                </button>
              ))}

            {phase !== "Ready" && (
              <button
                className="secondary-button"
                type="button"
                onClick={restartSession}
              >
                Restart
              </button>
            )}
          </div>
        </section>

        <section className="implementation-note">
          <strong>Proposed implementation</strong>
          <p>
            This proof of concept demonstrates the visual animation, breathing
            phases, countdown, session controls, progress feedback, and voice
            guidance proposed for the NeuraLife beta application.
          </p>
        </section>
      </section>
    </main>
  );
}

export default App;
