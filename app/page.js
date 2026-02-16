import Image from "next/image";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import How from "./components/How";
import Why from "./components/Why";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="w-full h-full overflow-x-hidden">
      <Navbar />
      <Hero />
      <How />
      <Why />
      <CTA />
      <Footer />
    </main>
  );
}
