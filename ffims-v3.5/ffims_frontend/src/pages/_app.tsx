import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import "./globals.css";
import FfimsNavSidebar from "@/components/shared/FfimsNavSidebar";
import Head from "next/head";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Only wrap with sidebar if we are within the Shift_Workforce_Scheduling module
  const isSchedulingApp = router.pathname.startsWith("/Shift_Workforce_Scheduling");

  return (
    <>
      <Head>
        <title>FFIMS — Workforce Scheduling</title>
        <meta name="description" content="Fleet and Facilities Integrated Management System" />
      </Head>
      {isSchedulingApp ? (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          <FfimsNavSidebar />
          <main style={{ flex: 1, overflowY: "auto", padding: "var(--page-padding)", background: "var(--bg)" }}>
            <div style={{ maxWidth: 1200, margin: "0 auto" }}>
              <Component {...pageProps} />
            </div>
          </main>
        </div>
      ) : (
        <Component {...pageProps} />
      )}
    </>
  );
}
