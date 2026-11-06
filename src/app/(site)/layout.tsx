import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/layout/Nav";
import CookieConsent from "@/components/CookieConsent";
import ProgressiveBlur from "@/components/layout/ProgressiveBlur";
import RouteCTA from "@/components/layout/RouteCTA";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/framer/Preloader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <ProgressiveBlur />
      <Nav />
      <CookieConsent />
      <div className="flex w-full flex-col items-center gap-20 overflow-x-clip bg-neutral-100">
        {children}
        <div className="flex w-full flex-col">
          <RouteCTA />
          <Footer />
        </div>
      </div>
      <Preloader
        video="/media/preloader.mp4"
        backgroundColor="rgb(255, 255, 255)"
        videoWidth={240}
        objectFit="contain"
        fadeDuration={700}
        maxWait={10000}
        sessionKey="preloader-shown"
      />
    </SmoothScroll>
  );
}
