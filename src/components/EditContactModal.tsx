"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { useCepQuery } from "../app/hooks/useCepQuery";
import { useRecentAddresses } from "../app/hooks/useRecentAddresses";
import { CepDataInterface, ContactInterface } from "../app/lib/indexeddb";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface EditContactModalProps {
	isOpen: boolean;
	onClose: () => void;
	contact: ContactInterface | null;
	onSubmit: (contactId: string, updatedData: Partial<ContactInterface>) => void;
	isUpdating: boolean;
}

export default function EditContactModal({ isOpen, onClose, contact, onSubmit, isUpdating }: EditContactModalProps) {
	const { addRecentAddress } = useRecentAddresses();

	const [editContactForm, setEditContactForm] = useState({
		userName: "",
		displayName: "",
		cep: "",
	});

	const [editFormErrors, setEditFormErrors] = useState({
		userName: "",
		displayName: "",
		cep: "",
	});

	const {
		data: editCepData,
		isLoading: isEditCepLoading,
		error: editCepError,
		isError: isEditCepError,
	} = useCepQuery(editContactForm.cep, editContactForm.cep.length === 8) as {
		data: CepDataInterface | undefined;
		isLoading: boolean;
		error: unknown;
		isError: boolean;
	};

	useEffect(() => {
		if (contact) {
			setEditContactForm({
				userName: contact.userName,
				displayName: contact.displayName,
				cep: contact.cep,
			});
		}
	}, [contact]);

	const handleSubmit = async () => {
		if (!contact) return;

		try {
			setEditFormErrors({ userName: "", displayName: "", cep: "" });

			const updateData: Partial<ContactInterface> = {};

			if (editContactForm.userName) updateData.userName = editContactForm.userName;
			if (editContactForm.displayName) updateData.displayName = editContactForm.displayName;

			if (editContactForm.cep && editContactForm.cep.length === 8) {
				if (isEditCepError) {
					setEditFormErrors((prev) => ({ ...prev, cep: "CEP não encontrado!" }));
					return;
				}

				if (editCepData) {
					updateData.cep = editContactForm.cep;
					updateData.street = editCepData.street;
					updateData.neighborhood = editCepData.neighborhood;
					updateData.city = editCepData.city;
					updateData.state = editCepData.state;

					addRecentAddress({
						cep: editContactForm.cep,
						city: editCepData.city,
						state: editCepData.state,
						timestamp: Date.now(),
					});
				}
			}

			onSubmit(contact.id, updateData);
			onClose();
			setEditContactForm({ userName: "", displayName: "", cep: "" });
		} catch (error) {
			console.error("Erro ao editar contato:", error);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px] dark:bg-black">
				<DialogHeader>
					<DialogTitle>Edit Contact</DialogTitle>
				</DialogHeader>
				<div className="space-y-2">
					{editFormErrors.userName && <p className="text-red-500 text-sm">{editFormErrors.userName}</p>}
					<Input
						placeholder="Username"
						value={editContactForm.userName}
						onChange={(e) =>
							setEditContactForm({ ...editContactForm, userName: e.target.value.toUpperCase() })
						}
					/>

					{editFormErrors.displayName && <p className="text-red-500 text-sm">{editFormErrors.displayName}</p>}
					<Input
						placeholder="Display Name"
						value={editContactForm.displayName}
						onChange={(e) =>
							setEditContactForm({ ...editContactForm, displayName: e.target.value.toUpperCase() })
						}
					/>

					{editFormErrors.cep && <p className="text-red-500 text-sm">{editFormErrors.cep}</p>}
					<div className="relative">
						<Input
							placeholder="New CEP"
							value={editContactForm.cep}
							maxLength={8}
							onChange={(e) => {
								const onlyNumbers = e.target.value.replace(/\D/g, "");
								if (onlyNumbers.length <= 8) {
									setEditContactForm({ ...editContactForm, cep: onlyNumbers });
								}
							}}
						/>
						{isEditCepLoading && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />}
					</div>

					{editCepData && (
						<CardContent className="border-gray-200 border shadow px-3 py-3 dark:border-gray-200">
							<p>Street: {editCepData.street.replace("Rua ", "")}</p>
							<p>Neighborhood: {editCepData.neighborhood}</p>
							<p>City: {editCepData.city}</p>
							<p>State: {editCepData.state}</p>
							<p>CEP: {editCepData.cep}</p>
						</CardContent>
					)}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						className="bg-orange-500 hover:bg-orange-600"
						onClick={handleSubmit}
						disabled={isUpdating || isEditCepLoading}
					>
						{isUpdating ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin mr-2" />
								Atualizando...
							</>
						) : (
							"Edit Contact"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
