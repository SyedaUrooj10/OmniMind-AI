import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Trusted from "@/components/landing/Trusted";
import Features from "@/components/landing/Features";
import Demo from "@/components/landing/Demo";
import Architecture from "@/components/landing/Architecture";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <Navbar />

      <Hero />

      <Trusted />

      <section id="features">
        <Features />
      </section>

      <section id="demo">
        <Demo />
      </section>

      <Architecture />

      <section id="pricing">
        <Pricing />
      </section>

      <section id="faq">
        <FAQ />
      </section>

      <Footer />
    </main>
  );
}
