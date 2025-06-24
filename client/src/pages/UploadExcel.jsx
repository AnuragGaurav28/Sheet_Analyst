import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { FaCloudUploadAlt } from "react-icons/fa";

export default function UploadExcel() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setFile(e.dataTransfer.files[0]);
    setMessage("");
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return setMessage("Please select or drop a file first.");

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { filename } = res.data;

      //  Save for Analyze page
      localStorage.setItem("uploadedFilename", filename);
      setUploadedFileName(filename);

      setMessage(res.data.message);
      setFile(null);
    } catch (err) {
      setMessage("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleAnalyze = () => {
    navigate("/analyze");
  };

  return (
    <div className="flex min-h-screen text-[1.05rem]">
      <Sidebar />
      <div className="flex-1 bg-gradient-to-br from-blue-100 to-green-100">
        <Topbar username="Gaurav" />

        {/* Message Banner */}
        {message && (
          <div
            className={`p-4 text-white text-center font-semibold ${
              message.toLowerCase().includes("fail") ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {message}
          </div>
        )}

        <div className="p-8">
          <div className="bg-white rounded-xl shadow-xl w-4/5 max-w-3xl mx-auto p-10 flex flex-col items-center justify-center border border-green-200">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Upload Excel File
            </h2>

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("fileInput").click()}
              className="w-full max-w-2xl border-4 border-dashed border-green-400 bg-green-50 rounded-lg p-10 text-center cursor-pointer transition hover:bg-green-100 hover:shadow-md relative"
            >
              <FaCloudUploadAlt className="text-green-500 text-6xl mx-auto mb-3" />
              <p className="text-gray-600">
                Drag & drop your Excel file here <br />
                or <span className="text-green-700 font-semibold underline">click to select</span>
              </p>
              {file && <p className="mt-4 font-medium text-green-800">{file.name}</p>}
              <input
                id="fileInput"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Upload Button */}
            <form onSubmit={handleUpload} className="mt-8">
              <button
                type="submit"
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-lg font-semibold transition shadow-md disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>

            {/*  Analyze Button */}
            {uploadedFileName && (
              <button
                onClick={handleAnalyze}
                className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition"
              >
                Analyze File
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
