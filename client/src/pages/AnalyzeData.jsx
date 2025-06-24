import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { FaChartLine, FaDownload, FaTable } from "react-icons/fa";
import ThreeDChart from "../components/ThreeDChart";
import jsPDF from "jspdf";

ChartJS.register(
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

function getRandomColors(count) {
  const palette = ["#f0c571", "#339999", "#e25759"]; // Gold, Teal, Red
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(palette[i % palette.length]);
  }
  return colors;
}

export default function AnalyzeData() {
  const [fileList, setFileList] = useState([]);
  const [filename, setFilename] = useState(localStorage.getItem("uploadedFilename") || "");
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [xKey, setXKey] = useState("");
  const [yKey, setYKey] = useState("");
  const [chartType, setChartType] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [downloadModal, setDownloadModal] = useState({ visible: false, target: null });
  const token = localStorage.getItem("token");

  const chartRefs = {
    Bar: useRef(),
    Line: useRef(),
    Pie: useRef(),
    ThreeD: useRef(),
    All: useRef(),
  };

  useEffect(() => {
    axios.get("http://localhost:5000/api/upload/list-filenames", {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res =>{ 
       setFileList(res.data);
       setFilename("") 
      })
      .catch(err => console.error(err));
  }, [token]);

  useEffect(() => {
    if (!filename) return;
    axios.get(`http://localhost:5000/api/upload/preview/${filename}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const rows = res.data;
      setData(rows);
      if (rows.length) {
        const keys = Object.keys(rows[0]);
        setHeaders(keys);
        setXKey("");
        setYKey("");
        setChartType("");
        setShowAll(false);
      }
    }).catch(err => console.error(err));
  }, [filename]);

  const cleanedData = useMemo(() => data.filter(row =>
    xKey && yKey && row[xKey] !== undefined && row[yKey] !== undefined && !isNaN(Number(row[yKey]))
  ), [data, xKey, yKey]);

  const colors = useMemo(() => getRandomColors(cleanedData.length), [filename, xKey, yKey]);

  const chartData = useMemo(() => ({
    labels: cleanedData.map(r => r[xKey]),
    datasets: [{
      label: yKey,
      data: cleanedData.map(r => Number(r[yKey])),
      backgroundColor: colors,
      borderRadius: 6,
    }],
  }), [cleanedData, colors, yKey]);

const captureAndDownload = async (ref, format = "pdf") => {
  if (!ref?.current) return;

  const elements = ref.current.querySelectorAll("canvas");

  if (format === "pdf") {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    let y = margin;

    for (const canvasEl of elements) {
      const imgData = canvasEl.toDataURL("image/png");
      const ratio = canvasEl.height / canvasEl.width;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = imgWidth * ratio;

      if (y + imgHeight > pdf.internal.pageSize.getHeight()) {
        pdf.addPage();
        y = margin;
      }

      pdf.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight);
      y += imgHeight + 10;
    }

    pdf.save("charts.pdf");
  } else {
    // ➤ Combine all canvases into one image and download as PNG
    const canvasList = Array.from(elements);
    if (canvasList.length === 0) return;

    // Total height = sum of all canvas heights + margin between them
    const spacing = 20;
    const totalHeight =
      canvasList.reduce((sum, c) => sum + c.height, 0) + spacing * (canvasList.length - 1);
    const maxWidth = Math.max(...canvasList.map((c) => c.width));

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = maxWidth;
    offscreenCanvas.height = totalHeight;
    const ctx = offscreenCanvas.getContext("2d");

    let yOffset = 0;
    for (const c of canvasList) {
      ctx.drawImage(c, 0, yOffset);
      yOffset += c.height + spacing;
    }

    offscreenCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = "charts.png";
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }
};


  const openDownloadModal = (ref) => {
    setDownloadModal({ visible: true, target: ref });
  };

  const renderChartElement = (type) => {
    const props = { data: chartData };
    const commonClass = "w-full h-full";
    if (!cleanedData.length) return <></>;
    switch (type) {
      case "Bar": return <div ref={chartRefs.Bar} className={commonClass}><Bar {...props} options={{ maintainAspectRatio: false }} /></div>;
      case "Line": return <div ref={chartRefs.Line} className={commonClass}><Line {...props} options={{ maintainAspectRatio: false }} /></div>;
      case "Pie": return <div ref={chartRefs.Pie} className={commonClass}><Pie {...props} options={{ maintainAspectRatio: false }} /></div>;
      case "3D": return <div ref={chartRefs.ThreeD} className={commonClass}><ThreeDChart data={cleanedData} xKey={xKey} yKey={yKey} /></div>;
      default: return null;
    }
  };

  const renderAllCharts = () => (
  <div className="grid md:grid-cols-2 gap-6">
    {/* Charts included in download */}
    <div ref={chartRefs.All} className="contents">
      {["Bar", "Line", "Pie"].map(type => (
        <div key={type} className="bg-white p-4 rounded-lg shadow-md border h-[400px] flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold text-gray-700 mb-2">{type} Chart</h3>
          <div className="flex-1">{renderChartElement(type)}</div>
        </div>
      ))}
    </div>

    {/* 3D Chart (not part of download) */}
    <div className="bg-white p-4 rounded-lg shadow-md border h-[400px] flex flex-col overflow-hidden">
      <h3 className="text-lg font-bold text-gray-700 mb-2">3D Chart</h3>
      <div className="flex-1">
        {renderChartElement("3D")}
      </div>
    </div>
  </div>
);

  const renderSingle = () => {
    if (!filename || !xKey || !yKey || !chartType || !cleanedData.length) return null;
    return (
      <div className="bg-white p-4 rounded-lg shadow-md border h-[400px] flex flex-col overflow-hidden">
        <h3 className="text-lg font-bold text-gray-700 mb-2">{chartType} Chart</h3>
        <div className="flex-1">{renderChartElement(chartType)}</div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen text-[1.05rem] overflow-y-auto">
      <Sidebar />
      <div className="flex-1 bg-gradient-to-br from-blue-100 to-green-100">
        <Topbar pageTitle="Analyze Data" />

        <div className="p-8">
          <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-6xl mx-auto border border-green-100">
            <div className="flex items-center gap-3 mb-8">
              <FaChartLine className="text-green-600 text-3xl" />
              <h2 className="text-3xl font-bold text-gray-800">Analyze Your Excel Data</h2>
            </div>

            <div className="grid sm:grid-cols-5 gap-6 mb-8">
              <div>
                <label className="block mb-2 text-gray-700 font-semibold">Select File</label>
                <select
                  value={filename}
                  onChange={e => {
                    setFilename(e.target.value);
                    localStorage.setItem("uploadedFilename", e.target.value);
                  }}
                  className="w-full border rounded px-4 py-2"
                >
                  <option value="">Select</option>
                  {fileList.map((f, i) => (
                   <option key={i} value={f.fileName}>
                   {f.originalName}
                  </option>
                 ))}
                </select>

              </div>
              <div>
                <label className="block mb-2 text-gray-700 font-semibold">X-Axis</label>
                <select value={xKey} onChange={e => setXKey(e.target.value)} className="w-full border rounded px-4 py-2">
                  <option value="">Select</option>
                  {headers.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-gray-700 font-semibold">Y-Axis</label>
                <select value={yKey} onChange={e => setYKey(e.target.value)} className="w-full border rounded px-4 py-2">
                  <option value="">Select</option>
                  {headers.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-gray-700 font-semibold">Chart Type</label>
                <select value={chartType} onChange={e => setChartType(e.target.value)} disabled={showAll} className="w-full border rounded px-4 py-2">
                  <option value="">Select</option>
                  <option>Bar</option><option>Line</option><option>Pie</option><option>3D</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mb-6 flex-wrap">
              <button onClick={() => setShowAll(!showAll)} className={`px-4 py-2 rounded text-white ${showAll ? "bg-gray-800" : "bg-gray-600"} hover:bg-gray-700`}>
                {showAll ? "Hide All Charts" : "Show All Charts"}
              </button>

              {(!showAll && chartType !== "3D") && (
                <button
                  onClick={() => openDownloadModal(chartRefs[chartType])}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaDownload /> Download {chartType}
                </button>
              )}

              {showAll && (
                <button
                  onClick={() => openDownloadModal(chartRefs.All)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaDownload /> Download All
                </button>
              )}

              <button
                onClick={() => setShowTable(true)}
                className="bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800 flex items-center gap-2"
              >
                <FaTable /> Show Table
              </button>
            </div>

            <div className="bg-gray-50 p-6 border-dashed border-2 border-gray-300 rounded-lg shadow-inner">
              {showAll ? renderAllCharts() : renderSingle()}
            </div>
          </div>
        </div>
      </div>

      {/* Download Modal */}
      {downloadModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Download As</h3>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  captureAndDownload(downloadModal.target, "pdf");
                  setDownloadModal({ visible: false, target: null });
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                PDF
              </button>
              <button
                onClick={() => {
                  captureAndDownload(downloadModal.target, "png");
                  setDownloadModal({ visible: false, target: null });
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                PNG
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTable && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-6">
          <div className="bg-white p-6 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto border shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Data Table</h3>
              <button onClick={() => setShowTable(false)} className="text-red-600 font-semibold text-sm">Close</button>
            </div>
            <table className="min-w-full text-sm border">
              <thead><tr><th className="border px-2">X</th><th className="border px-2">Y</th></tr></thead>
              <tbody>
                {cleanedData.map((r, i) => (
                  <tr key={i}>
                    <td className="border px-2">{r[xKey]}</td>
                    <td className="border px-2">{r[yKey]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
