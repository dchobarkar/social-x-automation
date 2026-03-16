import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

export type PageHeaderProps = {
  title: string;
  description?: ReactNode;
  className?: string;
};

const PageHeader = ({
  title,
  description,
  className,
}: PageHeaderProps) => {
  return (
    <header className={cn("mb-6", className)}>
      <h1 className="text-h2 font-semibold tracking-tight mb-2">{title}</h1>
      {description != null && (
        <p className="text-muted">{description}</p>
      )}
    </header>
  );
};

export default PageHeader;
