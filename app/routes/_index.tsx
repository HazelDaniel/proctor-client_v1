import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion } from "framer-motion";
import { Logo } from "~/components/logo";

import { InteractiveParticles } from "~/components/interactive-particles";

export const meta: MetaFunction = () => {
  return [
    { title: "proctor | Plan Infra Better" },
    { name: "description", content: "The best tool for your infrastructure planning workflow" },
  ];
};

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          isScrolled ? "py-4" : "py-6"
        }`}
      >
        <div 
          className={`mx-auto flex items-center justify-between transition-all duration-300 ease-in-out ${
            isScrolled 
              ? "w-[calc(100%-2rem)] max-w-5xl px-6 py-3 bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/40 border border-gray-200/50 rounded-full" 
              : "w-full px-6 md:px-12 py-2 bg-transparent border-transparent"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="font-bold text-xl tracking-tighter text-black flex items-center z-50 hover:opacity-80 transition-opacity">
            <span className="size-8">
              <Logo />
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="#" className="text-gray-500 hover:text-black transition-colors">Features</Link>
            <Link to="#" className="text-gray-500 hover:text-black transition-colors">Methodology</Link>
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link to="/auth?mode=signin" className="text-gray-500 hover:text-black transition-colors">Log In</Link>
            <Link to="/auth" className="px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Start Planning
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden z-50 p-2 text-gray-600 hover:text-black transition-colors focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <motion.div 
        initial={false}
        animate={{ 
          opacity: mobileMenuOpen ? 1 : 0, 
          y: mobileMenuOpen ? 0 : -20,
          pointerEvents: mobileMenuOpen ? "auto" : "none" 
        }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl md:hidden pt-28 px-6 flex flex-col"
      >
        <nav className="flex flex-col gap-6 text-2xl font-semibold tracking-tight text-gray-900">
          <Link to="#" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">Features</Link>
          <Link to="#" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">Methodology</Link>
          <div className="h-px bg-gray-200 my-4" />
          <Link to="/auth?mode=signin" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">Log In</Link>
          <Link to="/auth" onClick={() => setMobileMenuOpen(false)} className="mt-4 px-6 py-4 bg-black text-white text-center rounded-2xl text-lg font-medium shadow-lg active:scale-95 transition-transform w-max ml-[-3px]">
            Start Planning
          </Link>
        </nav>
      </motion.div>
    </>
  );
};

const Hero = () => (
  <section className="pt-40 pb-20 px-6 flex flex-col items-center text-center overflow-hidden relative">
    <InteractiveParticles />
    <div className="text-accent absolute top-0 left-0 size-full opacity-20">
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xlinkHref="http://www.w3.org/1999/xlink" width="1440" height="560" preserveAspectRatio="none" viewBox="0 0 1440 560">
        <g mask="url(&quot;#SvgjsMask1001&quot;)" fill="none">
            <path d="M854.69 669.47C1004.22 602.46 1019.99 137.97 1225.36 128.92 1430.72 119.87 1492.6 308.69 1596.02 313.72" stroke="rgba(42, 26, 66, 0.58)" stroke-width="2"></path>
            <path d="M705.44 667.8C827.83 666.42 923.32 537.3 1175.49 530.9 1427.67 524.5 1514.91 307.33 1645.55 301.3" stroke="rgba(199, 32, 163, 0.58)" stroke-width="2"></path>
            <path d="M548.65 658.74C741.88 616.75 822.76 113.37 1118.69 110.39 1414.63 107.41 1535.16 335.73 1688.74 339.99" stroke="rgba(145, 69, 233, 0.58)" stroke-width="2"></path>
            <path d="M293.03 603.82C478.36 600.42 622.25 368.48 993.67 361.3 1365.1 354.12 1508.21 113.09 1694.32 109.3" stroke="rgba(51,121,194,0.58)" stroke-width="2"></path>
            <path d="M489.99 659.84C629.65 590.17 563.75 136.62 826.09 133.73 1088.43 130.84 1320.27 365.57 1498.28 368.93" stroke="rgba(194, 51, 134, 0.58)" stroke-width="2"></path>
        </g>
        <defs>
            <mask id="SvgjsMask1001">
                <rect width="1440" height="560" fill="#ffffff"></rect>
            </mask>
        </defs>
      </svg>
    </div>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto relative"
    >
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm font-medium mb-6 animate-pulse text-black">
        <span className="flex w-2 h-2 rounded-full bg-black mr-2"></span>
        Introducing proctor 2.0
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 leading-[1.1]">
        Your Productivity tool<br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400">
        And a lot more
        </span>
      </h1>
      <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto font-medium">
        Proctor is the infrastructure planning tool everyone on your team has been longing for.
        You can plan, design, and collaborate on your projects with ease.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="relative w-full sm:w-auto group">
          {/* Animated Lighted Tracing Edge */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" xmlns="http://www.w3.org/2000/svg">
            {/* Glow / blur layer for lighted effectn */}
            <motion.rect
              width="100%"
              height="100%"
              rx="6"
              stroke="#a855f7" // purple-500
              strokeWidth="2"
              fill="transparent"
              filter="blur(6px)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1],
                opacity: [0, 0.8, 0.8, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.2, 0.8, 1],
                delay: 5,
              }}
            />
            {/* Main sharp trace line */}
            <motion.rect
              width="100%"
              height="100%"
              rx="6"
              stroke="#c084fc" // purple-400
              strokeWidth="2"
              fill="transparent"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1],
                opacity: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.2, 0.8, 1],
                delay: 5,
              }}
            />
          </svg>
          <Link to="/auth" className="relative px-8 py-3 bg-primary/90 text-white rounded-md font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto flex items-center justify-center z-10">
            Get Started
          </Link>
        </div>
      </div>
    </motion.div>
  </section>
);

