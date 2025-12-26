import Link from "next/link";
import { Button } from "@/components/ui/button";
import LampDemo from "@/components/lamp-demo";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Navigation - Fixed at top */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border glass-effect bg-card/80">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gradient">Quizzy Quizzy</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button className="bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-primary/50 transition-all duration-300 hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Lamp Effect */}
      <LampDemo />
    </div>
  );
}
