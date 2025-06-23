"use client";

import { CalendarRange, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "./ui/button";
import ContactForm from "./ContactForm";
import ContactFilters from "./ContactFilters";
import { ContactInterface } from "../types/contact";

interface SidebarProps {
	onSubmitContact: (contact: ContactInterface) => void;
	isSubmitting: boolean;
	onPageReset: () => void;
}

export default function Sidebar({ onSubmitContact, isSubmitting, onPageReset }: SidebarProps) {
	const { theme, setTheme } = useTheme();

	return (
		<div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto h-screen">
			<div className="p-6 space-y-6">
				<div className="flex items-center justify-between">
					<Link href="/">
						<h1 className="font-bold text-blue-600 tracking-wider uppercase text-2xl flex items-center gap-2">
							<CalendarRange className="h-6 w-6" />
							Agenda
						</h1>
					</Link>
					<div className="flex items-center gap-2">
						<Link href="https://github.com/AlexGalhardo/contacts.alexgalhardo.com" target="_blank">
							<Button variant="outline" size="icon" className="flex-shrink-0">
								<svg
									className="h-[1.2rem] w-[1.2rem]"
									role="img"
									viewBox="0 0 24 24"
									fill="currentColor"
									xmlns="http://www.w3.org/2000/svg"
								>
									<title>GitHub</title>
									<path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.263.82-.582 0-.288-.012-1.243-.018-2.252-3.338.726-4.042-1.415-4.042-1.415-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.931 0-1.31.468-2.381 1.236-3.221-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.803 5.625-5.475 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .322.216.699.825.58C20.565 21.796 24 17.297 24 12c0-6.63-5.37-12-12-12z" />
								</svg>
							</Button>
						</Link>
						<Button
							variant="outline"
							size="icon"
							onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
							aria-label="Toggle theme"
							className="flex-shrink-0"
						>
							{theme === "dark" ? (
								<Sun className="h-[1.2rem] w-[1.2rem]" />
							) : (
								<Moon className="h-[1.2rem] w-[1.2rem]" />
							)}
						</Button>
					</div>
				</div>

				<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
					<ContactForm onSubmit={onSubmitContact} isSubmitting={isSubmitting} />
				</div>

				<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
					<ContactFilters onPageReset={onPageReset} />
				</div>
			</div>
		</div>
	);
}
