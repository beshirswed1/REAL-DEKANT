import React from "react";
import RootLayoutWrapper from "@/components/layout/RootLayout";
import { getSettingsConfig } from "@/lib/settings-cache";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settingsConfig = null;
  try {
    settingsConfig = await getSettingsConfig();
  } catch (error) {
    console.warn("Failed to fetch settings config in PublicLayout:", error);
  }

  return (
    <div className="bg-cream-light text-charcoal min-h-screen">
      <RootLayoutWrapper config={settingsConfig}>
        {children}
      </RootLayoutWrapper>
    </div>
  );
}
