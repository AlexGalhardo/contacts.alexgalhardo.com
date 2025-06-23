export interface ContactInterface {
	id: string;
	userName: string;
	displayName: string;
	cep: string;
	street: string;
	neighborhood: string;
	city: string;
	state: string;
}

export interface CepDataInterface {
	street: string;
	neighborhood: string;
	city: string;
	state: string;
	cep: string | number;
}

export interface ContactFiltersInterface {
	displayName: string;
	userName: string;
	city: string;
	state: string;
	street: string;
	neighborhood: string;
	cep: string;
}

export interface ContactStoreInterface {
	contacts: ContactInterface[];
	filters: ContactFiltersInterface;
	currentPage: number;
	addContact: (contact: ContactInterface) => void;
	updateContact: (contactId: string, updatedContact: Partial<ContactFiltersInterface>) => void;
	deleteContact: (contactId: string) => void;
	setFilters: (filters: Partial<ContactFiltersInterface>) => void;
	setCurrentPage: (page: number) => void;
	clearFilters: () => void;
}

export interface SessionStoreInterface {
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