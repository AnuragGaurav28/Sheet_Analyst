import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar"; 
import { BarChart2, Clock } from "lucide-react";

export default function Dashboard() {
  const [uploadCount, setUploadCount] = useState(0);
  const [recentUploads, setRecentUploads] = useState([]);
  const [username, setUsername] = useState("User");
  const token = localStorage.getItem("token");

  // Fetch data on load
  useEffect(() => {
    const fetchUploadStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/upload/upload-stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUploadCount(res.data.count || 0);
      } catch (err) {
        console.error("Error fetching upload stats", err);
      }
    };

    const fetchRecentUploads = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/upload/recent-uploads", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentUploads(res.data || []);
      } catch (err) {
        console.error("Error fetching recent uploads", err);
      }
    };

    const fetchUsername = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(res.data.name || "User");
      } catch (err) {
        console.error("Failed to fetch username:", err);
      }
    };

    if (token) {
      fetchUploadStats();
      fetchRecentUploads();
      fetchUsername();
    }
  }, [token]);

  return (
    <div className="flex min-h-screen text-[1.05rem]">
      <Sidebar />
      <div className="flex-1 bg-gradient-to-br from-blue-100 to-green-100">
        <Topbar username={username} pageTitle="Dashboard" />

        {/* Welcome Message */}
        <div className="px-8">
          <div className="bg-white shadow-lg p-6 rounded-lg mb-6">
            <h2 className="text-3xl font-bold text-gray-700 mb-2">
              Welcome {username}!
            </h2>
            <p className="text-gray-600 text-lg">
              You're now inside{" "}
              <span className="font-semibold text-green-700">Sheet Analyst</span> — start uploading your spreadsheets and unlock insights with ease.
            </p>
          </div>

          {/* Upload Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between hover:shadow-lg transition min-h-[160px]">
              <div className="flex items-center gap-6">
                <div className="bg-green-100 p-5 rounded-full">
                  <BarChart2 className="text-green-700" size={36} />
                </div>
                <div>
                  <p className="text-lg text-gray-500 font-medium mb-1">Total Files Uploaded</p>
                  <p className="text-4xl font-bold text-green-800">{uploadCount}</p>
                </div>
              </div>
              <div className="hidden md:block">
                <svg viewBox="0 0 120 120" className="w-24 h-24">
                 <circle
                   cx="60"
                   cy="60"
                   r="50"
                   fill="none"
                   stroke="#e5e7eb"
                   strokeWidth="12"
                  />
                 <circle
                   cx="60"
                   cy="60"
                   r="50"
                   fill="none"
                   stroke="#22c55e"
                   strokeWidth="12"
                   strokeDasharray="314"
                   strokeDashoffset={`${314 - Math.min(uploadCount, 30) * (314 / 30)}`}
                   strokeLinecap="round"
                   transform="rotate(-90 60 60)"
                  />
                 <text
                   x="50%"
                   y="50%"
                   textAnchor="middle"
                   dominantBaseline="central"
                   className="text-2xl fill-green-800 font-semibold"
                  >
                   {Math.min(Math.round((uploadCount / 30) * 100), 100)}%
                  </text>
               </svg>  
              </div>
            </div>
            {/* Recent Uploads */}
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition min-h-[160px]">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-indigo-600" size={24} />
                <h3 className="text-xl font-semibold text-gray-800">Recent Uploads</h3>
              </div>
              <ul className="text-base text-gray-700 space-y-2 max-h-40 overflow-y-auto pr-2">
                {recentUploads.length === 0 ? (
                  <li className="italic text-gray-400">No recent uploads.</li>
                ) : (
                  recentUploads.map((file, i) => (
                    <li key={i} className="flex justify-between border-b pb-1">
                      <span className="font-medium">{file.filename}</span>
                      <span className="text-gray-500 text-sm">
                        {new Date(file.uploadedAt).toLocaleString()}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
