import { Link } from "@remix-run/react";
import { PixieDust } from "~/components/pixie-dust";
import { Logo } from "~/components/logo";

export const Footer = () => (
  <footer className="bg-primary border-t border-gray-200 py-12 px-6 relative">
    <PixieDust />
    <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 relative z-10">
      <div>
        <h4 className="font-regular mb-4 text-lg clip-text text-transparent" style={{ backgroundImage: "linear-gradient(to right, #6336f2,  #d563f1ff, #8b5cf6)", backgroundClip: "text" }}>
          Resources
        </h4>
        <ul className="space-y-2 text-sm text-white ml-2">
          <li>
            <Link to="#" className="hover:text-black transition-colors">
              Docs
            </Link>
          </li>
          <li>
            <Link to="#" className="hover:text-black transition-colors">
              Pricing
            </Link>
          </li>
          <li>
            <Link to="#" className="hover:text-black transition-colors">
              Blog
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-regular mb-4 text-lg clip-text text-transparent" style={{ backgroundImage: "linear-gradient(to right, #6336f2,  #d563f1ff, #8b5cf6)", backgroundClip: "text" }}>
          Company
        </h4>
        <ul className="space-y-2 text-sm text-white ml-2">
          <li>
            <Link to="#" className="hover:text-black transition-colors">
              About
            </Link>
          </li>
          <li>
            <Link to="#" className="hover:text-black transition-colors">
              Careers
            </Link>
          </li>
          <li>
            <Link to="#" className="hover:text-black transition-colors">
              Contact
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="font-regular mb-4 text-lg clip-text text-transparent" style={{ backgroundImage: "linear-gradient(to right, #6336f2,  #d563f1ff, #8b5cf6)", backgroundClip: "text" }}>
          Legal
        </h4>
        <ul className="space-y-2 text-sm text-white ml-2">
          <li>
            <Link to="#" className="hover:text-black transition-colors">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link to="#" className="hover:text-black transition-colors">
              Terms of Service
            </Link>
          </li>
        </ul>
      </div>
    </div>
    <div className="max-w-6xl mx-auto pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
      <div className="flex items-center gap-2 mb-4 md:mb-0">
        <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center">
          <Logo />
        </div>
        <span>© 2026 proctor Inc.</span>
      </div>
      <div className="flex gap-4">
        <Link to="#" className="hover:text-black transition-colors">
          GitHub
        </Link>
        <Link to="#" className="hover:text-black transition-colors">
          Twitter
        </Link>
      </div>
    </div>
  </footer>
);
