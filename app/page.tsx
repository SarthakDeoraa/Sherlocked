import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { Navbar } from "@/components/ui/navbar";
import HeroSection from "@/components/hero-section";
import AboutSection from "@/components/about-section";
import RulesSection from "@/components/rules-section";
import Footer from "@/components/ui/footer";
export default async function HomeFlexbox() {
    const session = await getServerSession(authOptions);
    
    return (
        <>
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center">
                <HeroSection />
            </div>
            
        </div>
        <AboutSection/>
        <RulesSection/>
        <Footer/>
        </>
    );
}