import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import { ContactFiltersInterface } from "@/src/types/contact";
import { contactsRepository } from "@/src/repositories/contacts.repository";

const defaultFilters: ContactFiltersInterface = {
	displayName: "",
	userName: "",
	city: "",
	state: "",
	street: "",
	neighborhood: "",
	cep: "",
};

export function useFilters() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	const {
		data: filters = defaultFilters,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["filters"],
		queryFn: async () => {
			await contactsRepository.init();
			return contactsRepository.getFilters();
		},
		staleTime: 10 * 60 * 1000,
		gcTime: 15 * 60 * 1000,
	});

	const saveMutation = useMutation({
		mutationFn: async (newFilters: Partial<ContactFiltersInterface>) => {
			await contactsRepository.init();
			const updatedFilters = { ...filters, ...newFilters };
			await contactsRepository.saveFilters(updatedFilters);
			return updatedFilters;
		},
		onSuccess: (updatedFilters) => {
			queryClient.setQueryData(["filters"], updatedFilters);
		},
		onError: () => {
			toast({
				title: "Error saving filters",
				description: "The search filters could not be saved.",
				variant: "error",
			});
		},
	});

	const clearMutation = useMutation({
		mutationFn: async () => {
			await contactsRepository.init();
			await contactsRepository.saveFilters(defaultFilters);
			return defaultFilters;
		},
		onSuccess: (clearedFilters) => {
			queryClient.setQueryData(["filters"], clearedFilters);
			toast({
				title: "Filters cleared!",
				description: "All filters have been removed.",
				variant: "success",
			});
		},
		onError: () => {
			toast({
				title: "Error clearing filters",
				description: "The filters could not be cleared.",
				variant: "error",
			});
		},
	});

	return {
		filters,
		isLoading,
		error,
		setFilters: saveMutation.mutate,
		clearFilters: clearMutation.mutate,
		isSaving: saveMutation.isPending,
		isClearing: clearMutation.isPending,
	};
}
