import { Routes, Route } from 'react-router-dom';
import { TabBar } from './components/navigation/TabBar';
import DashboardView from './pages/DashboardView';
import RunAuditsView from './pages/RunAuditsView';
import AuditDetail from './pages/AuditDetail';
import ActionItems from './pages/ActionItems';
import ReportsView from './pages/ReportsView';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold text-gray-900">Ensign Clinical Audit Platform</h1>
          </div>
        </div>
      </header>

      <TabBar />

      <Routes>
        <Route path="/" element={<DashboardView />} />
        <Route path="/run-audits" element={<RunAuditsView />} />
        <Route path="/audit/:auditId" element={<AuditDetail />} />
        <Route path="/action-items" element={<ActionItems />} />
        <Route path="/reports" element={<ReportsView />} />
      </Routes>

      <footer className="fixed bottom-0 left-0 right-0 bg-yellow-50 border-t border-yellow-200 py-2 text-center z-50">
        <span className="text-sm font-medium text-yellow-800">Demo Environment — All data is synthetic</span>
      </footer>
    </div>
  );
}

export default App;
