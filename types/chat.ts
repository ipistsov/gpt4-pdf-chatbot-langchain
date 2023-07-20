export type Source = {
	source: string,
	message: string
}

export type Message = {
	type: 'apiMessage' | 'userMessage';
	message: string;
	sources?: Source[]
};
