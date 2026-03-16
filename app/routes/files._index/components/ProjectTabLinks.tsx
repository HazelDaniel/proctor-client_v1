import React from "react";
import { Link, useSearchParams } from "@remix-run/react";

export const ProjectTabLinks: React.FC = () => {
  const [searchParams] = useSearchParams();
  const currentSort = searchParams.get("sortBy") || "recent";

  return (
    <nav className="w-full h-12 mt-20">
      <ul className="flex items-center justify-center h-full gap-4 mx-auto w-max basis-16">
        <li className={`w-[10rem] p-2 px-4 rounded-md text-center ring-accent/50 ring-2 ring-offset-2 cursor-pointer transition-colors duration-700 ease-linear ${currentSort === "recent" ? "bg-[conic-gradient(at_center,purple_30%,rgb(var(--accent-color)),purple)] text-canvas" : "bg-outline1/20 hover:bg-outline1/50"}`}>
          <Link to="?sortBy=recent" preventScrollReset>
            recently viewed
          </Link>
        </li>
        <li className={`w-[10rem] p-2 px-4 rounded-md text-center ring-accent/50 ring-2 ring-offset-2 cursor-pointer transition-colors duration-700 ease-linear ${currentSort === "popular" ? "bg-[conic-gradient(at_center,purple_30%,rgb(var(--accent-color)),purple)] text-canvas" : "bg-outline1/20 hover:bg-outline1/50"}`}>
          <Link to="?sortBy=popular" preventScrollReset>Popular</Link>
        </li>
      </ul>
    </nav>
  );
};
