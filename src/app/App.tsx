import { motion, useScroll, useTransform } from "motion/react";
import { useNavigate } from "react-router";
import { Pill3D } from "./components/pill-3d";
import { FeatureSection } from "./components/feature-section";
import { InfoCard } from "./components/info-card";
import {
  Upload,
  FlaskConical,
  Shield,
  MapPin,
  MessageSquare,
  BadgeCheck,
  Star,
  Camera,
  Pill,
} from "lucide-react";

export default function App() {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.95]);

  const mainFeatures = [
    {
      icon: Upload,
      title: "Medicine Input",
      description:
        "Submit your prescription or medicine name through multiple convenient methods to get started.",
      details: [
        "Upload a photo of your prescription or medicine package",
        "Type the medicine name directly into the platform",
        "Capture prescription using your device camera",
        "System automatically extracts medicine information from images",
      ],
    },
    {
      icon: FlaskConical,
      title: "Smart Alternative Suggestions",
      description:
        "Our intelligent system analyzes your medicine and provides verified alternatives with detailed composition matching.",
      details: [
        "Advanced server-side analysis of active ingredients and composition",
        "Instant matching with equivalent generic and branded alternatives",
        "Detailed breakdown of salt composition for each alternative",
        "Therapeutic equivalence verification for all suggestions",
      ],
    },
    {
      icon: Shield,
      title: "Composition Matching & Safety Guidance",
      description:
        "Ensure safety with precise composition matching and professional guidance for every alternative.",
      details: [
        "100% identical composition alternatives marked as safe substitutes",
        "Clear safety indicators for perfect matches",
        "Doctor consultation advisory for alternatives with different salt compositions",
        "Detailed ingredient comparison to help informed decision-making",
      ],
    },
    {
      icon: MapPin,
      title: "Nearby Availability & Price Comparison",
      description:
        "Find the best prices and check real-time availability across pharmacies in your area.",
      details: [
        "View all nearby stores stocking your selected medicine",
        "Compare prices across multiple pharmacies instantly",
        "Real-time stock availability updates",
        "Distance and location information for convenient access",
      ],
    },
    {
      icon: MessageSquare,
      title: "Shopkeeper Interaction",
      description:
        "Connect directly with pharmacies to verify stock and reserve medicines before visiting.",
      details: [
        "Send stock availability requests to nearby pharmacies",
        "Receive instant confirmation from shopkeepers",
        "Reserve medicines to ensure availability",
        "Direct communication channel with pharmacy staff",
      ],
    },
    {
      icon: BadgeCheck,
      title: "Regulatory Verification Badge",
      description:
        "Every medicine is verified against regulatory standards to ensure authenticity and safety.",
      details: [
        "CDSCO (Central Drugs Standard Control Organization) approval verification",
        "FSSAI compliance badges for supplements and health products",
        "Government-approved medicine certification",
        "Authenticity guarantee for all listed alternatives",
      ],
    },
    {
      icon: Star,
      title: "User Reviews & Ratings",
      description:
        "Make informed decisions based on real experiences shared by the community.",
      details: [
        "Read genuine reviews from users who have used the medicine",
        "Star ratings for effectiveness and value",
        "Share your own experience to help others",
        "Verified purchase reviews for authenticity",
      ],
    },
  ];

  const quickFeatures = [
    {
      icon: Camera,
      title: "Multiple Input Methods",
      description: "Upload prescription photos, scan medicine packages, or type medicine names directly.",
      badge: "Easy",
    },
    {
      icon: FlaskConical,
      title: "Composition Analysis",
      description: "Advanced matching algorithm identifies equivalent medicines based on active ingredients.",
      badge: "Smart",
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "100% composition matches are safe. Different compositions require doctor consultation.",
      badge: "Verified",
    },
    {
      icon: MapPin,
      title: "Local Availability",
      description: "Check which nearby pharmacies have your medicine in stock with live updates.",
      badge: "Real-time",
    },
  ];

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex flex-col overflow-hidden bg-slate-50"
      >
        {/* Premium mesh gradient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-100/80 via-slate-50 to-teal-100/50" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

        {/* Animated background circles */}
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 rounded-full bg-cyan-200/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-teal-200/20 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />

        {/* Brand Header */}
        <header className="relative z-50 pt-4 md:pt-6 pb-0 pointer-events-none flex-shrink-0">
          <div className="container mx-auto px-6 lg:px-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 md:gap-4"
            >
              <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Pill className="w-5 h-5 md:w-7 md:h-7 text-white" />
              </div>
              <span className="text-3xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-800 to-teal-700 tracking-tight">SmartMeds</span>
            </motion.div>
          </div>
        </header>

        <div className="relative z-10 container mx-auto px-6 lg:px-12 flex-1 flex flex-col justify-start pt-2 md:pt-4 pb-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-extrabold mb-6 leading-[1.05] tracking-tighter text-slate-900 mt-0">
                Affordable Medicine
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-teal-500 to-emerald-500 pb-2 inline-block drop-shadow-sm">
                  Intelligence Platform
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-xl font-medium">
                Discover safe, verified medicine alternatives with identical compositions. Compare prices,
                check pharmacy availability, and make informed healthcare decisions with complete transparency.
              </p>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-12"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/dashboard")}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white shadow-xl shadow-cyan-500/30 hover:shadow-2xl transition-all text-lg font-semibold flex items-center gap-3 ring-4 ring-cyan-500/10"
                >
                  Get Started for Free
                  <motion.div
                    className="flex justify-center items-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm"
                  >
                    <motion.svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </motion.div>
                </motion.button>

                {/* Trust Badges */}
                <div className="flex items-center gap-4 mt-6 pl-2">
                  <div className="flex items-center gap-1.5 text-slate-700 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <BadgeCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">CDSCO Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <BadgeCheck className="w-4 h-4 text-cyan-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">FSSAI Compliant</span>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200/60"
              >
                <div>
                  <div className="text-4xl font-bold tracking-tight text-slate-800 mb-1">50K+</div>
                  <div className="text-sm font-medium text-cyan-600">Verified Medicines</div>
                </div>
                <div>
                  <div className="text-4xl font-bold tracking-tight text-slate-800 mb-1">5000+</div>
                  <div className="text-sm font-medium text-cyan-600">Partner Pharmacies</div>
                </div>
                <div>
                  <div className="text-4xl font-bold tracking-tight text-slate-800 mb-1">70%</div>
                  <div className="text-sm font-medium text-cyan-600">Average Savings</div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: 3D Pill */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative h-[600px]"
            >
              <Pill3D />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Quick Features Overview */}
      <section className="py-24 bg-white relative">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-slate-900">Platform Overview</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-medium">
              Our platform helps you find safe and affordable alternative medicines, verify their composition,
              and locate nearby availability with complete transparency and reliability.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickFeatures.map((feature, index) => (
              <InfoCard key={index} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        {/* Decorative faint grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">How It Works</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium">
              A comprehensive platform designed to make healthcare affordable and accessible.
            </p>
          </motion.div>

          <div className="space-y-32">
            {mainFeatures.map((feature, index) => (
              <FeatureSection key={index} {...feature} reverse={index % 2 !== 0} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Safety & Verification */}
      <section className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 shadow-2xl shadow-emerald-500/40 mb-8 border border-white/50 backdrop-blur-md">
                <Shield className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-slate-900">Safety & Verification Standards</h2>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Every medicine on our platform is verified against the highest regulatory standards to ensure
                your safety and peace of mind.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 shadow-lg shadow-emerald-100/50 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-emerald-100 rounded-2xl">
                    <BadgeCheck className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">CDSCO Verified</h3>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  All medicines are verified by the Central Drugs Standard Control Organization (CDSCO), India's
                  national regulatory body for pharmaceuticals and medical devices.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 shadow-lg shadow-cyan-100/50 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-cyan-100 rounded-2xl">
                    <BadgeCheck className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800">FSSAI Compliant</h3>
                </div>
                <p className="text-slate-600 leading-relaxed font-medium">
                  Health supplements and nutritional products carry FSSAI compliance badges, ensuring they meet
                  food safety and quality standards.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-xl shadow-amber-100/40"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0 border border-amber-200 shadow-inner">
                  <Shield className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-slate-800">Important Safety Notice</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    Medicines with 100% identical composition are marked as safe direct alternatives. If an
                    alternative contains different active ingredients or salt compositions, the platform will
                    advise you to consult with your doctor before switching to ensure safety and efficacy.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-slate-900 to-slate-900" />

        <motion.div
          className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-cyan-500/10 blur-[100px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -50, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white max-w-4xl mx-auto bg-white/5 backdrop-blur-xl p-12 rounded-3xl border border-white/10 shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Make Healthcare Affordable</h2>
            <p className="text-xl md:text-2xl mb-12 text-cyan-100/80 leading-relaxed font-medium">
              Join thousands of users who are making informed healthcare decisions and saving significantly on
              their medical expenses with verified, safe alternatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/dashboard")}
                className="px-10 py-5 rounded-2xl bg-white text-slate-900 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all text-xl font-bold"
              >
                Enter Platform
              </motion.button>
            </div>

            {/* Trust Badges for bottom CTA */}
            <div className="flex items-center justify-center gap-6 mt-8">
              <div className="flex items-center gap-2 text-cyan-100/90 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-colors hover:bg-white/10">
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider">CDSCO Verified</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-100/90 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 transition-colors hover:bg-white/10">
                <BadgeCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider">FSSAI Compliant</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}