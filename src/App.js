// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
  Search, Phone, MapPin, Eye, Star, TrendingUp, LogOut, Bot,
  Link as LinkIcon, Building, Globe, Download, ChevronDown, BarChart2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from './supabaseClient'; // <- uses your env values

/***********************
 * AUTH HELPERS
 ***********************/
const handleLogin = async () => {
  // Use Google OAuth via Supabase and request GBP scope
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/business.manage',
      redirectTo: window.location.origin + '/auth/callback',
      queryParams: { access_type: 'offline', prompt: 'consent' }
    }
  });
};

const handleLogout = async () => {
  await supabase.auth.signOut();
  window.location.reload();
};

/***********************
 * MOCK API (placeholder for now)
 ***********************/
const mockApi = {
  getLocations: async () => {
    return [
      { id: '1', name: 'Main Street Auto Repair' },
      { id: '2', name: 'Downtown Cafe' },
      { id: '3', name: 'Lakeside Family Dentistry' },
    ];
  },
  getReportData: async (locationId) => {
    const baseData = {
      '1': {
        businessName: 'Main Street Auto Repair',
        nap: { address: '123 Main St, Anytown, USA 12345', phone: '555-0101' },
        businessType: 'Location-Based Business',
        profileHealth: 95,
        metrics: { calls: 188, clicks: 350, directions: 75, photoViews: 1250 },
        performanceTrend: [
          { name: 'Apr', Clicks: 320, Calls: 150, Directions: 60 },
          { name: 'May', Clicks: 310, Calls: 165, Directions: 65 },
          { name: 'Jun', Clicks: 340, Calls: 180, Directions: 70 },
          { name: 'Jul', Clicks: 350, Calls: 188, Directions: 75 },
        ],
        searchViews: { direct: 1200, discovery: 2800 },
        keywords: [
          { keyword: 'mechanic near me', count: 450 },
          { keyword: 'oil change Anytown', count: 320 },
          { keyword: 'brake repair', count: 210 },
          { keyword: 'car ac service', count: 150 },
          { keyword: 'best auto repair', count: 95 },
        ],
        reviews: {
          total: 124,
          average: 4.8,
          recent: [
            { id: 1, author: 'John D.', rating: 5, text: 'Great service, fast and reliable. Highly recommend!', responded: true },
            { id: 2, author: 'Jane S.', rating: 5, text: 'The team at Main Street Auto is fantastic. Honest and fair pricing.', responded: true },
            { id: 3, author: 'Mike W.', rating: 4, text: 'Good experience, but the waiting room could be cleaner.', responded: false },
          ]
        },
        aiSummary:
          "Your Google Business Profile is performing exceptionally well this month, with a significant increase in website clicks and a high profile health score. Search visibility is strong, especially for 'mechanic near me'. The primary area for improvement is responding to all customer reviews to maintain engagement."
      },
      '2': {
        businessName: 'Downtown Cafe',
        nap: { address: '456 Central Ave, Anytown, USA 12345', phone: '555-0102' },
        businessType: 'Location-Based Business',
        profileHealth: 88,
        metrics: { calls: 95, clicks: 520, directions: 180, photoViews: 3400 },
        performanceTrend: [
          { name: 'Apr', Clicks: 450, Calls: 80, Directions: 150 },
          { name: 'May', Clicks: 480, Calls: 85, Directions: 160 },
          { name: 'Jun', Clicks: 500, Calls: 90, Directions: 170 },
          { name: 'Jul', Clicks: 520, Calls: 95, Directions: 180 },
        ],
        searchViews: { direct: 900, discovery: 4100 },
        keywords: [
          { keyword: 'coffee shop near me', count: 850 },
          { keyword: 'best breakfast Anytown', count: 620 },
          { keyword: 'lunch spots downtown', count: 410 },
          { keyword: 'cafe with wifi', count: 350 },
          { keyword: 'espresso', count: 200 },
        ],
        reviews: {
          total: 258,
          average: 4.6,
          recent: [
            { id: 1, author: 'Emily R.', rating: 5, text: 'Love this place! The coffee is amazing and the atmosphere is so cozy.', responded: true },
            { id: 2, author: 'David L.', rating: 4, text: 'Great food, but service was a little slow during the lunch rush.', responded: false },
            { id: 3, author: 'Sarah B.', rating: 5, text: 'My go-to spot for meetings. The staff is always friendly!', responded: true },
          ]
        },
        aiSummary:
          'Performance is strong, driven by a high volume of discovery searches for coffee and breakfast. Website clicks are your strongest metric. While your review volume is high, ensuring timely responses to all feedback, especially constructive criticism, will help improve your average rating and customer loyalty.'
      },
      '3': {
        businessName: 'Lakeside Family Dentistry',
        nap: { address: '789 Lakeview Dr, Anytown, USA 12345', phone: '555-0103' },
        businessType: 'Service Area Business',
        profileHealth: 92,
        metrics: { calls: 250, clicks: 180, directions: 45, photoViews: 980 },
        performanceTrend: [
          { name: 'Apr', Clicks: 150, Calls: 220, Directions: 35 },
          { name: 'May', Clicks: 160, Calls: 230, Directions: 40 },
          { name: 'Jun', Clicks: 170, Calls: 240, Directions: 42 },
          { name: 'Jul', Clicks: 180, Calls: 250, Directions: 45 },
        ],
        searchViews: { direct: 1500, discovery: 1300 },
        keywords: [
          { keyword: 'dentist Anytown', count: 550 },
          { keyword: 'family dentist near me', count: 400 },
          { keyword: 'emergency dentist', count: 250 },
          { keyword: 'teeth whitening', count: 180 },
          { keyword: 'dental implants', count: 110 },
        ],
        reviews: {
          total: 95,
          average: 4.9,
          recent: [
            { id: 1, author: 'Tom H.', rating: 5, text: "Dr. Evans is the best. The entire staff makes you feel comfortable.", responded: true },
            { id: 2, author: 'Maria G.', rating: 5, text: "Painless and professional. I wouldn't go anywhere else.", responded: true },
            { id: 3, author: 'Chris P.', rating: 5, text: 'Very clean office and friendly front desk. A great experience.', responded: true },
          ]
        },
        aiSummary:
          "Your profile's strength is its ability to drive high-value actions, with phone calls being the top metric. Your high average review rating and profile health score build significant trust. Focus on continuing to solicit reviews and ensuring your service descriptions are up-to-date with the latest procedures you offer."
      },
    };

    return new Promise((resolve) => {
      setTimeout(() => resolve(baseData[locationId] || baseData['1']), 500);
    });
  },
};

