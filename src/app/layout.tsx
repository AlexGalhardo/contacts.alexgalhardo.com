"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { Toaster } from "../components/ui/toaster";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 5,
						gcTime: 1000 * 60 * 30,
						retry: 2,
						refetchOnWindowFocus: false,
						refetchOnReconnect: true,
					},
					mutations: {
						retry: 1,
					},
				},
			}),
	);

	return (
		<html lang="pt-BR" suppressHydrationWarning>
			<body className={`${inter.className} bg-gray-50 text-black dark:bg-black dark:text-white`}>
				<QueryClientProvider client={queryClient}>
					<Providers>{children}</Providers>
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
				<Toaster />
			</body>
		</html>
	);
}
