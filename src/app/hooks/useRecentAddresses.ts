import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { contactsRepository } from "@/src/repositories/contacts.repository";

export function useRecentAddresses() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const {
		data: recentAddresses = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["recentAddresses"],
		queryFn: async () => {
			await contactsRepository.init();
			return contactsRepository.getRecentAddresses();
		},
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});

	const addMutation = useMutation({
		mutationFn: async (address: any) => {
			await contactsRepository.init();
			const current = await contactsRepository.getRecentAddresses();
			if (current.length >= 10) {
				await contactsRepository.clearRecentAddresses();
			}
			await contactsRepository.addRecentAddress(address);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recentAddresses"] });
		},
		onError: () => {
			toast({
				title: "Error saving address",
				description: "Could not save the recent address.",
				variant: "error",
			});
		},
	});

	return {
		recentAddresses,
		isLoading,
		error,
		addRecentAddress: addMutation.mutate,
		isAdding: addMutation.isPending,
	};
}
