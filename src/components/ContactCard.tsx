"use client";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ContactInterface } from "../types/contact";
import { Loader2, MapPin, Pencil, Trash2, User } from "lucide-react";

interface ContactCardProps {
	contact: ContactInterface;
	onEdit: (contact: ContactInterface) => void;
	onDelete: (contact: ContactInterface) => void;
	isUpdating: boolean;
	isDeleting: boolean;
}

export default function ContactCard({ contact, onEdit, onDelete, isUpdating, isDeleting }: ContactCardProps) {
	return (
		<Card className="border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md bg-white dark:bg-gray-800">
			<CardContent className="p-4">
				<div className="flex justify-between items-start mb-3">
					<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-2">
						{contact.displayName}
					</h3>
					<div className="flex gap-1 flex-shrink-0">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onEdit(contact)}
							disabled={isUpdating}
							className="h-8 w-8 border border-orange-400 hover:bg-orange-50 hover:border-orange-500 dark:hover:bg-orange-900/20 transition-colors"
						>
							{isUpdating ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
							) : (
								<Pencil className="h-3.5 w-3.5 text-orange-500" />
							)}
						</Button>

						<Button
							variant="ghost"
							size="icon"
							onClick={() => onDelete(contact)}
							disabled={isDeleting}
							className="h-8 w-8 border border-red-400 hover:bg-red-50 hover:border-red-500 dark:hover:bg-red-900/20 transition-colors"
						>
							{isDeleting ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
							) : (
								<Trash2 className="h-3.5 w-3.5 text-red-500" />
							)}
						</Button>
					</div>
				</div>

				<div className="space-y-2 text-sm">
					<div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
						<User className="h-3.5 w-3.5 flex-shrink-0" />
						<span className="font-medium">Username:</span>
						<span className="text-gray-900 dark:text-gray-100">{contact.userName}</span>
					</div>

					<div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
						<MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
						<div className="flex-1 min-w-0">
							<div className="flex flex-wrap gap-1">
								<span className="font-medium">Address:</span>
								<span className="text-gray-900 dark:text-gray-100">
									{contact.street}, {contact.neighborhood}
								</span>
							</div>
							<div className="flex flex-wrap gap-1 mt-1">
								<span className="font-medium">City:</span>
								<span className="text-gray-900 dark:text-gray-100">
									{contact.city} - {contact.state}
								</span>
							</div>
							<div className="flex flex-wrap gap-1 mt-1">
								<span className="font-medium">CEP:</span>
								<span className="text-gray-900 dark:text-gray-100">{contact.cep}</span>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
