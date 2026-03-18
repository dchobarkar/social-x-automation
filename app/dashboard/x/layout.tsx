import type { ReactNode } from "react";

import XDashboardLayoutShell from "@/components/layout/x/XDashboardLayoutShell";
import { X_DASHBOARD_CHROME_HEIGHTS } from "@/constants/x/layout";
import { signOutXAction } from "@/services/x/auth.actions";

const Layout = ({ children }: { children: ReactNode }) => {
  const chromeStyle = {
    ["--x-chrome-header-h"]: X_DASHBOARD_CHROME_HEIGHTS.header,
    ["--x-chrome-footer-h"]: X_DASHBOARD_CHROME_HEIGHTS.footer,
  } as React.CSSProperties;

  return (
    <div style={chromeStyle}>
      <XDashboardLayoutShell signOutAction={signOutXAction}>
        {children}
      </XDashboardLayoutShell>
    </div>
  );
};

export default Layout;
