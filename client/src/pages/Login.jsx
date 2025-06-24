import { useState,useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import loginImage from "../assets/login-illustration.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); //  Track whether User or Admin is selected
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); 
  const navigate = useNavigate(); 

  useEffect(() => {
  setErrorMessage("");
}, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setErrorMessage(""); 
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      if (role === "admin" && !res.data.isAdmin) {
        setErrorMessage("Invalid login ID or password");
        return;
      }

      localStorage.setItem("token", res.data.token);

      //  Navigate to respective dashboard 
      if (res.data.isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setErrorMessage("Login failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleForgotPassword = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", {
        email: forgotEmail,
      });
      alert(res.data.message || "Reset link sent to your email.");
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-lime-200 p-4">
      <div className="bg-white shadow-2xl rounded-3xl w-full max-w-5xl flex flex-col md:flex-row overflow-hidden">
        
        <div className="md:w-1/2 p-8 sm:p-12">
          <h1 className="text-2xl font-bold mb-3 text-center text-black">
            {role === "admin" ? "Welcome Administrator" : "Welcome Back"}
          </h1>

          <h2 className="text-3xl font-bold text-gray-800 mb-1">Login</h2>

          {/* Sign Up link only for user role */}
          {role === "user" && (
            <p className="text-sm text-gray-500 mb-6">
              Don’t have an account yet?{" "}
              <Link to="/register" className="text-green-600 font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          )}

          {/* Button-style Role  */}
          <div className="mb-6 flex justify-center gap-4">
            <button
              type="button"
              onClick={() => setRole("user")}
              className={`px-4 py-2 rounded-full border font-semibold transition ${
                role === "user"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              User
            </button>
            <button
              type="button"
              onClick={() => setRole("admin")}
              className={`px-4 py-2 rounded-full border font-semibold transition ${
                role === "admin"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <label className="text-gray-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-green-600 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <input
                type="password"
                placeholder="Enter 6 character or more"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              LOGIN
            </button>
          </form>

          
          {errorMessage && (
            <div className="mt-4 text-center text-red-600 font-semibold">
              {errorMessage}
            </div>
          )}

          <div className="mt-6 text-center text-gray-400 text-sm">or login with</div>
          <div className="flex space-x-4 justify-center mt-4">
            <button
              onClick={() => window.location.href = "http://localhost:5000/api/auth/google"}
              className="flex items-center px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
            >
              <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" className="mr-2" />
              Google
            </button>

            <button
              onClick={() => window.location.href = "http://localhost:5000/api/auth/github"}
              className="flex items-center px-4 py-2 border rounded-md text-sm hover:bg-gray-100"
            >
              <img src="https://img.icons8.com/ios-glyphs/16/000000/github.png" alt="GitHub" className="mr-2" />
              GitHub
            </button>
          </div>
        </div>

        
        <div className="md:w-1/2 bg-white flex items-center justify-center p-6">
          <img src={loginImage} alt="Login illustration" className="max-w-full h-auto" />
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Reset Password</h3>
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-4 py-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleForgotPassword}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
