import { Routes, Route } from 'react-router-dom';
import { ModalProvider } from './components/ui/Widgets';
import Layout from './components/layout/Layout';
import { useAgentSimulation } from './hooks/useAgentSimulation';
import CommandCenter from './pages/CommandCenter';
import ExceptionQueue from './pages/ExceptionQueue';
import ClinicalCommand from './pages/ClinicalCommand';
import FacilityDetail from './pages/FacilityDetail';
import SurveyReadiness from './pages/SurveyReadiness';
import AgentWorkLedger from './pages/AgentWorkLedger';

function AppContent() {
  useAgentSimulation();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CommandCenter />} />
        <Route path="/exceptions" element={<ExceptionQueue />} />
        <Route path="/clinical" element={<ClinicalCommand />} />
        <Route path="/facility/:id" element={<FacilityDetail />} />
        <Route path="/survey" element={<SurveyReadiness />} />
        <Route path="/agents" element={<AgentWorkLedger />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <ModalProvider>
      <AppContent />
    </ModalProvider>
  );
}
