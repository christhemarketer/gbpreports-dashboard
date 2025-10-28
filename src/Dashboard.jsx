import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Phone, MapPin, Eye, Star, LogOut, Bot, MessageSquare, Link as LinkIcon,
  Building, Globe, Download, AlertTriangle, BarChart2, CheckCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// ------------------------------------------------------------------------------------
// Helper: call Supabase Edge Functions with the Supabase JWT + Google provider token
// ------------------------------------------------------------------------------------
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;

async function callFunction(name, { method = 'GET', params = {}, session } = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = `${SUPABASE_URL}/functions/v1/${name}${qs ? `?${qs}` : ''}`;

  const jwt = session?.access_token || '';
  const providerToken = session?.provider_token || '';

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${jwt}`,
      'x-provider-token': providerToken,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`${name} failed: ${res.status} ${errText}`);
  }
  return res.json();
}

// ------------------------------------------------------------------------------------
// Small presentational components (unchanged UI)
// ------------------------------------------------------------------------------------
const StatCard = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm flex items-start space-x-4 hover:shadow-lg transition-shadow duration-300">
    <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const SearchViewsChart = ({ data }) => {
  const chartData = [
    { name: 'Discovery', value: data.discovery, color: '#3b82f6' },
    { name: 'Direct', value: data.direct, color: '#10b981' },
  ];
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {chartData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
        </Pie>
        <Tooltip />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-gray-900">
          {`${(data.discovery ?? 0) + (data.direct ?? 0)}%`}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length >= 2) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-bold text-gray-700">{label}</p>
        <p className="text-blue-600">{`Clicks: ${payload[0].value}`}</p>
        <p className="text-green-600">{`Views: ${payload[1].value}`}</p>
      </div>
    );
  }
  return null;
};

const PerformanceChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
      <defs>
        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
        </linearGradient>
      </defs>
      <XAxis dataKey="name" stroke="#6b7280" />
      <YAxis stroke="#6b7280" />
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
      <Tooltip content={<CustomTooltip />} />
      <Area type="monotone" dataKey="clicks" stroke="#3b82f6" fillOpacity={1} fill="url(#colorClicks)" />
      <Area type="monotone" dataKey="views" stroke="#10b981" fillOpacity={1} fill="url(#colorViews)" />
    </AreaChart>
  </ResponsiveContainer>
);

const KeywordTable = ({ keywords = [] }) => (
  <div className="flow-root">
    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Keyword</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Impressions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {keywords.map((item) => (
                <tr key={item.keyword}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.keyword}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <div className="flex justify-between items-center mb-2">
      <span className="font-semibold text-gray-800">{review.user}</span>
      <span className="flex items-center text-sm text-gray-600">
        <Star className="w-4 h-4 text-yellow-500 mr-1" /> {Number(review.rating).toFixed(1)}
      </span>
    </div>
    <p className="text-gray-700 text-sm mb-3 italic">"{review.text}"</p>
    {review.responded ? (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
        <CheckCircle className="w-4 h-4 mr-1" /> Responded
      </span>
    ) : (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        <MessageSquare className="w-4 h-4 mr-1" /> Needs Response
      </span>
    )}
  </div>
);

const Sidebar = ({ onSignOut }) => (
  <div className="w-64 bg-white shadow-md flex-shrink-0 flex flex-col p-4">
    <div className="flex items-center mb-8 p-3">
      <img
        src="https://gbprocket.com/wp-content/uploads/sites/2/2025/05/logo-blacktext-scaled.png"
        alt="GBP Rocket Logo"
        className="h-10 w-auto"
        onError={(e) => {
          e.currentTarget.src = "https://placehold.co/150x50/000000/FFFFFF?text=GBP+Rocket";
        }}
      />
    </div>
    <nav className="flex-grow">
      <a href="#" className="flex items-center px-4 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium">
        <BarChart2 className="w-5 h-5 mr-3" />
        Dashboard
      </a>
    </nav>
    <div className="mt-auto">
      <button onClick={onSignOut} className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
        <LogOut className="w-5 h-5 mr-3" />
        Logout
      </button>
    </div>
  </div>
);

const DashboardHeader = ({ onDownloadPDF, onLocationChange, locations, selectedLocation }) => (
  <header className="bg-white p-6 flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-gray-500">Client Dashboard</h1>
      <p className="text-3xl font-bold text-gray-900">Google Business Profile Overview</p>
    </div>
    <div className="flex items-center space-x-4">
      <select
        value={selectedLocation}
        onChange={(e) => onLocationChange(e.target.value)}
        className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
      >
        {locations.map((loc) => (
          <option key={loc.id || loc.name} value={loc.id || loc.name}>
            {loc.name || loc.title}
          </option>
        ))}
      </select>
      <button
        onClick={onDownloadPDF}
        className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Download className="w-4 h-4 mr-2" />
        Download PDF
      </button>
    </div>
  </header>
);

const BusinessInfo = ({ name, nap, type }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
    <h2 className="text-4xl font-bold text-gray-900 mb-3">{name}</h2>
    <div className="flex flex-wrap gap-x-8 gap-y-2 text-gray-600">
      <span className="flex items-center">
        <MapPin className="w-4 h-4 mr-2 text-blue-600" /> {nap?.address}
      </span>
      <span className="flex items-center">
        <Phone className="w-4 h-4 mr-2 text-blue-600" /> {nap?.phone}
      </span>
      <span className="flex items-center">
        {type === 'Location-Based' ? <Building className="w-4 h-4 mr-2 text-blue-600" /> : <Globe className="w-4 h-4 mr-2 text-blue-600" />}
        {type}
      </span>
    </div>
  </div>
);

// ------------------------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------------------------
export default function Dashboard({ session, onSignOut }) {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  // Initial load: accounts -> locations -> report
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        // 1) Get accounts
        const accounts = await callFunction('get-accounts', { session });
        const accountId = accounts?.[0]?.id || accounts?.[0]?.name;
        if (!accountId) throw new Error('No accounts found');

        // 2) Get locations
        const locs = await callFunction('get-locations', { session, params: { account: accountId } });
        setLocations(locs);

        // 3) First location report
        if (locs.length > 0) {
          const firstId = locs[0].id || locs[0].name;
          setSelectedLocation(firstId);
          const data = await callFunction('get-report', { session, params: { location: firstId } });
          setReportData(data);
        } else {
          setReportData(null);
        }
      } catch (e) {
        console.error(e);
        setReportData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [session]);

  // Change location
  const handleLocationChange = async (locationId) => {
    try {
      setLoading(true);
      setSelectedLocation(locationId);
      const data = await callFunction('get-report', { session, params: { location: locationId } });
      setReportData(data);
    } catch (e) {
      console.error(e);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    const business = reportData?.businessName?.replace(/\s+/g, '-') || 'dashboard';
    pdf.save(`gbp-report-${business}.pdf`);
  };

  if (loading && !reportData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-2xl font-medium text-gray-700">Loading Dashboard...</div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100 p-8">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600">We couldn't retrieve the report data. Please refresh or contact support.</p>
        </div>
      </div>
    );
  }

  const { metrics, performanceTrend, searchViews, keywords, reviews, aiSummary, businessName, nap, type } = reportData;

  return (
    <div className="flex h-screen bg-gray-100 font-inter">
      <Sidebar onSignOut={onSignOut} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader
          onDownloadPDF={handleDownloadPDF}
          onLocationChange={handleLocationChange}
          locations={locations}
          selectedLocation={selectedLocation}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6" ref={printRef}>
          <BusinessInfo name={businessName} nap={nap} type={type} />

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            {/* Stat Cards */}
            <StatCard icon={<Phone className="w-6 h-6" />} title="Calls" value={metrics?.calls ?? '-'} />
            <StatCard icon={<Globe className="w-6 h-6" />} title="Website Clicks" value={metrics?.websiteClicks ?? '-'} />
            <StatCard icon={<MapPin className="w-6 h-6" />} title="Direction Requests" value={metrics?.directionRequests ?? '-'} />
            <StatCard icon={<Eye className="w-6 h-6" />} title="Photo Views" value={metrics?.photoViews ?? '-'} />

            {/* Performance Trend */}
            <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
              {loading ? <div className="h-[300px] flex items-center justify-center text-gray-500">Loading chart...</div> : <PerformanceChart data={performanceTrend || []} />}
            </div>

            {/* Search Views */}
            <div className="bg-white p-6 rounded-2xl shadow-sm flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Views</h3>
              {loading
                ? <div className="h-[200px] flex items-center justify-center text-gray-500">Loading chart...</div>
                : <>
                    <SearchViewsChart data={searchViews || { discovery: 0, direct: 0 }} />
                    <div className="mt-4 flex flex-col space-y-2 text-sm">
                      <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Discovery: {searchViews?.discovery ?? 0}%</span>
                      <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Direct: {searchViews?.direct ?? 0}%</span>
                    </div>
                  </>
              }
            </div>

            {/* Keywords */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Trigger Keywords</h3>
              {loading ? <div className="h-[200px] flex items-center justify-center text-gray-500">Loading keywords...</div> : <KeywordTable keywords={keywords || []} />}
            </div>

            {/* Reviews */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews Overview</h3>
              {loading
                ? <div className="h-[200px] flex items-center justify-center text-gray-500">Loading reviews...</div>
                : <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Total Reviews</p>
                        <p className="text-3xl font-bold text-gray-900">{reviews?.totalCount ?? 0}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-500">Average Rating</p>
                        <p className="text-3xl font-bold text-gray-900 flex items-center justify-center">
                          <Star className="w-6 h-6 text-yellow-500 mr-1" /> {Number(reviews?.averageRating ?? 0).toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-800">Recent Reviews</h4>
                      {(reviews?.recent || []).map((r) => <ReviewCard key={r.id} review={r} />)}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Get More Reviews!</h4>
                      <p className="text-sm text-blue-700 mb-3">Share this link with your customers to get more feedback.</p>
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="w-4 h-4 text-blue-600" />
                        <a href="#" className="text-sm text-blue-600 font-medium hover:underline" onClick={(e) => e.preventDefault()}>
                          https://review.link/gbpreports
                        </a>
                      </div>
                      <img src="https://placehold.co/100x100/FFFFFF/000000?text=QR+Code" alt="QR Code for reviews" className="mt-3 rounded-md border border-gray-300" />
                      <p className="text-xs text-blue-600 mt-3">Reviews are a top factor for local ranking and customer trust. Always ask for feedback and respond to reviews promptly!</p>
                    </div>
                  </div>
              }
            </div>

            {/* AI Summary */}
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Bot className="w-5 h-5 mr-2 text-blue-600" />
                AI-Powered Performance Summary
              </h3>
              {loading
                ? <div className="h-[100px] flex items-center justify-center text-gray-500">Generating summary...</div>
                : <div className="bg-blue-50 p-5 rounded-lg border border-blue-200">
                    <p className="text-blue-800 whitespace-pre-line">{aiSummary}</p>
                  </div>
              }
            </div>
          </div>

          <footer className="text-center mt-8 py-4">
            <p className="text-sm text-gray-500">Thank you for trusting GBP Rocket with managing your GBP.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
