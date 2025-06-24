import { useEffect, useState } from "react";
import { LogOut, UserCircle2 } from "lucide-react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function Topbar() {
  const [username, setUsername] = useState("User");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Dynamic title from current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes("/upload")) return "Upload Excel";
    if (path.includes("/analyze")) return "Analyze Data";
    if (path.includes("/history")) return "Upload History";
    if (path.includes("/settings")) return "Settings";
    return "Dashboard";
  };

  // ✅ Fetch username
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(res.data.name || "User");
      } catch (err) {
        console.error("Failed to fetch user info", err);
      }
    };
    fetchUser();
  }, [token]);

  // ✅ Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="flex items-center justify-between px-8 py-4">
      {/*  Dynamic Page Title */}
      <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>

      <div className="flex items-center gap-6 ml-auto">
        {/*  Stylish Profile Button */}
        <button
          onClick={() => navigate("/settings")}
          className="flex items-center gap-2 bg-white hover:bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1.5 rounded-full shadow-sm transition-all"
        >
          <UserCircle2 size={22} className="text-blue-600" />
          <span className="font-semibold">{username}</span>
        </button>

        {/*  Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 text-red-600 hover:text-red-800 transition font-semibold"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
