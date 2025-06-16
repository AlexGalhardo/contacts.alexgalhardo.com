"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import HeaderComponent from "@/src/components/HeaderComponent";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useCepQuery, usePrefetchCep } from "./hooks/useCepQuery";
import { useContactMutations } from "./hooks/useContactMutations";
import { useContactStore, useSessionStore } from "./store/contactStore";
import { contactSchema } from "./utils/schemas/contact.schema";

interface ContactInterface {
	id: string;
	userName: string;
	displayName: string;
	cep: string;
	street: string;
	neighborhood: string;
	city: string;
	state: string;
}

export default function HomePage() {
	const queryClient = useQueryClient();
	const { prefetchCep } = usePrefetchCep();

	const { contacts, filters, currentPage, setFilters, setCurrentPage, clearFilters } = useContactStore();

	const { recentAddresses } = useSessionStore();

	const {
		createContact,
		updateContact: updateContactMutation,
		deleteContact: deleteContactMutation,
		isCreating,
		isUpdating,
		isDeleting,
	} = useContactMutations();

	const [form, setForm] = useState({
		userName: "",
		displayName: "",
		cep: "",
	});

	const [editContactForm, setEditContactForm] = useState({
		userName: "",
		displayName: "",
		cep: "",
	});

	const [editingContact, setEditingContact] = useState<ContactInterface | null>(null);
	const [contactToDelete, setContactToDelete] = useState<ContactInterface | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

	const [formErrors, setFormErrors] = useState({
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
		data: cepData,
		isLoading: isCepLoading,
		error: cepError,
		isError: isCepError,
	} = useCepQuery(form.cep, form.cep.length === 8);

	interface CepData {
		street: string;
		neighborhood: string;
		city: string;
		state: string;
		cep: string | number;
	}

	const {
		data: editCepData,
		isLoading: isEditCepLoading,
		error: editCepError,
		isError: isEditCepError,
	} = useCepQuery(editContactForm.cep, editContactForm.cep.length === 8) as {
		data: CepData | undefined;
		isLoading: boolean;
		error: unknown;
		isError: boolean;
	};

	const filteredContacts = useMemo(() => {
		return contacts.filter(
			(contact) =>
				(!filters.displayName ||
					contact.displayName.toLowerCase().includes(filters.displayName.toLowerCase())) &&
				(!filters.city || contact.city.toLowerCase().includes(filters.city.toLowerCase())) &&
				(!filters.state || contact.state.toLowerCase().includes(filters.state.toLowerCase())) &&
				(!filters.street || contact.street.toLowerCase().includes(filters.street.toLowerCase())) &&
				(!filters.neighborhood ||
					contact.neighborhood.toLowerCase().includes(filters.neighborhood.toLowerCase())) &&
				(!filters.cep || contact.cep.toLowerCase().includes(filters.cep.toLowerCase())),
		);
	}, [contacts, filters]);

	const itemsPerPage = 3;
	const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
	const paginatedContacts = useMemo(() => {
		return filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	}, [filteredContacts, currentPage, itemsPerPage]);

	useEffect(() => {
		if (form.cep.length >= 5) {
			const timeout = setTimeout(() => {
				prefetchCep(form.cep);
			}, 300);
			return () => clearTimeout(timeout);
		}
	}, [form.cep, prefetchCep]);

	const handleRegisterNewContact = async () => {
		try {
			setFormErrors({ userName: "", displayName: "", cep: "" });

			const validatedData = contactSchema.parse(form);

			if (isCepError) {
				setFormErrors((prev) => ({ ...prev, cep: "CEP não encontrado!" }));
				return;
			}

			if (!cepData) {
				setFormErrors((prev) => ({ ...prev, cep: "Aguarde a validação do CEP" }));
				return;
			}

			const contactData = {
				...validatedData,
				street: (cepData as { street: string }).street,
				neighborhood: (cepData as { neighborhood: string }).neighborhood,
				city: (cepData as { city: string }).city,
				state: (cepData as { state: string }).state,
				cep: String((cepData as { cep: string | number }).cep),
			};

			createContact(contactData);

			setForm({ userName: "", displayName: "", cep: "" });

			queryClient.removeQueries({ queryKey: ["cep", form.cep] });
		} catch (error) {
			if (error instanceof z.ZodError) {
				const newErrors = { userName: "", displayName: "", cep: "" };
				error.errors.forEach((err) => {
					const field = err.path[0] as keyof typeof newErrors;
					if (field in newErrors) {
						newErrors[field] = err.message;
					}
				});
				setFormErrors(newErrors);
			}
		}
	};

	const handleEditContact = async () => {
		if (!editingContact) return;

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
				}
			}

			updateContactMutation({
				contactId: editingContact.id,
				updatedData: updateData,
			});

			setIsEditModalOpen(false);
			setEditContactForm({ userName: "", displayName: "", cep: "" });
		} catch (error) {
			console.error("Erro ao editar contato:", error);
		}
	};

	const handleDeleteContact = async () => {
		if (!contactToDelete) return;

		deleteContactMutation(contactToDelete.id);
		setIsDeleteModalOpen(false);
	};

	const openEditModal = (contact: ContactInterface) => {
		setEditingContact(contact);
		setEditContactForm({
			userName: contact.userName,
			displayName: contact.displayName,
			cep: contact.cep,
		});
		setIsEditModalOpen(true);
	};

	const openDeleteModal = (contact: ContactInterface) => {
		setContactToDelete(contact);
		setIsDeleteModalOpen(true);
	};

	const Pagination = () => {
		if (totalPages <= 1) return null;

		return (
			<div className="flex items-center justify-center gap-2 py-4">
				<Button
					variant="outline"
					size="icon"
					onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
					disabled={currentPage === 1}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<span className="text-sm">
					Página {currentPage} de {totalPages}
				</span>
				<Button
					variant="outline"
					size="icon"
					onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
					disabled={currentPage === totalPages}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		);
	};

	return (
		<>
			<HeaderComponent />

			<main className="max-w-4xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="space-y-6 col-span-1">
					<h2 className="text-green-600 font-bold text-2xl">Add Contact</h2>
					<div className="space-y-2">
						{formErrors.userName && <p className="text-red-500 text-sm">{formErrors.userName}</p>}
						<Input
							placeholder="Username"
							value={form.userName}
							onChange={(e) => setForm({ ...form, userName: e.target.value.toUpperCase() })}
						/>

						{formErrors.displayName && <p className="text-red-500 text-sm">{formErrors.displayName}</p>}
						<Input
							placeholder="Display Name"
							value={form.displayName}
							onChange={(e) => setForm({ ...form, displayName: e.target.value.toUpperCase() })}
						/>

						{formErrors.cep && <p className="text-red-500 text-sm">{formErrors.cep}</p>}
						<div className="relative">
							<Input
								placeholder="CEP"
								value={form.cep}
								onChange={(e) => {
									const value = e.target.value.replace(/\D/g, "");
									if (value.length <= 8) {
										setForm({ ...form, cep: value });
									}
								}}
							/>
							{isCepLoading && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />}
						</div>

						{cepData && (
							<CardContent className="border-gray-200 border shadow px-3 py-3 dark:border-gray-200">
								<p>Street: {(cepData as CepData).street.replace("Rua ", "")}</p>
								<p>Neighborhood: {(cepData as CepData).neighborhood}</p>
								<p>City: {(cepData as CepData).city}</p>
								<p>State: {(cepData as CepData).state}</p>
								<p>CEP: {(cepData as CepData).cep}</p>
							</CardContent>
						)}

						{recentAddresses.length > 0 && (
							<div className="mt-4">
								<p className="text-sm text-gray-600 mb-2">Endereços recentes:</p>
								<div className="space-y-1">
									{recentAddresses.slice(0, 3).map((addr, index) => (
										<Button
											key={index}
											variant="ghost"
											size="sm"
											className="text-xs p-1 h-auto"
											onClick={() => setForm({ ...form, cep: addr.cep })}
										>
											{addr.cep} - {addr.city}, {addr.state}
										</Button>
									))}
								</div>
							</div>
						)}

						<Button
							onClick={handleRegisterNewContact}
							disabled={isCreating || isCepLoading}
							className="bg-green-600 hover:bg-green-700 text-white w-full"
						>
							{isCreating ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin mr-2" />
									Criando...
								</>
							) : (
								"Add Contact"
							)}
						</Button>
					</div>
				</div>

				<div className="space-y-6 col-span-2">
					<div className="flex justify-between items-center">
						<h2 className="text-orange-600 font-bold text-2xl">Search Contact</h2>
						{Object.values(filters).some((value) => value !== "") && (
							<Button variant="outline" onClick={clearFilters} size="sm">
								Clean Filters
							</Button>
						)}
					</div>

					<div className="space-y-2">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
							<Input
								placeholder="Search Display Name"
								value={filters.displayName}
								onChange={(e) => setFilters({ displayName: e.target.value })}
							/>
							<Input
								placeholder="Search City"
								value={filters.city}
								onChange={(e) => setFilters({ city: e.target.value })}
							/>
							<Input
								placeholder="Search State (abbreviations, ex: SP)"
								value={filters.state}
								onChange={(e) => setFilters({ state: e.target.value })}
							/>
							<Input
								placeholder="Search Street"
								value={filters.street}
								onChange={(e) => setFilters({ street: e.target.value })}
							/>
							<Input
								placeholder="Search Neighborhood"
								value={filters.neighborhood}
								onChange={(e) => setFilters({ neighborhood: e.target.value })}
							/>
							<Input
								placeholder="Search CEP"
								value={filters.cep}
								maxLength={8}
								onChange={(e) => {
									const onlyNumbers = e.target.value.replace(/\D/g, "");
									if (onlyNumbers.length <= 8) {
										setFilters({ cep: onlyNumbers });
									}
								}}
							/>
						</div>
					</div>

					<div className="space-y-4">
						{paginatedContacts.length > 0 ? (
							<>
								{totalPages > 1 && <Pagination />}
								{paginatedContacts.map((contact) => (
									<Card key={contact.id} className="shadow-md">
										<CardContent className="space-y-2">
											<div className="flex justify-between items-center">
												<div className="text-lg font-semibold">{contact.displayName}</div>
												<div className="flex gap-2">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => openEditModal(contact)}
														disabled={isUpdating}
														className="border-[1px] border-orange-500 rounded-s-sm hover:bg-orange-600 group"
													>
														{isUpdating ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<Pencil className="h-4 w-4 text-orange-500 group-hover:text-white" />
														)}
													</Button>

													<Button
														variant="ghost"
														size="icon"
														onClick={() => openDeleteModal(contact)}
														disabled={isDeleting}
														className="border-[1px] border-rose-500 rounded-s-sm hover:bg-rose-600 group"
													>
														{isDeleting ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															<Trash2 className="h-4 w-4 text-rose-500 group-hover:text-white" />
														)}
													</Button>
												</div>
											</div>
											<p>
												<strong>Username:</strong> {contact.userName}
											</p>
											<p>
												<strong>Address:</strong> {contact.street}, {contact.neighborhood}
											</p>
											<p>
												<strong>City:</strong> {contact.city} - {contact.state}
											</p>
											<p>
												<strong>CEP:</strong> {contact.cep}
											</p>
										</CardContent>
									</Card>
								))}
							</>
						) : (
							<div className="py-12 text-center">
								<p className="text-slate-500">
									{filteredContacts.length === 0 && contacts.length > 0
										? "No contacts found with these filters"
										: "No contacts found"}
								</p>
							</div>
						)}
					</div>
				</div>
			</main>

			<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
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

						{editFormErrors.displayName && (
							<p className="text-red-500 text-sm">{editFormErrors.displayName}</p>
						)}
						<Input
							placeholder="Search Display Name"
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
						<Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
							Cancel
						</Button>
						<Button
							className="bg-orange-500 hover:bg-orange-600"
							onClick={handleEditContact}
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

			<Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Confirm Delete</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this contact? This action cannot be undone!
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						{contactToDelete && (
							<CardContent className="border-gray-200 border shadow px-3 py-3 dark:border-gray-200">
								<p>
									<strong>Username:</strong> {contactToDelete.userName}
								</p>
								<p>
									<strong>Display Name:</strong> {contactToDelete.displayName}
								</p>
								<p>
									<strong>Street:</strong> {contactToDelete.street.replace("Rua ", "")}
								</p>
								<p>
									<strong>Neighborhood:</strong> {contactToDelete.neighborhood}
								</p>
								<p>
									<strong>City:</strong> {contactToDelete.city}
								</p>
								<p>
									<strong>State:</strong> {contactToDelete.state}
								</p>
								<p>
									<strong>CEP:</strong> {contactToDelete.cep}
								</p>
							</CardContent>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDeleteContact} disabled={isDeleting}>
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
		</>
	);
}
