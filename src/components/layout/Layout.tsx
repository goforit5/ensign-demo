import { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Activity,
  ClipboardCheck,
  Bot,
  Search,
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { facilities } from '../../data/facilities';
import { ALL_AUDIT_TYPES } from '../../types/audit';
import type { Facility } from '../../types/audit';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
}

const platformNav: NavItem[] = [
  { label: 'Command Center', path: '/', icon: LayoutDashboard },
  { label: 'Exception Queue', path: '/exceptions', icon: AlertTriangle },
  { label: 'Agent Work Ledger', path: '/agents', icon: Bot },
];

const clinicalNav: NavItem[] = [
  { label: 'Clinical Command', path: '/clinical', icon: Activity },
  { label: 'Survey Readiness', path: '/survey', icon: ClipboardCheck },
];

// Region display order
const REGION_ORDER = ['West', 'Southwest', 'Mountain', 'Northwest', 'Central', 'Southeast'];

function SidebarLink({ item }: { item: NavItem }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {item.label}
    </NavLink>
  );
}

function getStatusDotColor(status: Facility['overall_status']): string {
  switch (status) {
    case 'compliant': return 'bg-emerald-400';
    case 'warning': return 'bg-amber-400';
    case 'critical': return 'bg-red-400';
    case 'needs_attention': return 'bg-orange-400';
    default: return 'bg-gray-400';
  }
}

function RegionGroup({ region, regionFacilities }: { region: string; regionFacilities: Facility[] }) {
  const [expanded, setExpanded] = useState(true);
  const location = useLocation();

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full px-2 py-1 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
      >
        {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <span>{region}</span>
        <span className="ml-auto text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 font-medium">
          {regionFacilities.length}
        </span>
      </button>
      {expanded && (
        <div className="space-y-0.5 ml-1">
          {regionFacilities.map((f) => {
            const path = `/facility/${f.id}`;
            const isActive = location.pathname === path;
            return (
              <NavLink
                key={f.id}
                to={path}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getStatusDotColor(f.overall_status)}`} />
                <span className="truncate">{f.name.replace('Ensign ', '')}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FacilitiesSection() {
  const [expanded, setExpanded] = useState(true);

  // Group facilities by region, ordered by REGION_ORDER
  const regionGroups = useMemo(() => {
    const grouped = new Map<string, Facility[]>();
    for (const region of REGION_ORDER) {
      const regionFacilities = facilities.filter((f) => f.region === region);
      if (regionFacilities.length > 0) {
        grouped.set(region, regionFacilities);
      }
    }
    // Include any regions not in REGION_ORDER
    for (const f of facilities) {
      if (!REGION_ORDER.includes(f.region)) {
        const existing = grouped.get(f.region) || [];
        if (!existing.includes(f)) {
          existing.push(f);
          grouped.set(f.region, existing);
        }
      }
    }
    return grouped;
  }, []);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
      >
        <span>Facilities</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 font-medium normal-case">
            {facilities.length}
          </span>
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </div>
      </button>
      {expanded && (
        <div className="space-y-1 max-h-[40vh] overflow-y-auto">
          {Array.from(regionGroups.entries()).map(([region, regionFacilities]) => (
            <RegionGroup key={region} region={region} regionFacilities={regionFacilities} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const agentCount = ALL_AUDIT_TYPES.length;

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-200">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">E</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Ensign Clinical</div>
            <div className="text-xs text-gray-500">Audit Platform</div>
          </div>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Platform
          </div>
          <div className="space-y-0.5">
            {platformNav.map((item) => (
              <SidebarLink key={item.path} item={item} />
            ))}
          </div>
        </div>

        <div>
          <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Clinical
          </div>
          <div className="space-y-0.5">
            {clinicalNav.map((item) => (
              <SidebarLink key={item.path} item={item} />
            ))}
          </div>
        </div>

        <FacilitiesSection />
      </nav>

      {/* User */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
            B
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">Barry</div>
            <div className="text-xs text-gray-500">CEO</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#f5f5f7]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
        {sidebar}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50">
            <div className="absolute top-3 right-3">
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search residents, findings..."
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-emerald-700">{agentCount} Agents Active</span>
            </div>
            <button className="relative p-1.5 rounded-lg hover:bg-gray-100">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>

        {/* Demo footer */}
        <footer className="bg-yellow-50 border-t border-yellow-200 py-1.5 text-center flex-shrink-0">
          <span className="text-xs font-medium text-yellow-800">Demo Environment — All data is synthetic</span>
        </footer>
      </div>
    </div>
  );
}
