import { create } from 'zustand';

export const VIEW_IDS = ['home', 'desk', 'floor', 'bookshelf'];

const hasEntered =
  typeof window !== 'undefined' &&
  localStorage.getItem('nash_entered') === 'true';

export const useStore = create((set, get) => ({
  introPhase: hasEntered ? 'inside' : 'aerial',
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
    set({ introPhase: 'aerial', welcomeDismissed: false, fadeOpacity: 0 });
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
  selectCluster: (id) => set({ selectedCluster: id }),
  deselectCluster: () => set({ selectedCluster: null }),
  setClusterMeshes: (meshes) => set({ clusterMeshes: meshes }),
  setAreaMeshes: (meshes) => set({ areaMeshes: meshes }),

  muted: false,
  toggleMute: () => set((s) => ({ muted: !s.muted })),
}));
