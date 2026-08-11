import { useState } from 'react';
import { useStore } from '../store/useStore';
import { GridTab } from './career/GridTab';
import { FinalsTab } from './career/FinalsTab';
import { StatsTab } from './career/StatsTab';
import { SeminarsTab } from './career/SeminarsTab';
import { ElectivesTab } from './career/ElectivesTab';
import { MapTab } from './career/MapTab';
import { SubjectDetailModal } from '../components/career/SubjectDetailModal';

export function Career() {
  const [activeTab, setActiveTab] = useState('grid');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const profile = useStore(state => state.profile);

  return (
    <div className="view-content fade-in" style={{ animation: 'fadeUp 0.3s ease' }}>
      <div style={{ padding: '0 0 1rem' }}>
        <div className="view-title" style={{ marginBottom: '0.25rem' }}>Plan de Carrera</div>
        <div className="view-sub">{profile?.career || 'Ingeniería en Informática — UTN'}</div>
      </div>
      
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }} className="career-tabs-bar">
        {['grid', 'finals', 'stats', 'seminars', 'electives', 'map'].map(tab => (
          <button 
            key={tab}
            className={`career-tab ${activeTab === tab ? 'active' : ''}`} 
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'grid' ? 'Plan' :
             tab === 'finals' ? 'Finales' :
             tab === 'stats' ? 'Estadísticas' :
             tab === 'seminars' ? 'Seminarios' :
             tab === 'electives' ? 'Electivas' : 'Mapa'}
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
          subjectId={selectedSubjectId} 
          onClose={() => setSelectedSubjectId(null)} 
        />
      )}
    </div>
  );
}
