import type { ReactNode } from "react";

import AuthFooter from "@/components/layout/auth/AuthFooter";
import AuthNavbar from "@/components/layout/auth/AuthNavbar";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AuthNavbar />

      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-lg">{children}</div>
      </div>

      <AuthFooter />
    </div>
  );
};

export default Layout;
