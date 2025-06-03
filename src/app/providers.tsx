"use client";

import type React from "react";
import { ThemeProvider } from "../components/ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
			{children}
		</ThemeProvider>
	);
}
