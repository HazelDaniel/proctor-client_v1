import { Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { Logo } from "~/components/logo";

export const Header = () => {
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
          <Link
            to="/"
            className="font-bold text-xl tracking-tighter text-black flex items-center z-50 hover:opacity-80 transition-opacity"
          >
            <span className="size-8">
              <Logo />
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="#" className="text-gray-500 hover:text-black transition-colors">
              Features
            </Link>
            <Link to="#" className="text-gray-500 hover:text-black transition-colors">
              Methodology
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link to="/auth?mode=signin" className="text-gray-500 hover:text-black transition-colors">
              Log In
            </Link>
            <Link
              to="/auth"
              className="px-5 py-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Start Planning
            </Link>
          </div>

          <button
            className="md:hidden z-50 p-2 text-gray-600 hover:text-black transition-colors focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <motion.div
        initial={false}
        animate={{
          opacity: mobileMenuOpen ? 1 : 0,
          y: mobileMenuOpen ? 0 : -20,
          pointerEvents: mobileMenuOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl md:hidden pt-28 px-6 flex flex-col"
      >
        <nav className="flex flex-col gap-6 text-2xl font-semibold tracking-tight text-gray-900">
          <Link to="#" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">
            Features
          </Link>
          <Link to="#" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">
            Methodology
          </Link>
          <div className="h-px bg-gray-200 my-4" />
          <Link to="/auth?mode=signin" onClick={() => setMobileMenuOpen(false)} className="hover:text-primary transition-colors">
            Log In
          </Link>
          <Link
            to="/auth"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-4 px-6 py-4 bg-black text-white text-center rounded-2xl text-lg font-medium shadow-lg active:scale-95 transition-transform w-max ml-[-3px]"
          >
            Start Planning
          </Link>
        </nav>
      </motion.div>
    </>
  );
};
