import React, { useState } from 'react';
import { StudyAreaProvider, useStudyArea } from './context/StudyAreaContext';
import { Layout } from './components/layout/Layout';
import { Overview } from './pages/Overview';
import { FloodRiskMap } from './pages/FloodRiskMap';
import { ZoneAnalysis } from './pages/ZoneAnalysis';
import { Timeline } from './pages/Timeline';
import { Infrastructure } from './pages/Infrastructure';
import { EmergencyResponse } from './pages/EmergencyResponse';
import { Alerts } from './pages/Alerts';
import { Reports } from './pages/Reports';

const AppContent: React.FC = () => {
  const {
    studyArea,
    config,
    isLoadingStudyArea,
    currentPage,
    selectedZoneId,
    targetTab,
    navigate,
    handleZoneSelect
  } = useStudyArea();
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleNavigateToZoneAnalysis = (zoneId?: string, initialTab?: string) => {
    handleZoneSelect(zoneId || selectedZoneId, 'zones', initialTab || 'overview');
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return (
          <Overview
            key={`${studyArea}-${refreshKey}`}
            onNavigateToZoneAnalysis={handleNavigateToZoneAnalysis}
            onNavigateToAlerts={() => navigate('alerts')}
          />
        );
      case 'map':
        return <FloodRiskMap key={`${studyArea}-${refreshKey}`} />;
      case 'zones':
        return (
          <ZoneAnalysis
            key={`${studyArea}-${selectedZoneId}-${targetTab}-${refreshKey}`}
            initialZoneId={selectedZoneId}
            initialTab={targetTab}
          />
        );
      case 'timeline':
        return <Timeline key={`${studyArea}-${refreshKey}`} />;
      case 'infrastructure':
        return <Infrastructure key={`${studyArea}-${refreshKey}`} />;
      case 'emergency':
        return <EmergencyResponse key={`${studyArea}-${refreshKey}`} />;
      case 'alerts':
        return <Alerts key={`${studyArea}-${refreshKey}`} />;
      case 'reports':
        return <Reports key={`${studyArea}-${refreshKey}`} />;
      default:
        return (
          <Overview
            key={`${studyArea}-${refreshKey}`}
            onNavigateToZoneAnalysis={handleNavigateToZoneAnalysis}
            onNavigateToAlerts={() => navigate('alerts')}
          />
        );
    }
  };

  return (
    <>
      {/* Non-blocking study-area transition toast */}
      {isLoadingStudyArea && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900/95 text-white border border-blue-500/60 backdrop-blur-md px-4 py-2 rounded-md shadow-2xl flex items-center gap-3 animate-fadeIn pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping" />
          <span className="font-mono text-xs font-bold tracking-wider uppercase text-blue-200">
            LOADING {config.name.toUpperCase()} FLOOD INTELLIGENCE...
          </span>
        </div>
      )}

      <Layout
        currentPage={currentPage}
        onNavigate={(page) => navigate(page)}
        onRefresh={handleRefresh}
      >
        {renderCurrentPage()}
      </Layout>
    </>
  );
};

export const App: React.FC = () => {
  return (
    <StudyAreaProvider>
      <AppContent />
    </StudyAreaProvider>
  );
};

export default App;
