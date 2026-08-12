import { useState } from 'react';
import { useStore } from '../shared/store/useStore';
import { GridTab } from '../features/career/components/GridTab';
import { FinalsTab } from '../features/career/components/FinalsTab';
import { StatsTab } from '../features/career/components/StatsTab';
import { SeminarsTab } from '../features/career/components/SeminarsTab';
import { ElectivesTab } from '../features/career/components/ElectivesTab';
import { MapTab } from '../features/career/components/MapTab';
import { SubjectDetailModal } from '../features/career/components/SubjectDetailModal';

export function Career() {
  const [activeTab, setActiveTab] = useState('grid');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const profile = useStore((state) => state.profile);

  return (
    <div className="view-content fade-in" style={{ animation: 'fadeUp 0.3s ease' }}>
      <div style={{ padding: '0 0 1rem' }}>
        <div className="view-title" style={{ marginBottom: '0.25rem' }}>
          Plan de Carrera
        </div>
        <div className="view-sub">{profile?.career || 'Ingeniería en Informática — UTN'}</div>
      </div>

      <div className="career-tab-bar">
        {['grid', 'finals', 'stats', 'seminars', 'electives', 'map'].map((tab) => (
          <button
            key={tab}
            className={`career-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'grid'
              ? 'Plan'
              : tab === 'finals'
                ? 'Finales'
                : tab === 'stats'
                  ? 'Estadísticas'
                  : tab === 'seminars'
                    ? 'Seminarios'
                    : tab === 'electives'
                      ? 'Electivas'
                      : 'Mapa'}
          </button>
        ))}
      </div>

      <div className="career-tab-panel">
        {activeTab === 'grid' && <GridTab onSelectSubject={setSelectedSubjectId} />}
        {activeTab === 'finals' && <FinalsTab onSelectSubject={setSelectedSubjectId} />}
        {activeTab === 'stats' && <StatsTab />}
        {activeTab === 'seminars' && <SeminarsTab />}
        {activeTab === 'electives' && <ElectivesTab onSelectSubject={setSelectedSubjectId} />}
        {activeTab === 'map' && <MapTab onSelectSubject={setSelectedSubjectId} />}
      </div>

      {selectedSubjectId && (
        <SubjectDetailModal
          key={selectedSubjectId}
          subjectId={selectedSubjectId}
          onClose={() => setSelectedSubjectId(null)}
        />
      )}
    </div>
  );
}
