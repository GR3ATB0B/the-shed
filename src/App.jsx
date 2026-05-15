import { useEffect } from 'react';
import gsap from 'gsap';
import Scene from './components/Scene';
import WorldScene from './components/WorldScene';
import HUD from './components/ui/HUD';
import ViewSwitcher from './components/ui/ViewSwitcher';
import ClusterOverlay from './components/ui/ClusterOverlay';
import HoverLabel from './components/ui/HoverLabel';
import DeskSubNav from './components/ui/DeskSubNav';
import IntroOverlay from './components/ui/IntroOverlay';
import FadeOverlay from './components/ui/FadeOverlay';
import WelcomeBanner from './components/ui/WelcomeBanner';
import { useStore } from './store';
import './App.css';

function useDiveFade() {
  const introPhase = useStore((s) => s.introPhase);
  const setFade = useStore((s) => s.setFade);
  useEffect(() => {
    if (introPhase !== 'diving') return;
    const fadeStartDelay = 5.9;
    const obj = { v: 0 };
    const tween = gsap.to(obj, {
      v: 1,
      duration: 0.9,
      delay: fadeStartDelay,
      ease: 'power2.in',
      onUpdate: () => setFade(obj.v),
    });
    return () => tween.kill();
  }, [introPhase, setFade]);
}

function useDiveUnFade() {
  const introPhase = useStore((s) => s.introPhase);
  const setFade = useStore((s) => s.setFade);
  useEffect(() => {
    if (introPhase !== 'inside') return;
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

  useDiveFade();
  useDiveUnFade();

  const inIntro = introPhase === 'aerial' || introPhase === 'diving';

  return (
    <>
      <div className={`scene-wrapper ${selectedCluster ? 'blurred' : ''}`}>
        {inIntro ? <WorldScene onArrived={finishDive} /> : <Scene />}
      </div>
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
