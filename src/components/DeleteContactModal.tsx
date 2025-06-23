"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ContactInterface } from "../app/lib/indexeddb";
import { Loader2 } from "lucide-react";

interface DeleteContactModalProps {
	isOpen: boolean;
	onClose: () => void;
	contact: ContactInterface | null;
	onConfirm: () => void;
	isDeleting: boolean;
}

export default function DeleteContactModal({
	isOpen,
	onClose,
	contact,
	onConfirm,
	isDeleting,
}: DeleteContactModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Confirm Delete</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this contact? This action cannot be undone!
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					{contact && (
						<CardContent className="border-gray-200 border shadow px-3 py-3 dark:border-gray-200">
							<p>
								<strong>Username:</strong> {contact.userName}
							</p>
							<p>
								<strong>Display Name:</strong> {contact.displayName}
							</p>
							<p>
								<strong>Street:</strong> {contact.street.replace("Rua ", "")}
							</p>
							<p>
								<strong>Neighborhood:</strong> {contact.neighborhood}
							</p>
							<p>
								<strong>City:</strong> {contact.city}
							</p>
							<p>
								<strong>State:</strong> {contact.state}
							</p>
							<p>
								<strong>CEP:</strong> {contact.cep}
							</p>
						</CardContent>
					)}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
						{isDeleting ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								Excluindo...
							</>
						) : (
							"Yes, Delete This Contact!"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
