import { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Globe, Monitor, Smartphone, Tablet, Download, Calendar, ExternalLink } from 'lucide-react';
import {
  getAnalyticsSummary,
  getClickTrends,
  getGeographicData,
  getReferrerData,
  getDeviceData,
  getBrowserData,
  exportAnalytics
} from '../../../lib/analyticsService';
import { useToast } from '../../../contexts/ToastContext';

export default function AnalyticsDashboard({ shortlink, onBack }) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [geoData, setGeoData] = useState([]);
  const [referrerData, setReferrerData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [browserData, setBrowserData] = useState([]);
  const [dateRange, setDateRange] = useState(30);
  const { showToast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [shortlink, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const [summaryData, trendsData, geoDataResult, referrerDataResult, deviceDataResult, browserDataResult] = await Promise.all([
        getAnalyticsSummary(shortlink.$id),
        getClickTrends(shortlink.$id, dateRange),
        getGeographicData(shortlink.$id),
        getReferrerData(shortlink.$id),
        getDeviceData(shortlink.$id),
        getBrowserData(shortlink.$id)
      ]);

      setSummary(summaryData);
      setTrends(trendsData);
      setGeoData(geoDataResult);
      setReferrerData(referrerDataResult);
      setDeviceData(deviceDataResult);
      setBrowserData(browserDataResult);
    } catch (error) {
      console.error('Error loading analytics:', error);
      showToast('Failed to load analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportAnalytics(shortlink.$id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${shortlink.customPath}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Analytics exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      showToast('Failed to export analytics', 'error');
    }
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const maxTrendValue = Math.max(...trends.map(t => t.clicks), 1);

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: '#2596be' }}></div>
          <p className="text-gray-600 mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Shortlinks
          </button>
          <h1 className="text-3xl font-bold" style={{ color: '#2596be' }}>
            Analytics: /{shortlink.customPath}
          </h1>
          <p className="text-gray-600 mt-1 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            {shortlink.destinationUrl}
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
            style={{ borderColor: '#2596be' }}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#2596be' }}
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Clicks</p>
              <p className="text-3xl font-bold mt-1" style={{ color: '#2596be' }}>
                {summary?.totalClicks || 0}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-gray-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Unique Visitors</p>
              <p className="text-3xl font-bold mt-1" style={{ color: '#2596be' }}>
                {summary?.uniqueVisitors || 0}
              </p>
            </div>
            <Globe className="w-12 h-12 text-gray-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg. Clicks/Day</p>
              <p className="text-3xl font-bold mt-1" style={{ color: '#2596be' }}>
                {summary?.avgClicksPerDay?.toFixed(1) || 0}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-gray-300" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">First Click</p>
              <p className="text-lg font-bold mt-1" style={{ color: '#2596be' }}>
                {summary?.firstClick ? new Date(summary.firstClick).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <TrendingUp className="w-12 h-12 text-gray-300" />
          </div>
        </div>
      </div>

      {/* Click Trends Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#2596be' }}>
          Click Trends
        </h2>
        
        {trends.length > 0 ? (
          <div className="space-y-2">
            {trends.map((trend, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-24 text-sm text-gray-600">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="h-full rounded-full flex items-center justify-end pr-2 text-white text-sm font-medium transition-all duration-300"
                      style={{
                        width: `${(trend.clicks / maxTrendValue) * 100}%`,
                        backgroundColor: '#2596be',
                        minWidth: trend.clicks > 0 ? '30px' : '0'
                      }}
                    >
                      {trend.clicks > 0 && trend.clicks}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {trend.clicks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No click data available</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Geographic Distribution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2596be' }}>
            Geographic Distribution
          </h2>
          
          {geoData.length > 0 ? (
            <div className="space-y-3">
              {geoData.slice(0, 10).map((geo, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium">{geo.countryName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${geo.percentage}%`,
                          backgroundColor: '#2596be'
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {geo.clicks} ({geo.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No geographic data available</p>
          )}
        </div>

        {/* Referrer Sources */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2596be' }}>
            Top Referrers
          </h2>
          
          {referrerData.length > 0 ? (
            <div className="space-y-3">
              {referrerData.slice(0, 10).map((ref, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <ExternalLink className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium truncate">{ref.referrer}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${ref.percentage}%`,
                          backgroundColor: '#2596be'
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {ref.clicks} ({ref.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No referrer data available</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Types */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2596be' }}>
            Device Types
          </h2>
          
          {deviceData.length > 0 ? (
            <div className="space-y-4">
              {deviceData.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(device.deviceType)}
                    <span className="text-sm font-medium capitalize">{device.deviceType}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${device.percentage}%`,
                          backgroundColor: '#2596be'
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {device.clicks} ({device.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No device data available</p>
          )}
        </div>

        {/* Browsers */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: '#2596be' }}>
            Top Browsers
          </h2>
          
          {browserData.length > 0 ? (
            <div className="space-y-3">
              {browserData.map((browser, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <Monitor className="w-5 h-5 text-gray-400" />
                    <span className="text-sm font-medium">{browser.browser}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${browser.percentage}%`,
                          backgroundColor: '#2596be'
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-16 text-right">
                      {browser.clicks} ({browser.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No browser data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

