import type { MetaFunction } from "@remix-run/node";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Header } from "~/components/home/header";
import { Hero } from "~/components/home/hero";
import { Showcase } from "~/components/home/showcase";
import { Testimonials } from "~/components/home/testimonials";
import { Footer } from "~/components/home/footer";

export const meta: MetaFunction = () => {
  return [
    { title: "proctor | Plan Infra Better" },
    { name: "description", content: "The best tool for your infrastructure planning workflow" },
  ];
};

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
