"use client";

import { Button } from "@/src/components/ui/button";
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
	const router = useRouter();
	const [countdown, setCountdown] = useState(5);

	useEffect(() => {
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					router.push("/");
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [router]);

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
			<div className="max-w-md text-center space-y-6">
				<h1 className="text-6xl font-bold text-rose-600">404</h1>
				<h2 className="text-3xl font-semibold">Page Not Found</h2>
				<p className="text-lg text-gray-400">
					The page you are looking for does not exist or has been removed.
				</p>
				<p className="text-gray-500">
					Redirecting to the homepage in <span className="font-bold text-rose-600">{countdown}</span>{" "}
					seconds...
				</p>
				<div className="flex gap-4 justify-center mt-8">
					<Button
						className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white"
						onClick={() => router.push("/")}
					>
						<Home className="h-4 w-4" />
						Homepage
					</Button>
				</div>
			</div>
		</div>
	);
}
