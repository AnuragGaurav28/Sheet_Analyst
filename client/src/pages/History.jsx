import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { FaDownload, FaTrash, FaFolder } from "react-icons/fa";

export default function UploadHistory() {
  const [files, setFiles] = useState([]);
  const token = localStorage.getItem("token");

  const fetchFiles = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/upload/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data);
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  const handleDownload = (filename) => {
    window.open(`http://localhost:5000/api/upload/download/${filename}?token=${token}`, "_blank");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/upload/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFiles(); // refresh list
    } catch (err) {
      alert("Failed to delete file");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="flex min-h-screen text-[1.05rem]">
      <Sidebar />
      <div className="flex-1 bg-gradient-to-br from-blue-100 to-green-100">
        <Topbar username="Gaurav" />

        <div className="p-8">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-3xl font-bold text-center text-gray-800 flex items-center justify-center gap-2 mb-6">
              <FaFolder className="text-green-600" />
              Uploaded File
            </h2>

            {files.length === 0 ? (
              <p className="text-center text-gray-500">No files uploaded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border border-gray-300">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="p-3 border-b">File Name</th>
                      <th className="p-3 border-b">Uploaded At</th>
                      <th className="p-3 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr key={file._id} className="hover:bg-green-50">
                        <td className="p-3 border-b">{file.originalName}</td>
                        <td className="p-3 border-b">
                          {new Date(file.uploadedAt).toLocaleString()}
                        </td>
                        <td className="p-3 border-b space-x-3">
                          <button
                            onClick={() => handleDownload(file.fileName)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow text-sm"
                          >
                            <FaDownload />
                          </button>
                          <button
                            onClick={() => handleDelete(file._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow text-sm"
                          >
                            <FaTrash />
                          </button>
                          <button
                             onClick={() => window.location.href = "/analyze"}
                            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow text-sm"
                          >
                            Analyze Again
                          </button>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