/***********************
 * UI PARTS
 ***********************/
const StatCard = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm flex items-center space-x-4 hover:shadow-lg transition-shadow duration-300">
    <div className="bg-sky-100 text-sky-600 p-3 rounded-full">{icon}</div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const SearchViewsChart = ({ data }) => {
  const chartData = [
    { name: 'Direct', value: data.direct },
    { name: 'Discovery', value: data.discovery },
  ];
  const COLORS = ['#0ea5e9', '#6366f1'];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 h-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <BarChart2 className="w-5 h-5 mr-2 text-gray-400" />
        Search Views Breakdown
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-2xl font-bold fill-gray-700"
            >
              {((data.direct + data.discovery) / 1000).toFixed(1)}k
            </text>
            <text x="50%" y="50%" dy="20" textAnchor="middle" className="text-sm fill-gray-500">
              Total Searches
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center mt-4 space-x-4 text-sm">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-sky-500 mr-2"></span>Direct: {data.direct}
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>Discovery: {data.discovery}
        </div>
      </div>
    </div>
  );
};

/***********************
 * MAIN APP
 ***********************/
const App = () => {
  // Auth/session
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Dashboard state
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const reportRef = useRef(null);

  /******** Auth bootstrap ********/
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setAuthLoading(false);
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
    });
    return () => sub.subscription?.unsubscribe();
  }, []);

  /******** Load mock data while we wire live API ********/
  useEffect(() => {
    if (!session) return; // only load after login
    const fetchLocations = async () => {
      const locs = await mockApi.getLocations();
      setLocations(locs);
      if (locs.length > 0) setSelectedLocation(locs[0].id);
    };
    fetchLocations();
  }, [session]);

  useEffect(() => {
    if (!selectedLocation) return;
    const fetchReport = async () => {
      setLoading(true);
      const data = await mockApi.getReportData(selectedLocation);
      setReportData(data);
      setLoading(false);
    };
    fetchReport();
  }, [selectedLocation]);

  const handleDownloadPdf = () => {
    const input = reportRef.current;
    if (!input) return;

    html2canvas(input, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#f0f2f5'
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const locationName = reportData?.businessName.replace(/ /g, '_') || 'report';
      pdf.save(`${locationName}_GBP_Report.pdf`);
    });
  };

  const selectedLocationName =
    locations.find((l) => l.id === selectedLocation)?.name || 'Select a Location';

  /********** Renders **********/
  // While we check session
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <span className="text-gray-600">Checking sign-in…</span>
      </div>
    );
  }

  // Not signed in yet: show Google button
  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">GBP Reports</h1>
          <p className="text-gray-600 mb-6">Sign in with Google to view your dashboard.</p>
          <button
            onClick={handleLogin}
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white font-medium"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Signed-in loading state for dashboard data
  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex items-center space-x-2 text-gray-500">
          <svg
            className="animate-spin h-8 w-8 text-sky-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-xl">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  // Main dashboard (with mock data for now)
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <img
            src="https://gbprocket.com/wp-content/uploads/sites/2/2024/05/logo-blacktext-scaled.png"
            alt="GBP Rocket Logo"
            className="h-8 w-auto"
          />
        </div>
        <nav className="flex-1 px-4 py-4">
          <a href="#!" className="flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg">
            <BarChart2 className="w-5 h-5 mr-3" />
            Dashboard
          </a>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-400">Client Dashboard</h1>
            <p className="text-sm text-gray-500">Google Business Profile Overview</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-64 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                <span className="truncate">{selectedLocationName}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isDropdownOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-64 bg-white shadow-lg border rounded-md">
                  {locations.map((loc) => (
                    <a
                      key={loc.id}
                      href="#!"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedLocation(loc.id);
                        setIsDropdownOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {loc.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </header>

        <div className="space-y-8" ref={reportRef}>
          {reportData && (
            <>
              {/* Business Info Header */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h2 className="text-4xl font-bold text-gray-800 text-center">{reportData.businessName}</h2>
                <div className="flex justify-center items-center space-x-6 mt-4 text-gray-600 text-sm">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" /> {reportData.nap.address}
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" /> {reportData.nap.phone}
                  </div>
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2 text-gray-400" /> {reportData.businessType}
                  </div>
                </div>
              </div>

              {/* Core Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Phone className="w-6 h-6" />} title="Phone Calls" value={reportData.metrics.calls} />
                <StatCard icon={<Globe className="w-6 h-6" />} title="Website Clicks" value={reportData.metrics.clicks} />
                <StatCard
                  icon={<MapPin className="w-6 h-6" />}
                  title="Direction Requests"
                  value={reportData.metrics.directions}
                />
                <StatCard icon={<Eye className="w-6 h-6" />} title="Photo Views" value={reportData.metrics.photoViews} />
              </div>

              {/* Performance Trend and Keywords */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-gray-400" />
                    Performance Trend
                  </h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer>
                      <AreaChart data={reportData.performanceTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                        <YAxis stroke="#9ca3af" fontSize={12} />
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                          }}
                        />
                        <Area type="monotone" dataKey="Clicks" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorClicks)" />
                        <Area type="monotone" dataKey="Calls" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCalls)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Search className="w-5 h-5 mr-2 text-gray-400" />
                    Top Trigger Keywords
                  </h3>
                  <ul className="space-y-3">
                    {reportData.keywords.map((kw) => (
                      <li key={kw.keyword} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 truncate pr-4">{kw.keyword}</span>
                        <span className="font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">{kw.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Search Views and Reviews */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SearchViewsChart data={reportData.searchViews} />
                <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-gray-400" />
                    Reviews Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-3xl font-bold text-gray-800">{reportData.reviews.total}</p>
                      <p className="text-sm text-gray-500">Total Reviews</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-3xl font-bold text-gray-800 flex items-center justify-center">
                        {reportData.reviews.average} <Star className="w-5 h-5 text-yellow-400 ml-1" />
                      </p>
                      <p className="text-sm text-gray-500">Average Rating</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 text-sm mb-2">Recent Reviews</h4>
                    <ul className="space-y-3">
                      {reportData.reviews.recent.map((review) => (
                        <li key={review.id} className="text-sm bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-800">
                                {review.author} ({review.rating} ★)
                              </p>
                              <p className="text-gray-600 italic">"{review.text}"</p>
                            </div>
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                review.responded ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {review.responded ? 'Responded' : 'Needs Reply'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-700 text-sm">Get More Reviews</h4>
                      <p className="text-xs text-gray-500">
                        Share this QR code or shortlink with your customers to make it easy for them to leave a review.
                      </p>
                      <div className="mt-2 flex items-center space-x-2 bg-gray-100 px-2 py-1 rounded-md text-xs text-sky-600 font-mono">
                        <LinkIcon className="w-3 h-3" />
                        <span>https://g.page/r/your-business/review</span>
                      </div>
                    </div>
                    <div className="flex justify-center md:justify-end">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://g.page/r/your-business/review`}
                        alt="Review QR Code"
                        className="w-24 h-24 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow duration-300 border-l-4 border-sky-500">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-sky-500" />
                  AI-Powered Performance Summary
                </h3>
                <p className="text-gray-600 text-sm">{reportData.aiSummary}</p>
              </div>

              <footer className="text-center text-xs text-gray-500 pt-4">
                Thank you for trusting Megaphone Pro Solutions / GBP Rocket with managing your GBP.
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
