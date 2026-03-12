import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { X, Bot, ChevronDown, Check, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { AUDIT_TYPE_CONFIG, type AuditType } from '../../types/audit';

// ── Modal System ──

interface ModalContextType {
  openModal: (content: ReactNode, title?: string) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType>({
  openModal: () => {},
  closeModal: () => {},
});

export function useModal() {
  return useContext(ModalContext);
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<{ content: ReactNode; title?: string } | null>(null);

  const openModal = useCallback((content: ReactNode, title?: string) => {
    setModal({ content, title });
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (modal) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [modal]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{modal.title || 'Details'}</h2>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(85vh-4rem)] p-6">
              {modal.content}
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}

// ── Page Header ──

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ── Stat Card (with expandable variant) ──

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  color = 'blue',
  expandedContent,
}: {
  label: string;
  value: string | number;
  change?: string;
  icon?: React.ElementType;
  color?: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'gray';
  expandedContent?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const isExpandable = !!expandedContent;

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-xl shadow-sm border border-gray-100 card-hover-lift',
        isExpandable && 'cursor-pointer'
      )}
      onClick={isExpandable ? () => setExpanded(!expanded) : undefined}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500">{label}</span>
          <div className="flex items-center gap-1.5">
            {Icon && (
              <div className={`p-1.5 rounded-lg ${colorMap[color]}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            {isExpandable && (
              <ChevronDown className={clsx('w-4 h-4 text-gray-400 chevron-rotate', expanded && 'chevron-rotate-open')} />
            )}
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {change && (
          <p className={`text-xs mt-1 ${change.startsWith('+') || change.startsWith('\u2191') ? 'text-emerald-600' : change.startsWith('-') || change.startsWith('\u2193') ? 'text-red-600' : 'text-gray-500'}`}>
            {change}
          </p>
        )}
      </div>
      {isExpandable && (
        <div className={clsx('expand-collapse overflow-hidden border-t border-gray-100', expanded && 'expand-collapse-open')}>
          <div className="p-4">
            {expandedContent}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Card (with collapsible variant) ──

export function Card({
  children,
  className,
  title,
  actions,
  padding = true,
  collapsible = false,
  defaultCollapsed = false,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  actions?: ReactNode;
  padding?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-100', className)}>
      {title && (
        <div
          className={clsx(
            'flex items-center justify-between px-5 py-3 border-b border-gray-100',
            collapsible && 'cursor-pointer select-none'
          )}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          <div className="flex items-center gap-2">
            {collapsible && (
              <ChevronDown className={clsx('w-4 h-4 text-gray-400 chevron-rotate', !collapsed && 'chevron-rotate-open')} />
            )}
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          </div>
          {actions}
        </div>
      )}
      {collapsible ? (
        <div className={clsx('expand-collapse overflow-hidden', !collapsed && 'expand-collapse-open')}>
          <div className={padding ? 'p-5' : ''}>{children}</div>
        </div>
      ) : (
        <div className={padding ? 'p-5' : ''}>{children}</div>
      )}
    </div>
  );
}

// ── ExpandableCard — Core progressive disclosure component ──

export function ExpandableCard({
  title,
  metric,
  metricLabel,
  status,
  statusColor = 'gray',
  children,
  className,
  defaultExpanded = false,
}: {
  title: string;
  metric?: string | number;
  metricLabel?: string;
  status?: string;
  statusColor?: 'green' | 'amber' | 'red' | 'blue' | 'gray';
  children: ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const statusColors = {
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-100 card-hover-lift', className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{title}</div>
            {metricLabel && (
              <div className="text-xs text-gray-500 mt-0.5">{metricLabel}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {metric !== undefined && (
            <span className="text-lg font-bold text-gray-900">{metric}</span>
          )}
          {status && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[statusColor]}`}>
              {status}
            </span>
          )}
          <ChevronDown className={clsx('w-4 h-4 text-gray-400 chevron-rotate', expanded && 'chevron-rotate-open')} />
        </div>
      </button>
      <div className={clsx('expand-collapse overflow-hidden', expanded && 'expand-collapse-open')}>
        <div className="px-5 pb-4 border-t border-gray-100 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── ExpandableSection — Grouping expandable content with stagger animation ──

export function ExpandableSection({
  title,
  count,
  children,
  defaultExpanded = true,
}: {
  title: string;
  count?: number;
  children: ReactNode;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-1 py-2 text-left group"
      >
        <div className="flex items-center gap-2">
          <ChevronDown className={clsx('w-4 h-4 text-gray-400 chevron-rotate', expanded && 'chevron-rotate-open')} />
          <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{title}</span>
          {count !== undefined && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
              {count}
            </span>
          )}
        </div>
      </button>
      <div className={clsx('expand-collapse overflow-hidden', expanded && 'expand-collapse-open')}>
        <div className="stagger-fade-in space-y-2 mt-1">
          {children}
        </div>
      </div>
    </div>
  );
}

