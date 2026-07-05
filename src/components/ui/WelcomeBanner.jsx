import { useState } from 'react';
import { useStore } from '../../store';

export default function WelcomeBanner() {
  const introPhase = useStore((s) => s.introPhase);
  const welcomeDismissed = useStore((s) => s.welcomeDismissed);
  const dismissWelcome = useStore((s) => s.dismissWelcome);
  const [step, setStep] = useState(0);

  if (introPhase !== 'inside' || welcomeDismissed) return null;

  const messages = [
    {
      title: 'Welcome to the shed.',
      body: 'Click around to explore.',
    },
    {
      title: 'Three places to look.',
      body: 'Desk · Floor · Bookshelf. Pick a chip below, or click anything on screen.',
    },
    {
      title: 'A few good places to start.',
      body: 'The corkboard for the latest. The brain for AI stuff. The coffee mug if you want to say hi.',
      cta: 'Got it',
    },
  ];

  const msg = messages[step];

  return (
    <>
      {/* Dim the scene while the banner is up — the 3D world behind it is
          not meant to be interacted with yet, and clicking through dismisses. */}
      <div
        className="welcome-banner__backdrop"
        onClick={dismissWelcome}
        title="Dismiss"
      />
      <div className="welcome-banner">
      <div className="welcome-banner__card">
        <div className="welcome-banner__kicker">welcome</div>
        <h2 className="welcome-banner__title">{msg.title}</h2>
        <p className="welcome-banner__body">{msg.body}</p>
        <div className="welcome-banner__row">
          {step < messages.length - 1 ? (
            <button
              className="welcome-banner__next"
              onClick={() => setStep((s) => s + 1)}
            >
              next →
            </button>
          ) : (
            <button
              className="welcome-banner__next welcome-banner__next--final"
              onClick={dismissWelcome}
            >
              {msg.cta || 'close'}
            </button>
          )}
          <button
            className="welcome-banner__skip"
            onClick={dismissWelcome}
            aria-label="Skip the welcome tour"
          >
            skip →
          </button>
        </div>
        <div className="welcome-banner__dots" aria-hidden="true">
          {messages.map((_, i) => (
            <span
              key={i}
              className={`welcome-banner__dot ${
                i === step ? 'welcome-banner__dot--active' : ''
              }`}
            />
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
