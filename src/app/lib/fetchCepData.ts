import { AddressDataInterface, CepResponseInterface } from "@/src/types/address";

export const fetchCepData = async (cep: string): Promise<AddressDataInterface> => {
	if (!cep || cep.length !== 8) throw new Error("CEP deve ter 8 dígitos");

	const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

	if (!response.ok) throw new Error("Erro na requisição do CEP");

	const data: CepResponseInterface = await response.json();

	if (data.erro || !data.localidade) throw new Error("CEP não encontrado");

	return {
		cep,
		street: data.logradouro || "",
		neighborhood: data.bairro || "",
		city: data.localidade || "",
		state: data.uf || "",
	};
};
