import { useEffect, useState } from "react";
import { LogOut, Users, FileText, ShieldCheck } from "lucide-react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, files: 0, admins: 0 });
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      const adminCount = res.data.filter((u) => u.isAdmin).length;
      setStats((prev) => ({ ...prev, users: res.data.length, admins: adminCount }));
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const fetchFiles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/files", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const parsedFiles = res.data.map((file) => ({
      ...file,
      uploadedAt: file.uploadedAt ? new Date(file.uploadedAt).toISOString() : null,
    }));
      setFiles(parsedFiles);
      setStats((prev) => ({ ...prev, files: res.data.length }));
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(); // refresh user list
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  const deleteFile = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/files/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFiles(); // refresh file list
    } catch (err) {
      alert("Failed to delete file.");
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchFiles();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-lime-100 p-6">
      {/* Topbar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-extrabold text-black-800">Admin Dashboard</h1>
        <button
          className="flex items-center gap-2 text-red-600 hover:text-red-700"
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/";
          }}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Welcome Panel */}
      <div className="bg-gradient-to-r from-green-100 to-lime-100 border border-green-300 p-6 rounded-2xl shadow mb-8">
        <h2 className="text-2xl font-bold text-green-800 mb-1">👋 Welcome, Admin!</h2>
        <p className="text-gray-700">
          You are managing <span className="font-semibold text-green-700">Sheet Analyst</span> — a platform where users upload and analyze Excel files.
          Your role is to oversee users, uploaded content, and maintain a smooth data workflow.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4 hover:shadow-lg transition">
          <Users className="text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-green-800">{stats.users}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4 hover:shadow-lg transition">
          <FileText className="text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Total Files</p>
            <p className="text-2xl font-bold text-green-800">{stats.files}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md flex items-center gap-4 hover:shadow-lg transition">
          <ShieldCheck className="text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Total Admins</p>
            <p className="text-2xl font-bold text-green-800">{stats.admins}</p>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">👥 All Users</h2>
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Name</th>
              <th className="pb-2">Email</th>
              <th className="pb-2">Role</th>
              <th className="pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t hover:bg-green-50 transition">
                <td className="py-2">{user.name || "Unknown"}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? "Admin" : "User"}</td>
                <td>
                  <button onClick={() => deleteUser(user._id)} className="text-red-600 hover:underline">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Files Table */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📂 Uploaded Files</h2>
        <table className="w-full text-sm text-gray-700">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">File Name</th>
              <th className="pb-2">Uploaded By</th>
              <th className="pb-2">Uploaded At</th>
              <th className="pb-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id} className="border-t hover:bg-lime-50 transition">
                <td className="py-2">{file.filename}</td>
                <td>{file.uploadedBy}</td>
               <td>
                  {file.uploadedAt && !isNaN(new Date(file.uploadedAt))
                    ? new Date(file.uploadedAt).toLocaleString()
                    : "Unknown"}
                </td>

                <td>
                  <button onClick={() => deleteFile(file.id)} className="text-red-600 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
