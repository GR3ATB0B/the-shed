import { useEffect } from 'react';
import gsap from 'gsap';
import Scene from './components/Scene';
import WorldScene from './components/WorldScene';
import { preloadInsideModel } from './components/InsideModel';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/ui/LoadingScreen';
import AccessibleContent from './components/ui/AccessibleContent';
import LiveAnnouncer from './components/ui/LiveAnnouncer';
import HUD from './components/ui/HUD';
import ViewSwitcher from './components/ui/ViewSwitcher';
import ClusterOverlay from './components/ui/ClusterOverlay';
import HoverLabel from './components/ui/HoverLabel';
import DeskSubNav from './components/ui/DeskSubNav';
import IntroOverlay from './components/ui/IntroOverlay';
import FadeOverlay from './components/ui/FadeOverlay';
import WelcomeBanner from './components/ui/WelcomeBanner';
import { useStore } from './store';
import { prefersReducedMotion } from './motion';
import './App.css';

// The fade-to-black *into* the shed is driven by WorldScene's dive timeline
// (same GSAP timeline as the camera, so the timing can't drift). Only the
// unfade after arrival lives here.
function useDiveUnFade() {
  const introPhase = useStore((s) => s.introPhase);
  const setFade = useStore((s) => s.setFade);
  useEffect(() => {
    if (introPhase !== 'inside') return;
    if (prefersReducedMotion()) {
      setFade(0);
      return;
    }
    const obj = { v: useStore.getState().fadeOpacity };
    const tween = gsap.to(obj, {
      v: 0,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => setFade(obj.v),
    });
    return () => tween.kill();
  }, [introPhase, setFade]);
}

export default function App() {
  const introPhase = useStore((s) => s.introPhase);
  const finishDive = useStore((s) => s.finishDive);
  const selectedCluster = useStore((s) => s.selectedCluster);

  useDiveUnFade();

  useEffect(() => {
    if (introPhase === 'diving' || introPhase === 'inside') {
      preloadInsideModel();
    }
  }, [introPhase]);

  const inIntro = introPhase === 'aerial' || introPhase === 'diving';

  return (
    <>
      <div className={`scene-wrapper ${selectedCluster ? 'blurred' : ''}`}>
        <ErrorBoundary>
          {inIntro ? <WorldScene onArrived={finishDive} /> : <Scene />}
        </ErrorBoundary>
      </div>
      <LoadingScreen />
      <AccessibleContent />
      <LiveAnnouncer />
      <FadeOverlay />
      <IntroOverlay />
      {introPhase === 'inside' && (
        <>
          <HUD />
          <ViewSwitcher />
          <DeskSubNav />
          <HoverLabel />
          <WelcomeBanner />
        </>
      )}
      <ClusterOverlay />
    </>
  );
}
