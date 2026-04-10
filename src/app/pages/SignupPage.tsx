import { motion } from "motion/react";
import { Pill, Mail, Lock, ArrowRight, Github, User } from "lucide-react";
import { useNavigate } from "react-router";

export default function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-teal-100/40 via-slate-50 to-cyan-100/20" />
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-teal-400/10 blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-cyan-400/10 blur-[100px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="max-w-6xl w-full grid md:grid-cols-2 bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden relative z-10">
        
        {/* Left Side - Form */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative order-2 md:order-1">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-3 mb-10 cursor-pointer w-fit" onClick={() => navigate("/")}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-800 to-teal-700 tracking-tight">SmartMeds</span>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-500 mb-8">Join us to make informed healthcare decisions.</p>

            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); navigate("/dashboard"); }}>
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none text-slate-700 font-medium placeholder:font-normal placeholder:text-slate-400"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none text-slate-700 font-medium placeholder:font-normal placeholder:text-slate-400"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="password" 
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 transition-all outline-none text-slate-700 font-medium placeholder:font-normal placeholder:text-slate-400"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-all flex items-center justify-center gap-2 group"
              >
                Create Account
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-sm text-slate-400 font-medium">Or continue with</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button type="button" className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all font-semibold text-slate-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button type="button" className="flex items-center justify-center gap-3 py-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all font-semibold text-slate-700">
                <Github className="w-5 h-5 text-slate-900" />
                GitHub
              </button>
            </div>

            <p className="mt-8 text-center text-slate-600">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="font-bold text-teal-600 hover:text-teal-700 transition-colors">
                Log in
              </button>
            </p>
          </motion.div>
        </div>

        {/* Right Side - Brand & Visual */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-bl from-teal-700 to-cyan-600 text-white relative overflow-hidden order-1 md:order-2">
          {/* Internal Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
          <motion.div 
            className="absolute -left-20 top-40 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 8, repeat: Infinity }}
          />

          <div className="relative z-10 flex justify-end">
            <div 
              className="flex items-center gap-3 cursor-pointer group w-fit"
              onClick={() => navigate("/")}
            >
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 group-hover:bg-white/30 transition-all">
                <Pill className="w-6 h-6 text-white" />
              </div>
              <span className="text-3xl font-black tracking-tight text-white">SmartMeds</span>
            </div>
          </div>

          <div className="relative z-10 mt-20 text-right">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-5xl font-bold mb-6 leading-tight"
            >
              Take control of <br/>your health.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-cyan-100 text-lg max-w-md ml-auto"
            >
              Verify compositions, find nearby pharmacies, and connect directly with shopkeepers.
            </motion.p>
          </div>

          <div className="relative z-10 mt-20 flex justify-end">
            <div className="bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20 max-w-sm">
              <p className="text-cyan-50 italic mb-4">"SmartMeds changed the way I buy medicine. The alternatives are perfectly matched."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center font-bold">AK</div>
                <div>
                  <p className="text-sm font-bold">Aarav K.</p>
                  <p className="text-xs text-cyan-200">Verified User</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
