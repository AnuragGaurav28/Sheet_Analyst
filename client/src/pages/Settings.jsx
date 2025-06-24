import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { User, Brush, Lock, Trash2, Moon } from "lucide-react";

export default function Settings() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); 
  const [fontSize, setFontSize] = useState(() => localStorage.getItem("fontSize") || "medium");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "" });
  const token = localStorage.getItem("token");

  //  Fetch user name and email from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setName(res.data.name || "");
        setEmail(res.data.email || "");
      } catch (err) {
        console.error("Failed to fetch user info:", err);
      }
    };
    fetchUser();
  }, [token]);

  //  Apply font size
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("text-sm", "text-base", "text-lg");

    if (fontSize === "small") html.classList.add("text-sm");
    else if (fontSize === "large") html.classList.add("text-lg");
    else html.classList.add("text-base");
    localStorage.setItem("fontSize", fontSize);
  }, [fontSize]);

  //  Handle name update
  const handleUpdateName = async () => {
    try {
      await axios.patch("http://localhost:5000/api/auth/update-name", { name }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Name updated successfully");
    } catch (err) {
      alert("Failed to update name");
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/change-password", passwordForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Password updated");
      setShowPasswordModal(false);
      setPasswordForm({ current: "", new: "" });
    } catch (err) {
      alert("Failed to update password");
    }
  };

  //  Handle clearing upload history
  const handleClearHistory = async () => {
    try {
      await axios.delete("http://localhost:5000/api/upload/clear-history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Upload history cleared");
    } catch (err) {
      alert("Failed to clear upload history");
    }
  };

  //  Handle deleting account
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await axios.delete("http://localhost:5000/api/auth/delete-account", {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.removeItem("token");
      window.location.href = "/";
    } catch (err) {
      alert("Failed to delete account");
    }
  };

  //  Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen text-[1.05rem]">
      <Sidebar />
      <div className="flex-1 bg-gradient-to-br from-blue-100 to-green-100">
        <Topbar username={name || "User"} />
        <div className="px-10 py-8 space-y-6">

          {/* 👤 Profile Settings */}
          <section className="bg-white rounded-xl shadow-xl p-6 w-full">
            <div className="flex items-center gap-2 mb-4">
              <User className="text-purple-700" size={20} />
              <h2 className="text-xl font-bold text-gray-700">Profile Settings</h2>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
              />
              <input
                type="email"
                value={email}
                readOnly
                className="w-full border border-gray-200 rounded-md px-4 py-2 bg-gray-100 cursor-not-allowed"
              />
              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={handleUpdateName}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-md"
                >
                  Save Name
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-md"
                >
                  Change Password
                </button>
              </div>
            </div>
          </section>

          {/*  Style */}
          <section className="bg-white rounded-xl shadow-xl p-6 w-full">
            <div className="flex items-center gap-2 mb-4">
              <Brush className="text-pink-600" size={20} />
              <h2 className="text-xl font-bold text-gray-700">Style</h2>
            </div>

            {/* Font Size */}
            <div>
              <label className="text-gray-700 font-medium">Font Size</label>
              <div className="flex gap-6 mt-2 text-gray-800">
                {["small", "medium", "large"].map((size) => (
                  <label key={size}>
                    <input
                      type="radio"
                      value={size}
                      checked={fontSize === size}
                      onChange={(e) => setFontSize(e.target.value)}
                      className="mr-1"
                    />
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          </section>

          {/*  Data & Privacy */}
          <section className="bg-white rounded-xl shadow-xl p-6 w-full">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="text-yellow-600" size={20} />
              <h2 className="text-xl font-bold text-gray-700">Data & Privacy</h2>
            </div>
            <button
              onClick={handleClearHistory}
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
            >
              Clear Upload History
            </button>
          </section>

          {/*  Account Settings */}
          <section className="bg-white rounded-xl shadow-xl p-6 w-full">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="text-red-600" size={20} />
              <h2 className="text-xl font-bold text-gray-700">Account Settings</h2>
            </div>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
              >
                Delete My Account
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
              >
                Logout
              </button>
            </div>
          </section>
        </div>

        {/*  Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-2xl w-[90%] max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Change Password</h2>
              <input
                type="password"
                placeholder="Current Password"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                className="w-full border border-gray-300 mb-3 px-4 py-2 rounded-md"
              />
              <input
                type="password"
                placeholder="New Password"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                className="w-full border border-gray-300 mb-3 px-4 py-2 rounded-md"
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handlePasswordChange}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
