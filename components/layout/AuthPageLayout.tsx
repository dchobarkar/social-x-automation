import type { ReactNode } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { Home } from "lucide-react";

export type AuthPageLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  homeHref: string;
};

const AuthPageLayout = ({
  title,
  description,
  children,
  homeHref,
}: AuthPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="p-6 md:p-8 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          href={homeHref}
          iconBefore={<Home className="h-4 w-4" />}
        >
          Home
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <Card title={title} description={description}>
            {children}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuthPageLayout;
