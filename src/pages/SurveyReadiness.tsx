import { useState } from 'react';
import {
  FileText,
  Award,
  Shield,
  Flame,
  AlertOctagon,
  GraduationCap,
  ClipboardList,
  Building,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import {
  PageHeader,
  CircularProgress,
} from '../components/ui/Widgets';
import { useSurveyReadiness } from '../hooks/useSurveyReadiness';
import clsx from 'clsx';

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  Award,
  Shield,
  Flame,
  AlertOctagon,
  GraduationCap,
  ClipboardList,
  Building,
};

export default function SurveyReadiness() {
  const { data: categories, isLoading } = useSurveyReadiness();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (name: string) => {
    const next = new Set(expandedCategories);
    if (next.has(name)) next.delete(name); else next.add(name);
    setExpandedCategories(next);
  };

  if (isLoading || !categories) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>;
  }

  const overallScore = Math.round(
    categories.reduce((s, c) => s + c.score, 0) / categories.length
  );

  const totalVulnerabilities = categories.reduce(
    (s, c) => s + c.vulnerabilities.length,
    0
  );

  const scoreColor =
    overallScore >= 90 ? '#10b981' : overallScore >= 80 ? '#3b82f6' : overallScore >= 70 ? '#f59e0b' : '#ef4444';

  // All vulnerabilities sorted by severity (lowest category score first)
  const allVulnerabilities = categories
    .filter((c) => c.vulnerabilities.length > 0)
    .sort((a, b) => a.score - b.score)
    .flatMap((cat) =>
      cat.vulnerabilities.map((v) => ({
        category: cat.name,
        categoryScore: cat.score,
        vulnerability: v,
      }))
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Survey Readiness"
        subtitle={`CMS survey compliance across ${categories.length} regulatory categories`}
      />

      {/* Overall Score — circular progress ring */}
      <div className="flex flex-col sm:flex-row items-center gap-6 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <CircularProgress value={overallScore} size={140} color={scoreColor} />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Overall Survey Readiness</h2>
          <p className="text-sm text-gray-500 mt-1">
            {totalVulnerabilities} vulnerabilities identified across {categories.length} categories
          </p>
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-600">
                {categories.filter((c) => c.score >= 90).length}
              </div>
              <div className="text-xs text-gray-500">Strong</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-amber-600">
                {categories.filter((c) => c.score >= 75 && c.score < 90).length}
              </div>
              <div className="text-xs text-gray-500">Moderate</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {categories.filter((c) => c.score < 75).length}
              </div>
              <div className="text-xs text-gray-500">At Risk</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Cards — EXPANDABLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || FileText;
          const isExpanded = expandedCategories.has(cat.name);
          const borderColor =
            cat.score >= 90 ? 'border-emerald-200' :
            cat.score >= 80 ? 'border-blue-200' :
            cat.score >= 75 ? 'border-amber-200' :
            'border-red-200';
          const scoreStyle =
            cat.score >= 90 ? 'text-emerald-600' :
            cat.score >= 80 ? 'text-blue-600' :
            cat.score >= 75 ? 'text-amber-600' :
            'text-red-600';
          const barColor =
            cat.score >= 90 ? 'bg-emerald-500' :
            cat.score >= 80 ? 'bg-blue-500' :
            cat.score >= 75 ? 'bg-amber-500' :
            'bg-red-500';

          return (
            <div key={cat.name} className={`bg-white rounded-xl shadow-sm border ${borderColor} overflow-hidden`}>
              {/* Collapsed: icon, name, score, progress bar */}
              <button
                onClick={() => toggleCategory(cat.name)}
                className="w-full text-left p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-900">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xl font-bold ${scoreStyle}`}>{cat.score}%</span>
                    <ChevronDown className={clsx('w-4 h-4 text-gray-400 transition-transform', isExpanded && 'rotate-180')} />
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full ${barColor}`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {cat.items_compliant}/{cat.items_total} compliant &middot; {cat.vulnerabilities.length} issues
                </p>
              </button>

              {/* Expanded: breakdown + vulnerability list with F-tag references */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="font-bold text-gray-900 text-lg">{cat.items_compliant}</div>
                      <div className="text-gray-500">Compliant</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="font-bold text-gray-900 text-lg">{cat.items_total - cat.items_compliant}</div>
                      <div className="text-gray-500">Non-Compliant</div>
                    </div>
                  </div>
                  {cat.vulnerabilities.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Vulnerabilities</div>
                      <ul className="space-y-1.5">
                        {cat.vulnerabilities.map((v, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" />
                            {v}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Immediate Action Items — all vulnerabilities sorted by severity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Immediate Action Items</h3>
          <span className="text-xs text-gray-500">{totalVulnerabilities} total</span>
        </div>
        <div className="divide-y divide-gray-50">
          {allVulnerabilities.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-3">
              <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.categoryScore < 80 ? 'text-red-500' : 'text-amber-500'}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700">{item.vulnerability}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                    item.categoryScore < 80 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.category} ({item.categoryScore}%)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
