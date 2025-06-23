import { ContactFiltersInterface, ContactStoreInterface, SessionStoreInterface } from "@/src/types/contact";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const initialFilters: ContactFiltersInterface = {
	displayName: "",
	userName: "",
	city: "",
	state: "",
	street: "",
	neighborhood: "",
	cep: "",
};

export const useContactStore = create<ContactStoreInterface>()(
	persist(
		(set, _get) => ({
			contacts: [],
			filters: initialFilters,
			currentPage: 1,

			addContact: (contact) =>
				set((state) => ({
					contacts: [...state.contacts, contact],
				})),

			updateContact: (contactId, updatedContact) =>
				set((state) => ({
					contacts: state.contacts.map((contact) =>
						contact.id === contactId ? { ...contact, ...updatedContact } : contact,
					),
				})),

			deleteContact: (contactId) =>
				set((state) => ({
					contacts: state.contacts.filter((contact) => contact.id !== contactId),
				})),

			setFilters: (newFilters) =>
				set((state) => ({
					filters: { ...state.filters, ...newFilters },
					currentPage: 1,
				})),

			setCurrentPage: (page) => set({ currentPage: page }),

			clearFilters: () => set({ filters: initialFilters, currentPage: 1 }),
		}),
		{
			name: "contact-storage",
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				contacts: state.contacts,
				filters: state.filters,
			}),
		},
	),
);

export const useSessionStore = create<SessionStoreInterface>()(
	persist(
		(set, _get) => ({
			lastSearchedCep: "",
			recentAddresses: [],

			setLastSearchedCep: (cep) => set({ lastSearchedCep: cep }),

			addRecentAddress: (address) =>
				set((state) => {
					const exists = state.recentAddresses.find((addr) => addr.cep === address.cep);
					if (exists) return state;

					return {
						recentAddresses: [address, ...state.recentAddresses].slice(0, 5),
					};
				}),
		}),
		{
			name: "contact-session-storage",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);
