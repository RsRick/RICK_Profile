import { databases, ID, Query } from './appwrite';
import { UAParser } from 'ua-parser-js';
import { incrementClickCount } from './shortlinkService';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

/**
 * Hash IP address for privacy
 * @param {string} ip - IP address
 * @returns {Promise<string>} Hashed IP
 */
const hashIP = async (ip) => {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + 'shortlink-salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex.substring(0, 64);
  } catch (error) {
    console.error('Error hashing IP:', error);
    return 'unknown';
  }
};

/**
 * Get geolocation data from IP address
 * @param {string} ip - IP address
 * @returns {Promise<Object>} Geolocation data
 */
const getGeolocation = async (ip) => {
  try {
    // Skip for localhost/private IPs
    if (!ip || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: null,
        countryName: null,
        city: null
      };
    }
    
    // Use ipapi.co free API (no key required, 1000 requests/day)
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    
    if (!response.ok) {
      throw new Error('Geolocation API error');
    }
    
    const data = await response.json();
    
    return {
      country: data.country_code || null,
      countryName: data.country_name || null,
      city: data.city || null
    };
  } catch (error) {
    console.error('Error getting geolocation:', error);
    return {
      country: null,
      countryName: null,
      city: null
    };
  }
};

/**
 * Parse user agent string
 * @param {string} userAgent - User agent string
 * @returns {Object} Parsed user agent data
 */
const parseUserAgent = (userAgent) => {
  try {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    // Determine device type
    let deviceType = 'desktop';
    if (result.device.type === 'mobile') {
      deviceType = 'mobile';
    } else if (result.device.type === 'tablet') {
      deviceType = 'tablet';
    }
    
    return {
      deviceType,
      browser: result.browser.name || null,
      os: result.os.name || null
    };
  } catch (error) {
    console.error('Error parsing user agent:', error);
    return {
      deviceType: 'unknown',
      browser: null,
      os: null
    };
  }
};

/**
 * Get client IP address (best effort)
 * @returns {string} IP address or 'unknown'
 */
const getClientIP = () => {
  // In a real deployment, this would come from server-side
  // For now, we'll use a placeholder
  return 'client-ip';
};

/**
 * Record a click event for a shortlink
 * @param {string} shortlinkId - Shortlink ID
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<Object>} Created analytics record
 */
export const recordClick = async (shortlinkId, metadata = {}) => {
  try {
    const {
      referrer = document.referrer || null,
      userAgent = navigator.userAgent,
      customDomain = false,
      ipAddress = getClientIP()
    } = metadata;
    
    // Parse user agent
    const uaData = parseUserAgent(userAgent);
    
    // Get geolocation (async, don't wait for it)
    const geoPromise = getGeolocation(ipAddress);
    
    // Hash IP address
    const hashedIP = await hashIP(ipAddress);
    
    // Wait for geolocation
    const geoData = await geoPromise;
    
    // Create analytics record
    const analytics = await databases.createDocument(
      DATABASE_ID,
      'shortlink_analytics',
      ID.unique(),
      {
        shortlinkId,
        timestamp: new Date().toISOString(),
        ipAddress: hashedIP,
        country: geoData.country,
        countryName: geoData.countryName,
        city: geoData.city,
        referrer: referrer || null,
        userAgent,
        deviceType: uaData.deviceType,
        browser: uaData.browser,
        os: uaData.os,
        customDomain
      }
    );
    
    // Increment click count (async, don't wait)
    incrementClickCount(shortlinkId).catch(err => 
      console.error('Error incrementing click count:', err)
    );
    
    return analytics;
  } catch (error) {
    console.error('Error recording click:', error);
    throw error;
  }
};

/**
 * Get analytics summary for a shortlink
 * @param {string} shortlinkId - Shortlink ID
 * @returns {Promise<Object>} Analytics summary
 */
export const getAnalyticsSummary = async (shortlinkId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlink_analytics',
      [
        Query.equal('shortlinkId', shortlinkId),
        Query.limit(5000) // Get up to 5000 records
      ]
    );
    
    const clicks = response.documents;
    const totalClicks = clicks.length;
    
    // Calculate unique visitors (based on hashed IP)
    const uniqueIPs = new Set(clicks.map(c => c.ipAddress));
    const uniqueVisitors = uniqueIPs.size;
    
    // Get date range
    const dates = clicks.map(c => new Date(c.timestamp));
    const firstClick = dates.length > 0 ? new Date(Math.min(...dates)) : null;
    const lastClick = dates.length > 0 ? new Date(Math.max(...dates)) : null;
    
    return {
      totalClicks,
      uniqueVisitors,
      firstClick,
      lastClick,
      avgClicksPerDay: totalClicks > 0 && firstClick && lastClick
        ? totalClicks / Math.max(1, Math.ceil((lastClick - firstClick) / (1000 * 60 * 60 * 24)))
        : 0
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    throw error;
  }
};

/**
 * Get click trends over time
 * @param {string} shortlinkId - Shortlink ID
 * @param {number} days - Number of days to include
 * @returns {Promise<Array>} Click trends data
 */
export const getClickTrends = async (shortlinkId, days = 30) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlink_analytics',
      [
        Query.equal('shortlinkId', shortlinkId),
        Query.greaterThanEqual('timestamp', startDate.toISOString()),
        Query.orderDesc('timestamp'),
        Query.limit(5000)
      ]
    );
    
    // Group clicks by date
    const clicksByDate = {};
    response.documents.forEach(click => {
      const date = new Date(click.timestamp).toISOString().split('T')[0];
      clicksByDate[date] = (clicksByDate[date] || 0) + 1;
    });
    
    // Fill in missing dates with 0 clicks
    const trends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trends.push({
        date: dateStr,
        clicks: clicksByDate[dateStr] || 0
      });
    }
    
    return trends;
  } catch (error) {
    console.error('Error getting click trends:', error);
    throw error;
  }
};

