import { create } from 'zustand';

export const VIEW_IDS = ['home', 'desk', 'floor', 'bookshelf'];

const hasEntered =
  typeof window !== 'undefined' &&
  localStorage.getItem('nash_entered') === 'true';

export const useStore = create((set, get) => ({
  introPhase: hasEntered ? 'inside' : 'aerial',

  // Asset-load progress, mirrored from drei's useProgress by ProgressBridge
  // (which lives in the lazy 3D chunk). LoadingScreen reads it from here so
  // the entry bundle never has to import three/drei just for a progress bar.
  loadActive: false,
  loadProgress: 0,
  setLoadStatus: (active, progress) =>
    set((s) => ({
      loadActive: active,
      // Progress only ever moves forward — a second loader batch (e.g. the
      // inside model after the intro) reports from 0 again, which would make
      // the already-hidden bar flash backwards.
      loadProgress: Math.max(s.loadProgress, progress),
    })),
  welcomeDismissed: hasEntered,
  fadeOpacity: 0,

  startDive: () => {
    if (get().introPhase !== 'aerial') return;
    set({ introPhase: 'diving' });
  },

  finishDive: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nash_entered', 'true');
    }
    set({ introPhase: 'inside' });
  },

  setFade: (opacity) => set({ fadeOpacity: opacity }),

  skipIntro: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nash_entered', 'true');
    }
    set({ introPhase: 'inside', welcomeDismissed: true, fadeOpacity: 0 });
  },

  dismissWelcome: () => set({ welcomeDismissed: true }),
  resetIntro: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nash_entered');
    }
    // Reset the inside-scene state too, so re-entering after the replay
    // doesn't land on a stale view or a still-open overlay.
    set({
      introPhase: 'aerial',
      welcomeDismissed: false,
      fadeOpacity: 0,
      currentView: 'home',
      selectedCluster: null,
      hoveredCluster: null,
    });
  },

  currentView: 'home',
  setView: (id) => set({ currentView: id }),
  cycleView: (dir) =>
    set((s) => {
      const i = VIEW_IDS.indexOf(s.currentView);
      const next = (i + dir + VIEW_IDS.length) % VIEW_IDS.length;
      return { currentView: VIEW_IDS[next] };
    }),
  goHome: () => set({ currentView: 'home' }),

  hoveredCluster: null,
  selectedCluster: null,
  clusterMeshes: {},
  areaMeshes: { desk: [], floor: [], bookshelf: [] },
  setHovered: (id) => set({ hoveredCluster: id }),
  // Bumped when the user clicks set dressing / empty scene, so the UI can
  // flash a brief "just scenery" cue to contrast with the hover highlight.
  missClickCount: 0,
  flashMissClick: () => set((s) => ({ missClickCount: s.missClickCount + 1 })),
  selectCluster: (id) => set({ selectedCluster: id }),
  deselectCluster: () => set({ selectedCluster: null }),
  setClusterMeshes: (meshes) => set({ clusterMeshes: meshes }),
  setAreaMeshes: (meshes) => set({ areaMeshes: meshes }),
}));
