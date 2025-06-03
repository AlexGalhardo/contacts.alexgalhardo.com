export interface CepResponse {
	cep: string;
	logradouro: string;
	bairro: string;
	localidade: string;
	uf: string;
	erro?: boolean;
}

export interface AddressData {
	cep: string;
	street: string;
	neighborhood: string;
	city: string;
	state: string;
}

export const fetchCepData = async (cep: string): Promise<AddressData> => {
	if (!cep || cep.length !== 8) {
		throw new Error("CEP deve ter 8 dígitos");
	}

	const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

	if (!response.ok) {
		throw new Error("Erro na requisição do CEP");
	}

	const data: CepResponse = await response.json();

	if (data.erro || !data.localidade) {
		throw new Error("CEP não encontrado");
	}

	return {
		cep,
		street: data.logradouro || "",
		neighborhood: data.bairro || "",
		city: data.localidade || "",
		state: data.uf || "",
	};
};