/**
 * Get geographic distribution of clicks
 * @param {string} shortlinkId - Shortlink ID
 * @returns {Promise<Array>} Geographic data
 */
export const getGeographicData = async (shortlinkId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlink_analytics',
      [
        Query.equal('shortlinkId', shortlinkId),
        Query.limit(5000)
      ]
    );
    
    // Group by country
    const clicksByCountry = {};
    response.documents.forEach(click => {
      if (click.country) {
        const key = click.country;
        if (!clicksByCountry[key]) {
          clicksByCountry[key] = {
            country: click.country,
            countryName: click.countryName || click.country,
            clicks: 0
          };
        }
        clicksByCountry[key].clicks++;
      }
    });
    
    // Convert to array and sort by clicks
    const geoData = Object.values(clicksByCountry)
      .sort((a, b) => b.clicks - a.clicks);
    
    // Calculate percentages
    const totalClicks = response.documents.length;
    geoData.forEach(item => {
      item.percentage = totalClicks > 0 ? (item.clicks / totalClicks * 100).toFixed(1) : 0;
    });
    
    return geoData;
  } catch (error) {
    console.error('Error getting geographic data:', error);
    throw error;
  }
};

/**
 * Get referrer data
 * @param {string} shortlinkId - Shortlink ID
 * @returns {Promise<Array>} Referrer data
 */
export const getReferrerData = async (shortlinkId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlink_analytics',
      [
        Query.equal('shortlinkId', shortlinkId),
        Query.limit(5000)
      ]
    );
    
    // Group by referrer
    const clicksByReferrer = {};
    response.documents.forEach(click => {
      let referrer = 'Direct';
      if (click.referrer) {
        try {
          const url = new URL(click.referrer);
          referrer = url.hostname;
        } catch {
          referrer = click.referrer;
        }
      }
      
      clicksByReferrer[referrer] = (clicksByReferrer[referrer] || 0) + 1;
    });
    
    // Convert to array and sort by clicks
    const referrerData = Object.entries(clicksByReferrer)
      .map(([referrer, clicks]) => ({ referrer, clicks }))
      .sort((a, b) => b.clicks - a.clicks);
    
    // Calculate percentages
    const totalClicks = response.documents.length;
    referrerData.forEach(item => {
      item.percentage = totalClicks > 0 ? (item.clicks / totalClicks * 100).toFixed(1) : 0;
    });
    
    return referrerData;
  } catch (error) {
    console.error('Error getting referrer data:', error);
    throw error;
  }
};

/**
 * Get device type data
 * @param {string} shortlinkId - Shortlink ID
 * @returns {Promise<Array>} Device data
 */
export const getDeviceData = async (shortlinkId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlink_analytics',
      [
        Query.equal('shortlinkId', shortlinkId),
        Query.limit(5000)
      ]
    );
    
    // Group by device type
    const clicksByDevice = {};
    response.documents.forEach(click => {
      const device = click.deviceType || 'unknown';
      clicksByDevice[device] = (clicksByDevice[device] || 0) + 1;
    });
    
    // Convert to array and sort by clicks
    const deviceData = Object.entries(clicksByDevice)
      .map(([deviceType, clicks]) => ({ deviceType, clicks }))
      .sort((a, b) => b.clicks - a.clicks);
    
    // Calculate percentages
    const totalClicks = response.documents.length;
    deviceData.forEach(item => {
      item.percentage = totalClicks > 0 ? (item.clicks / totalClicks * 100).toFixed(1) : 0;
    });
    
    return deviceData;
  } catch (error) {
    console.error('Error getting device data:', error);
    throw error;
  }
};

/**
 * Get browser data
 * @param {string} shortlinkId - Shortlink ID
 * @returns {Promise<Array>} Browser data
 */
export const getBrowserData = async (shortlinkId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlink_analytics',
      [
        Query.equal('shortlinkId', shortlinkId),
        Query.limit(5000)
      ]
    );
    
    // Group by browser
    const clicksByBrowser = {};
    response.documents.forEach(click => {
      const browser = click.browser || 'Unknown';
      clicksByBrowser[browser] = (clicksByBrowser[browser] || 0) + 1;
    });
    
    // Convert to array and sort by clicks
    const browserData = Object.entries(clicksByBrowser)
      .map(([browser, clicks]) => ({ browser, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10); // Top 10 browsers
    
    // Calculate percentages
    const totalClicks = response.documents.length;
    browserData.forEach(item => {
      item.percentage = totalClicks > 0 ? (item.clicks / totalClicks * 100).toFixed(1) : 0;
    });
    
    return browserData;
  } catch (error) {
    console.error('Error getting browser data:', error);
    throw error;
  }
};

/**
 * Export analytics data to CSV
 * @param {string} shortlinkId - Shortlink ID
 * @returns {Promise<Blob>} CSV file blob
 */
export const exportAnalytics = async (shortlinkId) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      'shortlink_analytics',
      [
        Query.equal('shortlinkId', shortlinkId),
        Query.orderDesc('timestamp'),
        Query.limit(5000)
      ]
    );
    
    // Create CSV content
    const headers = ['Timestamp', 'Country', 'City', 'Device Type', 'Browser', 'OS', 'Referrer'];
    const rows = response.documents.map(click => [
      new Date(click.timestamp).toLocaleString(),
      click.countryName || '',
      click.city || '',
      click.deviceType || '',
      click.browser || '',
      click.os || '',
      click.referrer || 'Direct'
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    return blob;
  } catch (error) {
    console.error('Error exporting analytics:', error);
    throw error;
  }
};
