"use client";

import { ContactInterface } from "../types/contact";
import { useMemo } from "react";
import ContactCard from "./ContactCard";
import Pagination from "./Pagination";

interface ContactListProps {
	contacts: ContactInterface[];
	filteredContacts: ContactInterface[];
	currentPage: number;
	onPageChange: (page: number) => void;
	onEdit: (contact: ContactInterface) => void;
	onDelete: (contact: ContactInterface) => void;
	isUpdating: boolean;
	isDeleting: boolean;
}

export default function ContactList({
	contacts,
	filteredContacts,
	currentPage,
	onPageChange,
	onEdit,
	onDelete,
	isUpdating,
	isDeleting,
}: ContactListProps) {
	const itemsPerPage = 10;
	const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);

	const paginatedContacts = useMemo(() => {
		return filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
	}, [filteredContacts, currentPage, itemsPerPage]);

	return (
		<div className="space-y-4">
			{totalPages > 1 && (
				<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
			)}

			{paginatedContacts.length > 0 ? (
				<div className="space-y-3">
					{paginatedContacts.map((contact) => (
						<ContactCard
							key={contact.id}
							contact={contact}
							onEdit={onEdit}
							onDelete={onDelete}
							isUpdating={isUpdating}
							isDeleting={isDeleting}
						/>
					))}
				</div>
			) : (
				<div className="py-12 text-center">
					<p className="text-slate-500 dark:text-slate-400">
						{filteredContacts.length === 0 && contacts.length > 0
							? "No contacts found with these filters"
							: "No contacts found"}
					</p>
				</div>
			)}

			{totalPages > 1 && (
				<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
			)}
		</div>
	);
}
