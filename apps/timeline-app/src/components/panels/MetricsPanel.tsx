'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { METRIC_CATEGORIES } from '@/lib/constants';
import type { MetricsPanelProps, TimelineMetric } from '@/lib/types';

export default function MetricsPanel({ metrics, stage_id }: MetricsPanelProps) {
  // Group metrics by category
  const groupedMetrics = useMemo(() => {
    return metrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {} as Record<string, TimelineMetric[]>);
  }, [metrics]);

  const calculateProgress = (metric: TimelineMetric): number => {
    const start = parseFloat(String(metric.start_value).replace(/[^0-9.]/g, '')) || 0;
    const end = parseFloat(String(metric.end_value).replace(/[^0-9.]/g, '')) || 0;

    if (start === 0) return 100;
    return Math.round(((end - start) / start) * 100);
  };

  const getTrendIcon = (progress: number) => {
    if (progress > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (progress < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const renderMetricVisualization = (metric: TimelineMetric) => {
    const progress = calculateProgress(metric);

    switch (metric.visualization_type) {
      case 'bar':
        return (
          <div className="mt-2">
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-nwk-green rounded-full transition-all"
                style={{ width: `${Math.min(Math.abs(progress), 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-gray-600">
              <span>{metric.start_value}</span>
              <span className="font-semibold text-nwk-green">{metric.end_value}</span>
            </div>
          </div>
        );

      case 'number':
        return (
          <div className="flex items-center gap-4 mt-2">
            <div className="text-center">
              <div className="text-sm text-gray-600">Start</div>
              <div className="text-2xl font-bold text-gray-800">{metric.start_value}</div>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              →
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">End</div>
              <div className="text-3xl font-bold text-nwk-green">{metric.end_value}</div>
            </div>
            <div className="flex items-center gap-1">
              {getTrendIcon(progress)}
              <span className={`text-sm font-semibold ${
                progress > 0 ? 'text-green-600' : progress < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {progress > 0 ? '+' : ''}{progress}%
              </span>
            </div>
          </div>
        );

      case 'progress':
        const percentage = Math.min(100, Math.max(0, parseFloat(String(metric.end_value).replace(/[^0-9.]/g, '')) || 0));
        return (
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-semibold text-nwk-green">{percentage}%</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-nwk-green rounded-full transition-all flex items-center justify-end pr-2"
                style={{ width: `${percentage}%` }}
              >
                {percentage > 20 && (
                  <span className="text-xs text-white font-semibold">{percentage}%</span>
                )}
              </div>
            </div>
          </div>
        );

      case 'icon':
      default:
        return (
          <div className="flex items-center justify-between mt-2">
            <span className="text-4xl">{metric.icon}</span>
            <div className="text-right">
              <div className="text-3xl font-bold text-nwk-green">{metric.end_value}</div>
              {metric.start_value && metric.start_value !== metric.end_value && (
                <div className="text-sm text-gray-500">from {metric.start_value}</div>
              )}
            </div>
          </div>
        );
    }
  };

  if (metrics.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">📊</span>
        </div>
        <p className="text-gray-500">No metrics available for this stage yet</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Metrics & Outcomes
        </h3>
        <p className="text-sm text-gray-600">
          Measurable results and progress indicators for this stage
        </p>
      </div>

      {/* Metrics by Category */}
      <div className="space-y-8">
        {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => {
          const categoryConfig = METRIC_CATEGORIES[category as keyof typeof METRIC_CATEGORIES];

          return (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{categoryConfig.icon}</span>
                <h4 className="text-lg font-semibold" style={{ color: categoryConfig.color }}>
                  {category}
                </h4>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      {metric.icon && (
                        <span className="text-xl" role="img" aria-label="metric icon">
                          {metric.icon}
                        </span>
                      )}
                      <h5 className="font-semibold text-gray-900 flex-1">{metric.label}</h5>
                    </div>

                    {renderMetricVisualization(metric)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <div className="mt-8 p-6 bg-nwk-light rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-4">Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => {
            const categoryConfig = METRIC_CATEGORIES[category as keyof typeof METRIC_CATEGORIES];
            return (
              <div key={category} className="text-center">
                <div className="text-3xl mb-1">{categoryConfig.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{categoryMetrics.length}</div>
                <div className="text-sm text-gray-600">{category} Metrics</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export Option */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <button
          onClick={() => {
            // Create CSV data
            const csvHeader = 'Category,Label,Start Value,End Value,Change\n';
            const csvRows = metrics.map((m) => {
              const progress = calculateProgress(m);
              return `${m.category},"${m.label}",${m.start_value},${m.end_value},${progress}%`;
            }).join('\n');
            const csvContent = csvHeader + csvRows;

            // Download CSV
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `metrics-${stage_id}-${Date.now()}.csv`;
            a.click();
          }}
          className="text-sm text-nwk-green hover:underline"
        >
          Export metrics as CSV
        </button>
      </div>
    </div>
  );
}
