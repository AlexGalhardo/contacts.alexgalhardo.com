import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddressData, fetchCepData } from "../api/cepApi";
import { useSessionStore } from "../store/contactStore";

export const useCepQuery = (cep: string, enabled = true) => {
	const { addRecentAddress, setLastSearchedCep } = useSessionStore();

	return useQuery({
		queryKey: ["cep", cep],
		queryFn: () => fetchCepData(cep),
		enabled: enabled && cep.length === 8,
		staleTime: 1000 * 60 * 30, // 30 minutes
		gcTime: 1000 * 60 * 60, // 1 hour
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

		onSuccess: (data: AddressData) => {
			addRecentAddress(data);
			setLastSearchedCep(cep);
		},

		onError: (error: any) => {
			console.error("Erro ao buscar CEP:", error);
		},
	});
};

// Hook for prefetching CEPs
export const usePrefetchCep = () => {
	const queryClient = useQueryClient();

	const prefetchCep = (cep: string) => {
		if (cep.length === 8) {
			queryClient.prefetchQuery({
				queryKey: ["cep", cep],
				queryFn: () => fetchCepData(cep),
				staleTime: 1000 * 60 * 30,
			});
		}
	};

	return { prefetchCep };
};
