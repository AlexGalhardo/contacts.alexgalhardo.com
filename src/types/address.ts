export interface CepResponseInterface {
	cep: string;
	logradouro: string;
	bairro: string;
	localidade: string;
	uf: string;
	erro?: boolean;
}

export interface AddressDataInterface {
	cep: string;
	street: string;
	neighborhood: string;
	city: string;
	state: string;
}