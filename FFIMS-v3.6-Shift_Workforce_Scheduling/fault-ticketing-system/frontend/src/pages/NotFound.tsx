import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-[24px] border bg-white p-10 text-center shadow-sm">
        <p className="text-[12px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">404</p>
        <h1 className="mt-4 text-[28px] font-semibold tracking-tight text-foreground">Route not found</h1>
        <p className="mt-3 text-[14px] leading-7 text-muted-foreground">
          The requested FFIMS page does not exist or is not yet connected to this module.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Return to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
