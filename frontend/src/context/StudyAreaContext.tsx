import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  type StudyAreaId,
  type StudyAreaConfig,
  STUDY_AREAS,
  DEFAULT_STUDY_AREA
} from '../config/studyAreas';
import type { DemoOfficerAlert } from '../types';

export const normalizeZoneId = (id: string): string => {
  if (!id) return id;
  const match = id.match(/zone[-_\s]?0?(\d+)/i);
  if (match) {
    const num = parseInt(match[1], 10);
    return `Zone ${num.toString().padStart(2, '0')}`;
  }
  return id;
};

interface StudyAreaContextValue {
  studyArea: StudyAreaId;
  config: StudyAreaConfig;
  setStudyArea: (id: StudyAreaId) => void;
  isLoadingStudyArea: boolean;
  selectedZoneId: string;
  setSelectedZoneId: (id: string) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  targetTab: string;
  setTargetTab: (tab: string) => void;
  demoScenario: DemoOfficerAlert | null;
  setDemoScenario: (scenario: DemoOfficerAlert | null) => void;
  handleZoneSelect: (zoneId: string, targetPage?: string, tab?: string) => void;
  navigate: (page: string) => void;
}

const StudyAreaContext = createContext<StudyAreaContextValue | null>(null);

export const StudyAreaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial study area from URL query parameter if present
  const getInitialArea = (): StudyAreaId => {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryArea = params.get('studyArea')?.toLowerCase();
      if (queryArea === 'udupi' || queryArea === 'mangaluru') {
        return queryArea;
      }
    } catch {
      // ignore
    }
    return DEFAULT_STUDY_AREA;
  };

  const [studyArea, setStudyAreaState] = useState<StudyAreaId>(getInitialArea);
  const [isLoadingStudyArea, setIsLoadingStudyArea] = useState<boolean>(false);
  const config = useMemo(() => STUDY_AREAS[studyArea] || STUDY_AREAS[DEFAULT_STUDY_AREA], [studyArea]);

  // Central shared navigation & zone selection state
  const [currentPage, setCurrentPageState] = useState<string>('overview');
  const [selectedZoneId, setSelectedZoneIdState] = useState<string>(config.defaultZoneId);
  const [targetTab, setTargetTab] = useState<string>('overview');
  const [demoScenario, setDemoScenario] = useState<DemoOfficerAlert | null>(null);

  // Sync state to URL without reloading page
  const updateUrlParam = (id: StudyAreaId) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('studyArea', id);
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  // Sync selectedZoneId whenever studyArea changes
  useEffect(() => {
    setSelectedZoneIdState(config.defaultZoneId);
  }, [config.defaultZoneId]);

  const setStudyArea = useCallback((id: StudyAreaId) => {
    if (id === studyArea) return;
    setIsLoadingStudyArea(true);
    setDemoScenario(null);
    updateUrlParam(id);
    setStudyAreaState(id);

    // Provide a brief, smooth non-blocking transition
    setTimeout(() => {
      setIsLoadingStudyArea(false);
    }, 400);
  }, [studyArea]);

  const setSelectedZoneId = useCallback((id: string) => {
    setSelectedZoneIdState(normalizeZoneId(id));
  }, []);

  const setCurrentPage = useCallback((page: string) => {
    setCurrentPageState(page);
  }, []);

  // Reusable central zone select handler
  const handleZoneSelect = useCallback((zoneId: string, targetPage: string = 'map', tab: string = 'overview') => {
    const normalized = normalizeZoneId(zoneId);
    setSelectedZoneIdState(normalized);
    setTargetTab(tab);
    setCurrentPageState(targetPage);
    try {
      window.history.pushState(
        { page: targetPage, zoneId: normalized, tab, studyArea },
        '',
        window.location.href
      );
    } catch {
      // ignore
    }
  }, [studyArea]);

  // Reusable navigate handler that records browser history
  const navigate = useCallback((page: string) => {
    setCurrentPageState(page);
    try {
      window.history.pushState(
        { page, zoneId: selectedZoneId, tab: targetTab, studyArea },
        '',
        window.location.href
      );
    } catch {
      // ignore
    }
  }, [selectedZoneId, targetTab, studyArea]);

  // Browser Back / Forward button support (popstate)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        if (event.state.page) setCurrentPageState(event.state.page);
        if (event.state.zoneId) setSelectedZoneIdState(event.state.zoneId);
        if (event.state.tab) setTargetTab(event.state.tab);
        if (event.state.studyArea && event.state.studyArea !== studyArea) {
          setStudyAreaState(event.state.studyArea);
        }
      } else {
        setCurrentPageState('overview');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [studyArea]);

  const value = useMemo(() => ({
    studyArea,
    config,
    setStudyArea,
    isLoadingStudyArea,
    selectedZoneId,
    setSelectedZoneId,
    currentPage,
    setCurrentPage,
    targetTab,
    setTargetTab,
    demoScenario,
    setDemoScenario,
    handleZoneSelect,
    navigate
  }), [
    studyArea,
    config,
    setStudyArea,
    isLoadingStudyArea,
    selectedZoneId,
    setSelectedZoneId,
    currentPage,
    setCurrentPage,
    targetTab,
    setTargetTab,
    demoScenario,
    setDemoScenario,
    handleZoneSelect,
    navigate
  ]);

  return (
    <StudyAreaContext.Provider value={value}>
      {children}
    </StudyAreaContext.Provider>
  );
};

export const useStudyArea = (): StudyAreaContextValue => {
  const context = useContext(StudyAreaContext);
  if (!context) {
    throw new Error('useStudyArea must be used within a StudyAreaProvider');
  }
  return context;
};
