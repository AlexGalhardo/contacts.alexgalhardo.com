"use server";

import { contactsRepository } from "@/src/repositories/contacts.repository";
import { ContactInterface } from "@/src/types/contact";
import { revalidateTag, unstable_cache } from "next/cache";

export const getCachedContacts = unstable_cache(
	async () => {
		await contactsRepository.init();
		return contactsRepository.getAllContacts();
	},
	["contacts"],
	{
		tags: ["contacts"],
		revalidate: 60,
	},
);

export async function createContactAction(contact: ContactInterface) {
	try {
		await contactsRepository.init();
		await contactsRepository.addContact(contact);
		revalidateTag("contacts");
		return { success: true };
	} catch (error) {
		return { success: false, error: "Failed to create contact" };
	}
}

export async function updateContactAction(contactId: string, updatedData: Partial<ContactInterface>) {
	try {
		await contactsRepository.init();
		await contactsRepository.updateContact(contactId, updatedData);
		revalidateTag("contacts");
		return { success: true };
	} catch (error) {
		return { success: false, error: "Failed to update contact" };
	}
}

export async function deleteContactAction(contactId: string) {
	try {
		await contactsRepository.init();
		await contactsRepository.deleteContact(contactId);
		revalidateTag("contacts");
		return { success: true };
	} catch (error) {
		return { success: false, error: "Failed to delete contact" };
	}
}
