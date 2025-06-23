"use client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useFilters } from "../app/hooks/useFilters";
import { ContactFiltersInterface } from "../types/contact";

interface ContactFiltersProps {
	onPageReset: () => void;
}

export default function ContactFilters({ onPageReset }: ContactFiltersProps) {
	const { filters, setFilters, clearFilters } = useFilters();

	const handleFilterChange = (key: keyof ContactFiltersInterface, value: string) => {
		setFilters({ [key]: value });
		onPageReset();
	};

	const handleClearFilters = () => {
		clearFilters();
		onPageReset();
	};

	const hasActiveFilters = Object.values(filters).some((value) => value !== "");

	return (
		<div className="space-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-orange-600 font-bold text-xl">Search Contact</h2>
				{hasActiveFilters && (
					<Button variant="outline" onClick={handleClearFilters} size="sm">
						Clear
					</Button>
				)}
			</div>

			<div className="space-y-3">
				<Input
					placeholder="Search Display Name"
					value={filters.displayName}
					onChange={(e) => handleFilterChange("displayName", e.target.value)}
					className="w-full"
				/>
				<Input
					placeholder="Search User Name"
					value={filters.userName}
					onChange={(e) => handleFilterChange("userName", e.target.value)}
					className="w-full"
				/>
				<Input
					placeholder="Search City"
					value={filters.city}
					onChange={(e) => handleFilterChange("city", e.target.value)}
					className="w-full"
				/>
				<Input
					placeholder="Search State (ex: SP)"
					value={filters.state}
					onChange={(e) => handleFilterChange("state", e.target.value)}
					className="w-full"
				/>
				<Input
					placeholder="Search Street"
					value={filters.street}
					onChange={(e) => handleFilterChange("street", e.target.value)}
					className="w-full"
				/>
				<Input
					placeholder="Search Neighborhood"
					value={filters.neighborhood}
					onChange={(e) => handleFilterChange("neighborhood", e.target.value)}
					className="w-full"
				/>
				<Input
					placeholder="Search CEP"
					value={filters.cep}
					maxLength={8}
					onChange={(e) => {
						const onlyNumbers = e.target.value.replace(/\D/g, "");
						if (onlyNumbers.length <= 8) {
							handleFilterChange("cep", onlyNumbers);
						}
					}}
					className="w-full"
				/>
			</div>
		</div>
	);
}
