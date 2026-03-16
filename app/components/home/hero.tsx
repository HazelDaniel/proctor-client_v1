import { Link } from "@remix-run/react";
import { motion } from "framer-motion";
import { InteractiveParticles } from "~/components/interactive-particles";

export const Hero = () => (
  <section className="pt-40 pb-20 px-6 flex flex-col items-center text-center overflow-hidden relative">
    <InteractiveParticles />
    <div className="text-accent absolute top-0 left-0 size-full opacity-20">
      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xlinkHref="http://www.w3.org/1999/xlink" width="1440" height="560" preserveAspectRatio="none" viewBox="0 0 1440 560">
        <g mask="url(&quot;#SvgjsMask1001&quot;)" fill="none">
            <path d="M854.69 669.47C1004.22 602.46 1019.99 137.97 1225.36 128.92 1430.72 119.87 1492.6 308.69 1596.02 313.72" stroke="rgba(42, 26, 66, 0.58)" strokeWidth="2"></path>
            <path d="M705.44 667.8C827.83 666.42 923.32 537.3 1175.49 530.9 1427.67 524.5 1514.91 307.33 1645.55 301.3" stroke="rgba(199, 32, 163, 0.58)" strokeWidth="2"></path>
            <path d="M548.65 658.74C741.88 616.75 822.76 113.37 1118.69 110.39 1414.63 107.41 1535.16 335.73 1688.74 339.99" stroke="rgba(145, 69, 233, 0.58)" strokeWidth="2"></path>
            <path d="M293.03 603.82C478.36 600.42 622.25 368.48 993.67 361.3 1365.1 354.12 1508.21 113.09 1694.32 109.3" stroke="rgba(51,121,194,0.58)" strokeWidth="2"></path>
            <path d="M489.99 659.84C629.65 590.17 563.75 136.62 826.09 133.73 1088.43 130.84 1320.27 365.57 1498.28 368.93" stroke="rgba(194, 51, 134, 0.58)" strokeWidth="2"></path>
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
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" xmlns="http://www.w3.org/2000/svg">
            <motion.rect
              width="100%"
              height="100%"
              rx="6"
              stroke="#a855f7"
              strokeWidth="2"
              fill="transparent"
              filter="blur(6px)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1],
                opacity: [0, 0.8, 0.8, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.2, 0.8, 1],
                delay: 5,
              }}
            />
            <motion.rect
              width="100%"
              height="100%"
              rx="6"
              stroke="#c084fc"
              strokeWidth="2"
              fill="transparent"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1],
                opacity: [0, 1, 1, 0],
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
          <Link
            to="/auth"
            className="relative px-8 py-3 bg-primary/90 text-white rounded-md font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl w-full sm:w-auto flex items-center justify-center z-10"
          >
            Get Started
          </Link>
        </div>
      </div>
    </motion.div>
  </section>
);