const Showcase = () => (
  <section className="py-24 px-6  border-y border-gray-100 relative">
    <div className="absolute inset-0 z-[10] overflow-hidden pointer-events-none">
      <div 
        className="flare-1 absolute w-[5rem] h-[5rem] rounded-full blur-[100px] opacity-80 scale-[3] z-[8]"
        style={{ background: 'radial-gradient(circle, #c084fc 0%, transparent 70%)' }}
      ></div>
      <div 
        className="flare-1 absolute w-[5rem] h-[5rem] rounded-full blur-[100px] opacity-80 scale-[3]"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
      ></div>
    </div>
    
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16" data-aos="fade-up">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Every detail, perfected.</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Experience micro-interactions and seamless workflows that feel instantly familiar yet incredibly fresh.</p>
      </div>


      <div className="grid md:grid-cols-2 gap-8">
        <div data-aos="fade-up" data-aos-delay="100" className="group rounded-2xl p-2 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="aspect-video rounded-xl bg-gray-100 overflow-hidden relative flex items-center justify-center">
            <img src="/images/demo-2.gif" alt="proctor showcase" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-primary/80 opacity-50 transition-opacity"></div>

          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Instant Feedback</h3>
            <p className="text-gray-500 text-sm">See your changes live in milliseconds. No more waiting.</p>
          </div>
        </div>

        <div data-aos="fade-up" data-aos-delay="200" className="group rounded-2xl p-2 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="aspect-video rounded-xl bg-gray-100 overflow-hidden relative flex items-center justify-center">
             {/* Placeholder for Video/Gif */}
            <img src="/images/landing.gif" alt="proctor landing page showcase" className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Collaborative Environment</h3>
            <p className="text-gray-500 text-sm">Work together on schema design with tech lead</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Testimonials = () => (
  <section className="py-24 px-6">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16" data-aos="fade-up">
        <h2 className="text-3xl font-bold tracking-tight mb-4">Loved by builders</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {[
          { name: "Alice M.", role: "Frontend Lead", text: "proctor changed how we ship. The developer experience is unmatched.", imageUrl: "/images/emoji_student_1.png" },
          { name: "Bob S.", role: "CTO", text: "We moved our entire collaboration suite to proctor and everything has been better since.", imageUrl: "/images/emoji_student_2.png" },
          { name: "Charlie D.", role: "Indie Hacker", text: "I can finally focus on planning-to-product workflow in a single place instead of using 10 different tools.", imageUrl: "/images/emoji_student_2.png" }
        ].map((t, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            data-aos="fade-up" 
            data-aos-delay={i * 100} 
            className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-default"
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={t.imageUrl} alt={t.name} className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-inner" />
              <div>
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.role}</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-primary border-t border-gray-200 py-12 px-6">
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
      <div>
        <h4 className="font-regular mb-4 text-lg text-accent/50">Resources</h4>
        <ul className="space-y-2 text-sm text-white ml-2">
          <li><Link to="#" className="hover:text-black transition-colors">Docs</Link></li>
          <li><Link to="#" className="hover:text-black transition-colors">Pricing</Link></li>
          <li><Link to="#" className="hover:text-black transition-colors">Blog</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-regular mb-4 text-lg text-accent/50">Company</h4>
        <ul className="space-y-2 text-sm text-white ml-2">
          <li><Link to="#" className="hover:text-black transition-colors">About</Link></li>
          <li><Link to="#" className="hover:text-black transition-colors">Careers</Link></li>
          <li><Link to="#" className="hover:text-black transition-colors">Contact</Link></li>
        </ul>
      </div>
      <div>
        <h4 className="font-regular mb-4 text-lg text-accent/50">Legal</h4>
        <ul className="space-y-2 text-sm text-white ml-2">
          <li><Link to="#" className="hover:text-black transition-colors">Privacy Policy</Link></li>
          <li><Link to="#" className="hover:text-black transition-colors">Terms of Service</Link></li>
        </ul>
      </div>
    </div>
    <div className="max-w-6xl mx-auto pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
      <div className="flex items-center gap-2 mb-4 md:mb-0">
        <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
          <Logo/>
        </div>
        <span>© 2026 proctor Inc.</span>
      </div>
      <div className="flex gap-4">
        <Link to="#" className="hover:text-black transition-colors">GitHub</Link>
        <Link to="#" className="hover:text-black transition-colors">Twitter</Link>
      </div>
    </div>
  </footer>
);

export default function Index() {
  useEffect(() => {
    AOS.init({
      once: true,
      easing: "ease-out-cubic",
      offset: 50,
      duration: 800,
    });
  }, []);

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Header />
      <main>
        <Hero />
        <Showcase />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
}
