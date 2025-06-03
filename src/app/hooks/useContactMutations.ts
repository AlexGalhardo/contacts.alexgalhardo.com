import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { useToast } from "../hooks/use-toast";
import { showToast } from "nextjs-toast-notify";
import { useContactStore } from "../store/contactStore";

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

export const useContactMutations = () => {
	// const { toast } = useToast();

	const queryClient = useQueryClient();
	const { addContact, updateContact, deleteContact } = useContactStore();

	const createContactMutation = useMutation({
		mutationFn: async (contactData: Omit<ContactInterface, "id">) => {
			await new Promise((resolve) => setTimeout(resolve, 500));

			const newContact: ContactInterface = {
				...contactData,
				id: Date.now().toString(),
			};

			return newContact;
		},

		onMutate: async (newContactData) => {
			const optimisticContact: ContactInterface = {
				...newContactData,
				id: `temp-${Date.now()}`,
			};

			await queryClient.cancelQueries({ queryKey: ["contacts"] });

			return { optimisticContact };
		},

		onSuccess: (newContact) => {
			addContact(newContact);
			// toast({ title: "Success", description: "Contact created!" });
			showToast.success("Contact created!", {
				duration: 4000,
				progress: true,
				position: "top-center",
				transition: "fadeIn",
				icon: "",
				sound: false,
			});

			queryClient.invalidateQueries({ queryKey: ["contacts"] });
		},

		onError: (_error, _variables, _context) => {
			// toast({ title: "Error", description: "Erro ao criar contato. Tente novamente." });
			showToast.error("Error creating contact", {
				duration: 4000,
				progress: true,
				position: "top-center",
				transition: "fadeIn",
				icon: "",
				sound: false,
			});
		},
	});

	const updateContactMutation = useMutation({
		mutationFn: async ({
			contactId,
			updatedData,
		}: {
			contactId: string;
			updatedData: Partial<ContactInterface>;
		}) => {
			await new Promise((resolve) => setTimeout(resolve, 300));
			return { contactId, updatedData };
		},

		onMutate: async ({ contactId, updatedData }) => {
			await queryClient.cancelQueries({ queryKey: ["contacts"] });

			updateContact(contactId, updatedData);

			return { contactId, updatedData };
		},

		onSuccess: () => {
			// toast({ title: "Success", description: "Contato atualizado com sucesso!" });
			showToast.success("Contact Updated!", {
				duration: 4000,
				progress: true,
				position: "top-center",
				transition: "fadeIn",
				icon: "",
				sound: false,
			});
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
		},

		onError: (_error, _variables, _context) => {
			showToast.error("Error updating contact", {
				duration: 4000,
				progress: true,
				position: "top-center",
				transition: "fadeIn",
				icon: "",
				sound: false,
			});
			// toast({ title: "Error", description: "Erro ao atualizar contato. Tente novamente." });
		},
	});

	const deleteContactMutation = useMutation({
		mutationFn: async (contactId: string) => {
			await new Promise((resolve) => setTimeout(resolve, 200));
			return contactId;
		},

		onMutate: async (contactId) => {
			await queryClient.cancelQueries({ queryKey: ["contacts"] });

			deleteContact(contactId);

			return { contactId };
		},

		onSuccess: () => {
			// toast({ title: "Success", description: "Contato excluído com sucesso!" });
			showToast.success("Contact deleted!", {
				duration: 4000,
				progress: true,
				position: "top-center",
				transition: "fadeIn",
				icon: "",
				sound: false,
			});
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
		},

		onError: (_error, _variables, _context) => {
			showToast.error("Error deleting contact", {
				duration: 4000,
				progress: true,
				position: "top-center",
				transition: "fadeIn",
				icon: "",
				sound: false,
			});
			// toast({ title: "Error", description: "Erro ao excluir contato. Tente novamente." });
		},
	});

	return {
		createContact: createContactMutation.mutate,
		updateContact: updateContactMutation.mutate,
		deleteContact: deleteContactMutation.mutate,

		isCreating: createContactMutation.isPending,
		isUpdating: updateContactMutation.isPending,
		isDeleting: deleteContactMutation.isPending,
	};
};
