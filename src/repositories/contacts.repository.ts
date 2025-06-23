import { ContactInterface } from "@/src/types/contact";

export class ContactsRepository {
	private readonly dbName = "ContactsDatabase";
	private readonly version = 1;
	private db: IDBDatabase | null = null;

	async init(): Promise<void> {
		return new Promise((resolve, reject) => {
			const request = indexedDB.open(this.dbName, this.version);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => {
				this.db = request.result;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				const db = (event.target as IDBOpenDBRequest).result;

				if (!db.objectStoreNames.contains("contacts")) {
					const contactStore = db.createObjectStore("contacts", { keyPath: "id" });
					contactStore.createIndex("userName", "userName", { unique: false });
					contactStore.createIndex("displayName", "displayName", { unique: false });
					contactStore.createIndex("city", "city", { unique: false });
					contactStore.createIndex("state", "state", { unique: false });
				}

				if (!db.objectStoreNames.contains("recentAddresses")) {
					db.createObjectStore("recentAddresses", { keyPath: "id", autoIncrement: true });
				}

				if (!db.objectStoreNames.contains("filters")) {
					db.createObjectStore("filters", { keyPath: "key" });
				}

				if (!db.objectStoreNames.contains("session")) {
					db.createObjectStore("session", { keyPath: "key" });
				}
			};
		});
	}

	async getAllContacts(): Promise<ContactInterface[]> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["contacts"], "readonly");
			const store = transaction.objectStore("contacts");
			const request = store.getAll();

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result || []);
		});
	}

	async addContact(contact: ContactInterface): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["contacts"], "readwrite");
			const store = transaction.objectStore("contacts");
			const request = store.add(contact);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async updateContact(contactId: string, updatedData: Partial<ContactInterface>): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["contacts"], "readwrite");
			const store = transaction.objectStore("contacts");

			const getRequest = store.get(contactId);
			getRequest.onsuccess = () => {
				const contact = getRequest.result;
				if (contact) {
					const updatedContact = { ...contact, ...updatedData };
					const putRequest = store.put(updatedContact);
					putRequest.onerror = () => reject(putRequest.error);
					putRequest.onsuccess = () => resolve();
				} else {
					reject(new Error("Contact not found"));
				}
			};
			getRequest.onerror = () => reject(getRequest.error);
		});
	}

	async deleteContact(contactId: string): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["contacts"], "readwrite");
			const store = transaction.objectStore("contacts");
			const request = store.delete(contactId);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async getRecentAddresses(): Promise<any[]> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["recentAddresses"], "readonly");
			const store = transaction.objectStore("recentAddresses");
			const request = store.getAll();

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result || []);
		});
	}

	async addRecentAddress(address: any): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["recentAddresses"], "readwrite");
			const store = transaction.objectStore("recentAddresses");
			const request = store.add(address);

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async clearRecentAddresses(): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["recentAddresses"], "readwrite");
			const store = transaction.objectStore("recentAddresses");
			const request = store.clear();

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async getFilters(): Promise<any> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["filters"], "readonly");
			const store = transaction.objectStore("filters");
			const request = store.get("currentFilters");

			request.onerror = () => reject(request.error);
			request.onsuccess = () =>
				resolve(
					request.result?.value || {
						displayName: "",
						city: "",
						state: "",
						street: "",
						neighborhood: "",
						cep: "",
					},
				);
		});
	}

	async saveFilters(filters: any): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["filters"], "readwrite");
			const store = transaction.objectStore("filters");
			const request = store.put({ key: "currentFilters", value: filters });

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}

	async getCurrentPage(): Promise<number> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["session"], "readonly");
			const store = transaction.objectStore("session");
			const request = store.get("currentPage");

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve(request.result?.value || 1);
		});
	}

	async saveCurrentPage(page: number): Promise<void> {
		if (!this.db) await this.init();

		return new Promise((resolve, reject) => {
			const transaction = this.db!.transaction(["session"], "readwrite");
			const store = transaction.objectStore("session");
			const request = store.put({ key: "currentPage", value: page });

			request.onerror = () => reject(request.error);
			request.onsuccess = () => resolve();
		});
	}
}

export const contactsRepository = new ContactsRepository();