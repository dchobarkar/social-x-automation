import { LogOut } from "lucide-react";

import Button from "@/components/ui/Button";

export type XNavbarProps = {
  signOutAction: () => Promise<void>;
};

const XNavbar = ({ signOutAction }: XNavbarProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="flex min-h-(--x-chrome-header-h) items-center justify-end p-4 md:px-6 lg:px-8">
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            iconBefore={<LogOut className="h-4 w-4" />}
          >
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
};

export default XNavbar;
