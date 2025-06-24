import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import registerImage from "../assets/login-illustration.png"; // use the same image

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("User registered successfully!");
        navigate("/"); 
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      alert("Registration failed: " + err.message);
    }
  };

  const handleGoogleSignup = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  const handleGitHubSignup = () => {
    window.open("http://localhost:5000/auth/github", "_self");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 to-lime-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl flex flex-col md:flex-row max-w-5xl w-full overflow-hidden">
        {/* Left panel - Form */}
        <div className="md:w-1/2 p-8 sm:p-12">
          <h1 className="text-2xl font-bold text-black-600 mb-3 text-center">Welcome</h1>
          <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Already have an account?{" "}
            <Link to="/" className="text-green-600 font-medium hover:underline">
              Log In
            </Link>
          </p>

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="text-sm text-gray-600 block mb-1">Name</label>
              <input
                type="text"
                value={name}
                placeholder="Your name"
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                placeholder="you@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                placeholder="Enter 6 character or more"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md font-semibold hover:bg-green-700 transition"
            >
              SIGN UP
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-gray-400">or sign up with</div>
          <div className="flex space-x-4 justify-center mt-4">
            <button
              onClick={() => window.open("http://localhost:5000/api/auth/google", "_self")}
              className="flex items-center border px-4 py-2 rounded-md text-sm hover:bg-gray-100"
            >
              <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google" className="mr-2" />
              Google
            </button>
            <button
              onClick={() => window.open("http://localhost:5000/api/auth/github", "_self")}
              className="flex items-center border px-4 py-2 rounded-md text-sm hover:bg-gray-100"
            >
              <img src="https://img.icons8.com/ios-filled/16/000000/github.png" alt="GitHub" className="mr-2" />
              GitHub
            </button>
          </div>
        </div>

        {/* Right panel - Illustration */}
        <div className="hidden md:flex items-center justify-center md:w-1/2 bg-white p-6">
          <img src={registerImage} alt="Register illustration" className="w-3/4 h-auto" />
        </div>
      </div>
    </div>
  );
}
