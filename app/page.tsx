import HeroSection from '@/components/HeroSection';
import LeadForm from '@/components/LeadForm';
import TrustSection from '@/components/TrustSection';
import HowItWorks from '@/components/HowItWorks';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <HeroSection />
      <TrustSection />
      <LeadForm />
      <HowItWorks />
      <FAQ />
      <Footer />
    </main>
  );
}
