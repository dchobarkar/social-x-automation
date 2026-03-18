"use server";

import { redirect } from "next/navigation";

import { clearPkceStateFile } from "@/lib/storage/pkceStateStore";
import { clearTokens } from "@/lib/storage/tokenStore";
import { ROUTES } from "@/constants/routes";

export const signOutXAction = async () => {
  await Promise.all([clearTokens(), clearPkceStateFile()]);
  redirect(ROUTES.HOME);
};
