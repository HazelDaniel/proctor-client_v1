import { useNavigation } from "@remix-run/react";
import { useEffect, useState } from "react";

export function PageLoader() {
  const navigation = useNavigation();
  const active = navigation.state !== "idle";

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (active) {
      setProgress(0);
      
      const simulateProgress = () => {
        setProgress((prev) => {
          if (prev >= 85) return prev;
          
          // Jump by a random amount between 5% and 15%
          const jump = Math.random() * 10 + 5;
          const next = Math.min(prev + jump, 85);
          
          // Schedule next jump
          timeout = setTimeout(simulateProgress, Math.random() * 300 + 200);
          
          return next;
        });
      };
      
      // Start simulation after a short delay to prevent flashing on fast loads
      timeout = setTimeout(simulateProgress, 100);
    } else {
      // Transition to 100% when done
      setProgress(100);
      
      // Clear progress after animation finishes
      timeout = setTimeout(() => {
        setProgress(0);
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [active]);

  if (!active && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 w-full h-1 z-50 pointer-events-none transition-all duration-300 ease-out flex items-center"
    >
      <div 
        className="h-full bg-[rgb(var(--accent-color))] transition-all duration-300 ease-out relative"
        style={{ width: `${progress}%` }}
      >
        {/* Animated dot/logo indicator at the front of the progress bar */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 bg-[rgb(var(--accent-color))] rounded-full shadow-[0_0_10px_rgb(var(--accent-color))] animate-pulse">
        </div>
      </div>
    </div>
  );
}
