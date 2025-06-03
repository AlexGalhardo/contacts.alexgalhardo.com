import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

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

interface ContactFilters {
	displayName: string;
	city: string;
	state: string;
	street: string;
	neighborhood: string;
	cep: string;
}

interface ContactStore {
	contacts: ContactInterface[];
	filters: ContactFilters;
	currentPage: number;

	// Actions
	addContact: (contact: ContactInterface) => void;
	updateContact: (contactId: string, updatedContact: Partial<ContactInterface>) => void;
	deleteContact: (contactId: string) => void;
	setFilters: (filters: Partial<ContactFilters>) => void;
	setCurrentPage: (page: number) => void;
	clearFilters: () => void;
}

const initialFilters: ContactFilters = {
	displayName: "",
	city: "",
	state: "",
	street: "",
	neighborhood: "",
	cep: "",
};

export const useContactStore = create<ContactStore>()(
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
					currentPage: 1, // Reset page when filtering
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

// Session storage for temporary data
interface SessionStore {
	lastSearchedCep: string;
	recentAddresses: Array<{
		cep: string;
		street: string;
		neighborhood: string;
		city: string;
		state: string;
	}>;
	setLastSearchedCep: (cep: string) => void;
	addRecentAddress: (address: any) => void;
}

export const useSessionStore = create<SessionStore>()(
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
						recentAddresses: [address, ...state.recentAddresses].slice(0, 5), // Keep only 5 recent
					};
				}),
		}),
		{
			name: "contact-session-storage",
			storage: createJSONStorage(() => sessionStorage),
		},
	),
);
