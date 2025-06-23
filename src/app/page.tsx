"use client";

import Sidebar from "../components/Sidebar";
import ContactList from "../components/ContactList";
import EditContactModal from "../components/EditContactModal";
import DeleteContactModal from "../components/DeleteContactModal";
import { useContacts } from "./hooks/useContacts";
import { useFilters } from "./hooks/useFilters";
import { usePagination } from "./hooks/usePagination";
import { ContactInterface } from "../types/contact";
import { useMemo, useState } from "react";

export default function HomePage() {
	const { contacts, createContact, updateContact, deleteContact, isCreating, isUpdating, isDeleting } = useContacts();
	const { filters } = useFilters();
	const { currentPage, setCurrentPage } = usePagination();

	const [editingContact, setEditingContact] = useState<ContactInterface | null>(null);
	const [contactToDelete, setContactToDelete] = useState<ContactInterface | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

	const handleCreateContact = (contact: ContactInterface) => {
		createContact(contact);
	};

	const handleUpdateContact = (contactId: string, updatedData: Partial<ContactInterface>) => {
		updateContact({ contactId, updatedData });
	};

	const handleDeleteContact = () => {
		if (contactToDelete) {
			deleteContact(contactToDelete.id);
			setIsDeleteModalOpen(false);
		}
	};

	const openEditModal = (contact: ContactInterface) => {
		setEditingContact(contact);
		setIsEditModalOpen(true);
	};

	const openDeleteModal = (contact: ContactInterface) => {
		setContactToDelete(contact);
		setIsDeleteModalOpen(true);
	};

	const handlePageReset = () => {
		setCurrentPage(1);
	};

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-950">
			<div className="max-w-6xl mx-auto flex">
				<Sidebar
					onSubmitContact={handleCreateContact}
					isSubmitting={isCreating}
					onPageReset={handlePageReset}
				/>

				<main className="flex-1 p-6">
					<div className="max-w-2xl">
						<ContactList
							contacts={contacts}
							filteredContacts={filteredContacts}
							currentPage={currentPage}
							onPageChange={setCurrentPage}
							onEdit={openEditModal}
							onDelete={openDeleteModal}
							isUpdating={isUpdating}
							isDeleting={isDeleting}
						/>
					</div>
				</main>
			</div>

			<EditContactModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				contact={editingContact}
				onSubmit={handleUpdateContact}
				isUpdating={isUpdating}
			/>

			<DeleteContactModal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				contact={contactToDelete}
				onConfirm={handleDeleteContact}
				isDeleting={isDeleting}
			/>
		</div>
	);
}
