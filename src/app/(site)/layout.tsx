import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/layout/Nav";
import CTA from "@/components/layout/CTA";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/framer/Preloader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      <Nav />
      <div className="flex w-full flex-col items-center gap-20 overflow-x-clip bg-neutral-100">
        {children}
        <div className="flex w-full flex-col">
          <CTA />
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
