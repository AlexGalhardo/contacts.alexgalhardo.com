"use client";

import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
	if (totalPages <= 1) return null;

	return (
		<div className="flex items-center gap-2 py-4">
			<Button
				variant="outline"
				size="icon"
				onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
				disabled={currentPage === 1}
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>
			<span className="text-sm">
				Page {currentPage} of {totalPages}
			</span>
			<Button
				variant="outline"
				size="icon"
				onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
				disabled={currentPage === totalPages}
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