// ── QuickAction — One-tap action button for <10 second interactions ──

export function QuickAction({
  label,
  icon: Icon,
  onClick,
  variant = 'primary',
  className,
}: {
  label: string;
  icon?: React.ElementType;
  onClick?: () => Promise<void> | void;
  variant?: 'primary' | 'success' | 'danger' | 'secondary';
  className?: string;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleClick = async () => {
    if (state !== 'idle' || !onClick) return;
    setState('loading');
    try {
      await onClick();
      setState('success');
      setTimeout(() => setState('idle'), 1500);
    } catch {
      setState('idle');
    }
  };

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:scale-95',
  };

  return (
    <button
      onClick={handleClick}
      disabled={state !== 'idle'}
      className={clsx(
        'quick-action inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed',
        variantStyles[variant],
        className,
      )}
    >
      {state === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
      {state === 'success' && <Check className="w-4 h-4 success-checkmark" />}
      {state === 'idle' && Icon && <Icon className="w-4 h-4" />}
      {label}
    </button>
  );
}

// ── ApprovalCard — Exception approval workflow ──

export function ApprovalCard({
  severity,
  residentName,
  mrn,
  finding,
  auditType,
  aiRecommendation,
  evidenceChain,
  confidence,
  pccSyncStatus,
  onApprove,
  onDismiss,
  className,
}: {
  severity: 'low' | 'medium' | 'high' | 'critical';
  residentName: string;
  mrn: string;
  finding: string;
  auditType: AuditType;
  aiRecommendation: string;
  evidenceChain: string[];
  confidence: number;
  pccSyncStatus: string;
  onApprove?: () => Promise<void> | void;
  onDismiss?: () => Promise<void> | void;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const auditConfig = AUDIT_TYPE_CONFIG[auditType];

  const severityStyles = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  const syncStatusStyles: Record<string, string> = {
    pending: 'text-amber-600',
    syncing: 'text-blue-600',
    synced: 'text-emerald-600',
    failed: 'text-red-600',
  };

  return (
    <div className={clsx('bg-white rounded-xl shadow-sm border border-gray-100 card-hover-lift', className)}>
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${severityStyles[severity]}`}>
            {severity}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">{residentName}</div>
            <div className="text-xs text-gray-500">MRN: {mrn}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-gray-500 max-w-[200px] truncate hidden sm:block">{finding}</span>
          <ChevronDown className={clsx('w-4 h-4 text-gray-400 chevron-rotate', expanded && 'chevron-rotate-open')} />
        </div>
      </button>

      {/* Expanded content — AI recommendation, evidence, confidence */}
      <div className={clsx('expand-collapse overflow-hidden', expanded && 'expand-collapse-open')}>
        <div className="px-5 pb-4 border-t border-gray-100 pt-4 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Recommendation</span>
              {auditConfig && (
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${auditConfig.bgColor} ${auditConfig.color}`}>
                  {auditConfig.shortLabel}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700">{aiRecommendation}</p>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Evidence Chain</div>
            <ul className="space-y-1">
              {evidenceChain.map((item, i) => (
                <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confidence</div>
            <ConfidenceBar value={confidence} />
          </div>
        </div>
      </div>

      {/* Always-visible action footer — enables <10 sec approve flow */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
        <div className="flex items-center gap-2">
          <span className={clsx(
            'text-xs font-medium',
            syncStatusStyles[pccSyncStatus] || 'text-gray-500'
          )}>
            {pccSyncStatus === 'syncing' && (
              <Loader2 className="w-3 h-3 inline-block mr-1 animate-spin" />
            )}
            PCC: {pccSyncStatus}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <QuickAction label="Dismiss" variant="secondary" onClick={onDismiss} />
          <QuickAction label="Approve" variant="success" onClick={onApprove} />
        </div>
      </div>
    </div>
  );
}

// ── Priority Badge ──

export function PriorityBadge({ severity }: { severity: 'critical' | 'high' | 'medium' | 'low' | 'info' }) {
  const config = {
    critical: 'bg-red-100 text-red-700 border-red-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
    info: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config[severity]}`}>
      {severity}
    </span>
  );
}

// ── Status Badge ──

export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    syncing: 'bg-blue-100 text-blue-700',
    synced: 'bg-emerald-100 text-emerald-700',
    failed: 'bg-red-100 text-red-700',
    dismissed: 'bg-gray-100 text-gray-600',
    held: 'bg-purple-100 text-purple-700',
    open: 'bg-amber-100 text-amber-700',
    resolved: 'bg-emerald-100 text-emerald-700',
    compliant: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    critical: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config[status] || 'bg-gray-100 text-gray-600'}`}>
      {status === 'syncing' && (
        <svg className="animate-spin -ml-0.5 mr-1 h-3 w-3" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {status}
    </span>
  );
}

// ── Confidence Bar (with pulsing glow for >95%) ──

export function ConfidenceBar({ value, showLabel = true }: { value: number; showLabel?: boolean }) {
  const color =
    value >= 95 ? 'bg-emerald-500' : value >= 85 ? 'bg-blue-500' : value >= 75 ? 'bg-amber-500' : 'bg-red-500';
  const isHighConfidence = value >= 95;

  return (
    <div className="flex items-center gap-2">
      <div className={clsx('flex-1 h-2 bg-gray-100 rounded-full overflow-hidden', isHighConfidence && 'confidence-glow')}>
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
      </div>
      {showLabel && <span className="text-xs font-medium text-gray-600 w-8 text-right">{value}%</span>}
    </div>
  );
}

// ── Clickable Row ──

export function ClickableRow({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0',
        className
      )}
    >
      {children}
    </div>
  );
}

// ── Agent/Human Split Bar (with animated count-up on mount) ──

export function AgentHumanSplit({
  agentCount,
  humanCount,
  className,
}: {
  agentCount: number;
  humanCount: number;
  className?: string;
}) {
  const total = agentCount + humanCount;
  const agentPct = total > 0 ? (agentCount / total) * 100 : 0;

  const [displayAgent, setDisplayAgent] = useState(0);
  const [displayHuman, setDisplayHuman] = useState(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    const duration = 800;
    const steps = 30;
    const stepTime = duration / steps;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplayAgent(Math.round(agentCount * eased));
      setDisplayHuman(Math.round(humanCount * eased));
      if (step >= steps) clearInterval(interval);
    }, stepTime);

    return () => clearInterval(interval);
  }, [agentCount, humanCount]);

  return (
    <div className={clsx('bg-white rounded-xl p-4 shadow-sm border border-gray-100', className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm text-gray-600">
            Agent: <span className="font-semibold text-gray-900">{displayAgent.toLocaleString()}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-500" />
          <span className="text-sm text-gray-600">
            Human: <span className="font-semibold text-gray-900">{displayHuman.toLocaleString()}</span>
          </span>
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
        <div className="bg-blue-500 rounded-l-full transition-all" style={{ width: `${agentPct}%` }} />
        <div className="bg-purple-500 rounded-r-full transition-all" style={{ width: `${100 - agentPct}%` }} />
      </div>
      <div className="text-xs text-gray-500 mt-1 text-center">
        {agentPct.toFixed(0)}% automated — {(100 - agentPct).toFixed(0)}% human oversight
      </div>
    </div>
  );
}

// ── Action Button ──

export function ActionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'sm',
  disabled,
  loading,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md';
  disabled?: boolean;
  loading?: boolean;
}) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'text-gray-600 hover:bg-gray-100',
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size]
      )}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ── Agent Badge (uses AUDIT_TYPE_CONFIG for colors) ──

export function AgentBadge({ agent }: { agent: string }) {
  const config = AUDIT_TYPE_CONFIG[agent as AuditType];
  const colorClass = config
    ? `${config.bgColor} ${config.color} ${config.borderColor}`
    : 'bg-gray-100 text-gray-600 border-gray-200';
  const label = config ? `${config.shortLabel} Agent` : agent;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}>
      <Bot className="w-3 h-3" />
      {label}
    </span>
  );
}

// ── Progress Bar ──

export function ProgressBar({
  value,
  max = 100,
  color = 'blue',
  size = 'md',
}: {
  value: number;
  max?: number;
  color?: 'blue' | 'green' | 'red' | 'amber';
  size?: 'sm' | 'md';
}) {
  const pct = Math.min((value / max) * 100, 100);
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    red: 'bg-red-500',
    amber: 'bg-amber-500',
  };

  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${size === 'sm' ? 'h-1.5' : 'h-2.5'}`}>
      <div className={`${colors[color]} rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Section Label ──

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-900 mb-3">{children}</h3>
  );
}

// ── Circular Progress ──

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  color = '#3b82f6',
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900">{value}%</span>
        <span className="text-xs text-gray-500">Ready</span>
      </div>
    </div>
  );
}
