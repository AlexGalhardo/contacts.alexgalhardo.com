"use client";

import { Button } from "./ui/button";
import { CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { useRecentAddresses } from "../app/hooks/useRecentAddresses";
import { contactSchema } from "../app/lib/schemas/contact.schema";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";
import { CepDataInterface, ContactInterface } from "../types/contact";
import { useCepQuery, usePrefetchCep } from "../app/hooks/useCepQuery";

interface ContactFormProps {
	onSubmit: (contact: ContactInterface) => void;
	isSubmitting: boolean;
}

export default function ContactForm({ onSubmit, isSubmitting }: ContactFormProps) {
	const { prefetchCep } = usePrefetchCep();
	const { recentAddresses, addRecentAddress } = useRecentAddresses();

	const [form, setForm] = useState({
		userName: "",
		displayName: "",
		cep: "",
	});

	const [formErrors, setFormErrors] = useState({
		userName: "",
		displayName: "",
		cep: "",
	});

	const {
		data: cepData,
		isLoading: isCepLoading,
		error: cepError,
		isError: isCepError,
	} = useCepQuery(form.cep, form.cep.length === 8);

	useEffect(() => {
		if (form.cep.length >= 5) {
			const timeout = setTimeout(() => {
				prefetchCep(form.cep);
			}, 300);
			return () => clearTimeout(timeout);
		}
	}, [form.cep, prefetchCep]);

	const handleSubmit = async () => {
		try {
			setFormErrors({ userName: "", displayName: "", cep: "" });

			const validatedData = contactSchema.parse(form);

			if (isCepError) {
				setFormErrors((prev) => ({ ...prev, cep: "CEP não encontrado!" }));
				return;
			}

			if (!cepData) {
				setFormErrors((prev) => ({ ...prev, cep: "Aguarde a validação do CEP" }));
				return;
			}

			const contactData = {
				id: Date.now().toString(),
				...validatedData,
				street: (cepData as CepDataInterface).street,
				neighborhood: (cepData as CepDataInterface).neighborhood,
				city: (cepData as CepDataInterface).city,
				state: (cepData as CepDataInterface).state,
				cep: String((cepData as CepDataInterface).cep),
			};

			onSubmit(contactData);

			addRecentAddress({
				cep: contactData.cep,
				city: contactData.city,
				state: contactData.state,
				timestamp: Date.now(),
			});

			setForm({ userName: "", displayName: "", cep: "" });
		} catch (error) {
			if (error instanceof z.ZodError) {
				const newErrors = { userName: "", displayName: "", cep: "" };
				error.errors.forEach((err) => {
					const field = err.path[0] as keyof typeof newErrors;
					if (field in newErrors) {
						newErrors[field] = err.message;
					}
				});
				setFormErrors(newErrors);
			}
		}
	};

	return (
		<div className="space-y-4">
			<h2 className="text-green-600 font-bold text-xl">Add Contact</h2>
			<div className="space-y-3">
				{formErrors.userName && <p className="text-red-500 text-sm">{formErrors.userName}</p>}
				<Input
					placeholder="Username"
					value={form.userName}
					onChange={(e) => {
						const onlyLetters = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
						setForm({ ...form, userName: onlyLetters });
					}}
					className="w-full"
				/>

				{formErrors.displayName && <p className="text-red-500 text-sm">{formErrors.displayName}</p>}
				<Input
					placeholder="Display Name"
					value={form.displayName}
					onChange={(e) => setForm({ ...form, displayName: e.target.value.toUpperCase() })}
					className="w-full"
				/>

				{formErrors.cep && <p className="text-red-500 text-sm">{formErrors.cep}</p>}
				<div className="relative">
					<Input
						placeholder="CEP"
						value={form.cep}
						onChange={(e) => {
							const value = e.target.value.replace(/\D/g, "");
							if (value.length <= 8) {
								setForm({ ...form, cep: value });
							}
						}}
						className="w-full"
					/>
					{isCepLoading && <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />}
				</div>

				{cepData &&
				typeof cepData === "object" &&
				cepData !== null &&
				"street" in (cepData as CepDataInterface) ? (
					<CardContent className="border-gray-200 border shadow px-3 py-3 dark:border-gray-200 text-sm">
						<p>Street: {(cepData as CepDataInterface).street.replace("Rua ", "")}</p>
						<p>Neighborhood: {(cepData as CepDataInterface).neighborhood}</p>
						<p>City: {(cepData as CepDataInterface).city}</p>
						<p>State: {(cepData as CepDataInterface).state}</p>
						<p>CEP: {(cepData as CepDataInterface).cep}</p>
					</CardContent>
				) : null}

				{recentAddresses.length > 0 && (
					<div className="mt-4">
						<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Recent Addresses:</p>
						<div className="space-y-1">
							{recentAddresses.slice(0, 3).map((addr, index) => (
								<Button
									key={index}
									variant="ghost"
									size="sm"
									className="text-xs p-2 h-auto w-full justify-start"
									onClick={() => setForm({ ...form, cep: addr.cep })}
								>
									{addr.cep} - {addr.city}, {addr.state}
								</Button>
							))}
						</div>
					</div>
				)}

				<Button
					onClick={handleSubmit}
					disabled={isSubmitting || isCepLoading}
					className="bg-green-600 hover:bg-green-700 text-white w-full"
				>
					{isSubmitting ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin mr-2" />
							Criando...
						</>
					) : (
						"Add Contact"
					)}
				</Button>
			</div>
		</div>
	);
}
