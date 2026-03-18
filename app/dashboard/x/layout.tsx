import type { ReactNode } from "react";

import { signOutXAction } from "@/app/actions/x";
import XDashboardLayoutClient from "@/components/layout/x/XDashboardLayoutClient";
import { X_DASHBOARD_CHROME_HEIGHTS } from "@/constants/x/layout";

const Layout = ({ children }: { children: ReactNode }) => {
  const chromeStyle = {
    ["--x-chrome-header-h"]: X_DASHBOARD_CHROME_HEIGHTS.header,
    ["--x-chrome-footer-h"]: X_DASHBOARD_CHROME_HEIGHTS.footer,
  } as React.CSSProperties;

  return (
    <div style={chromeStyle}>
      <XDashboardLayoutClient signOutAction={signOutXAction}>
        {children}
      </XDashboardLayoutClient>
    </div>
  );
};

export default Layout;
