import type { ReactNode } from "react";
import { Home } from "lucide-react";

import Button from "@/components/ui/Button";
import { ROUTES } from "@/constants/routes";

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="p-6 md:p-8 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          href={ROUTES.HOME}
          iconBefore={<Home className="h-4 w-4" />}
        >
          Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">{children}</div>
      </div>
    </div>
  );
};

export default Layout;
