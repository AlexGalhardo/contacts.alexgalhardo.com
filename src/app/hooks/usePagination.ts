import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { contactsRepository } from "@/src/repositories/contacts.repository";

export function usePagination() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const {
		data: currentPage = 1,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["currentPage"],
		queryFn: async () => {
			await contactsRepository.init();
			return contactsRepository.getCurrentPage();
		},
		staleTime: 10 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
	});

	const saveMutation = useMutation({
		mutationFn: async (page: number) => {
			await contactsRepository.init();
			await contactsRepository.saveCurrentPage(page);
			return page;
		},
		onSuccess: (page) => {
			queryClient.setQueryData(["currentPage"], page);
		},
		onError: () => {
			toast({
				title: "Navigation error",
				description: "Could not save the current page.",
				variant: "error",
			});
		},
	});

	return {
		currentPage,
		isLoading,
		error,
		setCurrentPage: saveMutation.mutate,
		isSaving: saveMutation.isPending,
	};
}
