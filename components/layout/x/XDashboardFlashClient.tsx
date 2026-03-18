"use client";

import FlashMessageBar from "@/components/ui/FlashMessageBar";
import { ROUTES } from "@/constants/routes";
import { useQueryFlashMessage } from "@/hooks/useQueryFlashMessage";

const XDashboardFlashClient = () => {
  const flashMessage = useQueryFlashMessage({
    successMessage: "X account connected successfully.",
    onConsume: () => {
      window.history.replaceState({}, "", ROUTES.DASHBOARD_X);
    },
  });

  return (
    <FlashMessageBar
      message={flashMessage}
      className="mx-4 mt-4 md:mx-6 md:mt-6 text-sm"
    />
  );
};

export default XDashboardFlashClient;
