
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFileExcel,
  FaChartBar,
  FaHistory,
  FaCog,
} from "react-icons/fa";

export default function Sidebar() {
  const navItems = [
    { name: "Dashboard", icon: FaTachometerAlt, path: "/dashboard" },
    { name: "Upload Excel", icon: FaFileExcel, path: "/upload" },
    { name: "Analyze Data", icon: FaChartBar, path: "/analyze" },
    { name: "History", icon: FaHistory, path: "/history" },
    { name: "Settings", icon: FaCog, path: "/settings" },
  ];

  return (
    <aside className="w-64 bg-gradient-to-b from-green-600 to-green-500 text-white shadow-lg flex flex-col py-8">
      <h1 className="text-2xl font-extrabold tracking-wide text-center mb-10 px-4 whitespace-nowrap">
       📊 Sheet Analyst
         </h1>


      <nav className="flex-1 flex flex-col gap-3 px-4 text-[1.1rem] font-medium">
        {navItems.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                isActive ? "bg-white text-green-700 shadow-md" : "hover:bg-green-700/60"
              }`
            }
          >
            <Icon className="text-xl" />
            {name}
          </NavLink>
        ))}
      </nav>

      <footer className="text-xs text-center text-white/70 mt-auto px-4 pb-2">
        © {new Date().getFullYear()} Sheet Analyst
      </footer>
    </aside>
  );
}
