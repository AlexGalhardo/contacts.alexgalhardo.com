import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useContactStore } from "../store/contactStore";

export const useContactOptimizations = () => {
	const queryClient = useQueryClient();
	const { contacts, filters } = useContactStore();

	// Prefetch related CEPs when browsing contacts
	const prefetchRelatedCeps = (contactList: any[]) => {
		contactList.forEach((contact) => {
			if (contact.cep) {
				queryClient.prefetchQuery({
					queryKey: ["cep", contact.cep],
					queryFn: () => fetch(`https://viacep.com.br/ws/${contact.cep}/json/`).then((res) => res.json()),
					staleTime: 1000 * 60 * 30, // 30 minutes
				});
			}
		});
	};

	// Analytics and insights
	const contactAnalytics = useMemo(() => {
		const cityCount = contacts.reduce(
			(acc, contact) => {
				acc[contact.city] = (acc[contact.city] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		const stateCount = contacts.reduce(
			(acc, contact) => {
				acc[contact.state] = (acc[contact.state] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		return {
			totalContacts: contacts.length,
			uniqueCities: Object.keys(cityCount).length,
			uniqueStates: Object.keys(stateCount).length,
			mostCommonCity: Object.entries(cityCount).sort(([, a], [, b]) => b - a)[0]?.[0],
			mostCommonState: Object.entries(stateCount).sort(([, a], [, b]) => b - a)[0]?.[0],
			cityDistribution: cityCount,
			stateDistribution: stateCount,
		};
	}, [contacts]);

	// Background data refresh
	const backgroundRefresh = () => {
		// Invalidate old CEP data
		queryClient.invalidateQueries({
			queryKey: ["cep"],
			refetchType: "inactive",
		});

		// Prefetch common CEPs
		const commonCeps = [...new Set(contacts.map((c: any) => c.cep))];
		commonCeps.forEach((cep) => {
			queryClient.prefetchQuery({
				queryKey: ["cep", cep],
				queryFn: () => fetch(`https://viacep.com.br/ws/${cep}/json/`).then((res) => res.json()),
			});
		});
	};

	return {
		prefetchRelatedCeps,
		contactAnalytics,
		backgroundRefresh,
	};
};
