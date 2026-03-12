import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export type TabId = 'dashboard' | 'run-audits' | 'action-items' | 'reports';

interface Tab {
  id: TabId;
  label: string;
  path: string;
}

export interface TabBarProps {
  activeTab?: TabId;
  onTabChange?: (tabId: TabId) => void;
  className?: string;
}

const TABS: Tab[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/' },
  { id: 'run-audits', label: 'Run Audits', path: '/run-audits' },
  { id: 'action-items', label: 'Action Items', path: '/action-items' },
  { id: 'reports', label: 'Reports', path: '/reports' },
];

export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [, setFocusedIndex] = useState(0);

  const currentTab = activeTab || getCurrentTab(location.pathname);

  const handleTabClick = (tab: Tab, index: number) => {
    setFocusedIndex(index);
    if (onTabChange) onTabChange(tab.id);
    else navigate(tab.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    switch (e.key) {
      case 'ArrowLeft': e.preventDefault(); newIndex = index > 0 ? index - 1 : TABS.length - 1; break;
      case 'ArrowRight': e.preventDefault(); newIndex = index < TABS.length - 1 ? index + 1 : 0; break;
      default: return;
    }
    setFocusedIndex(newIndex);
    tabRefs.current[newIndex]?.focus();
  };

  useEffect(() => {
    const activeIndex = TABS.findIndex((tab) => tab.id === currentTab);
    if (activeIndex !== -1) setFocusedIndex(activeIndex);
  }, [currentTab]);

  return (
    <nav className={`border-b border-gray-200 bg-white ${className}`} role="tablist" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {TABS.map((tab, index) => {
            const isActive = tab.id === currentTab;
            return (
              <button key={tab.id} ref={(el) => { tabRefs.current[index] = el; }} role="tab" aria-selected={isActive} tabIndex={isActive ? 0 : -1}
                onClick={() => handleTabClick(tab, index)} onKeyDown={(e) => handleKeyDown(e, index)}
                className={`relative py-4 px-1 text-sm font-medium transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-sm ${isActive ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'}`}>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

function getCurrentTab(pathname: string): TabId {
  if (pathname === '/' || pathname === '') return 'dashboard';
  if (pathname.includes('/run-audits')) return 'run-audits';
  if (pathname.includes('/action-items')) return 'action-items';
  if (pathname.includes('/reports')) return 'reports';
  return 'dashboard';
}

export default TabBar;
