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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50" />

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

        <div className="relative z-10 container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-2 rounded-full bg-cyan-100 text-cyan-700 text-sm mb-6"
              >
                Affordable Healthcare for Everyone
              </motion.div>

              <h1 className="text-6xl mb-6 leading-tight">
                Affordable Medicine
                <br />
                <span className="text-cyan-600">Intelligence Platform</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-xl">
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
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/dashboard")}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-xl shadow-cyan-500/30 hover:shadow-2xl transition-all text-lg flex items-center gap-3"
                >
                  Get Started
                  <motion.svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </motion.button>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-3 gap-6"
              >
                <div>
                  <div className="text-3xl text-cyan-600 mb-1">50K+</div>
                  <div className="text-sm text-muted-foreground">Verified Medicines</div>
                </div>
                <div>
                  <div className="text-3xl text-cyan-600 mb-1">5000+</div>
                  <div className="text-sm text-muted-foreground">Partner Pharmacies</div>
                </div>
                <div>
                  <div className="text-3xl text-cyan-600 mb-1">70%</div>
                  <div className="text-sm text-muted-foreground">Average Savings</div>
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl mb-4">Platform Overview</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
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
      <section className="py-24 bg-gradient-to-b from-white to-cyan-50/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed to make healthcare affordable and accessible
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30 mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl mb-4">Safety & Verification Standards</h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Every medicine on our platform is verified against the highest regulatory standards to ensure
                your safety and peace of mind.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BadgeCheck className="w-8 h-8 text-emerald-600" />
                  <h3 className="text-2xl">CDSCO Verified</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  All medicines are verified by the Central Drugs Standard Control Organization (CDSCO), India's
                  national regulatory body for pharmaceuticals and medical devices.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-8 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <BadgeCheck className="w-8 h-8 text-cyan-600" />
                  <h3 className="text-2xl">FSSAI Compliant</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Health supplements and nutritional products carry FSSAI compliance badges, ensuring they meet
                  food safety and quality standards.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 p-8 rounded-xl bg-amber-50 border border-amber-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-xl mb-2">Important Safety Notice</h3>
                  <p className="text-muted-foreground leading-relaxed">
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
      <section className="py-24 bg-gradient-to-br from-cyan-600 to-teal-700 relative overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <h2 className="text-4xl mb-6">Make Healthcare Affordable</h2>
            <p className="text-xl mb-8 text-cyan-50 leading-relaxed">
              Join thousands of users who are making informed healthcare decisions and saving significantly on
              their medical expenses with verified, safe alternatives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/dashboard")}
                className="px-10 py-4 rounded-xl bg-white text-cyan-600 shadow-xl hover:shadow-2xl transition-all text-lg"
              >
                Get Started
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}