import { LogOut } from "lucide-react";

import Button from "@/components/ui/Button";

export type XNavbarProps = {
  onSignOut?: () => void;
};

const XNavbar = ({ onSignOut }: XNavbarProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="flex items-center justify-end p-4 min-h-(--x-chrome-header-h)">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onSignOut}
          iconBefore={<LogOut className="h-4 w-4" />}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
};

export default XNavbar;
