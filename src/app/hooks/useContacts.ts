import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { contactsRepository } from "@/src/repositories/contacts.repository";
import { ContactInterface } from "@/src/types/contact";

export function useContacts() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const {
		data: contacts = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["contacts"],
		queryFn: async () => {
			await contactsRepository.init();
			return contactsRepository.getAllContacts();
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});

	const createMutation = useMutation({
		mutationFn: async (contact: ContactInterface) => {
			await contactsRepository.init();
			await contactsRepository.addContact(contact);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			toast({
				title: "Contact created!",
				description: "The contact was successfully added.",
				variant: "success",
			});
		},
		onError: () => {
			toast({
				title: "Error creating contact",
				description: "Could not add the contact. Please try again.",
				variant: "error",
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: async ({
			contactId,
			updatedData,
		}: { contactId: string; updatedData: Partial<ContactInterface> }) => {
			await contactsRepository.init();
			await contactsRepository.updateContact(contactId, updatedData);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			toast({
				title: "Contact updated!",
				description: "Changes were saved successfully.",
				variant: "success",
			});
		},
		onError: () => {
			toast({
				title: "Error updating contact",
				description: "Could not save the changes. Please try again.",
				variant: "error",
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (contactId: string) => {
			await contactsRepository.init();
			await contactsRepository.deleteContact(contactId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contacts"] });
			toast({
				title: "Contact deleted!",
				description: "The contact was successfully removed.",
				variant: "success",
			});
		},
		onError: () => {
			toast({
				title: "Error deleting contact",
				description: "Could not remove the contact. Please try again.",
				variant: "error",
			});
		},
	});

	return {
		contacts,
		isLoading,
		error,
		createContact: createMutation.mutate,
		updateContact: updateMutation.mutate,
		deleteContact: deleteMutation.mutate,
		isCreating: createMutation.isPending,
		isUpdating: updateMutation.isPending,
		isDeleting: deleteMutation.isPending,
	};
}
