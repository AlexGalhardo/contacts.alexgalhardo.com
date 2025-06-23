import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "../store/contactStore";
import { AddressDataInterface } from "@/src/types/address";
import { fetchCepData } from "../lib/fetchCepData";
import { useEffect } from "react";

export const useCepQuery = (cep: string, enabled = true) => {
	const { addRecentAddress, setLastSearchedCep } = useSessionStore();

	const queryResult = useQuery<AddressDataInterface, Error>({
		queryKey: ["cep", cep],
		queryFn: () => fetchCepData(cep),
		enabled: enabled && cep.length === 8,
		staleTime: 1000 * 60 * 30,
		gcTime: 1000 * 60 * 60,
		retry: 2,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	useEffect(() => {
		if (queryResult.isSuccess && queryResult.data) {
			addRecentAddress(queryResult.data);
			setLastSearchedCep(cep);
		}
	}, [queryResult.isSuccess, queryResult.data, addRecentAddress, setLastSearchedCep, cep]);

	useEffect(() => {
		if (queryResult.isError && queryResult.error) {
			console.error("Erro ao buscar CEP:", queryResult.error);
		}
	}, [queryResult.isError, queryResult.error]);

	return queryResult;
};

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
