import { OpenAI } from 'langchain/llms/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { ConversationalRetrievalQAChain } from 'langchain/chains';
import { allowedClients } from '@/utils/allowedClients';

const generatePrompts = (client: string) => {
	let CONDENSE_PROMPT: string = '';
	let QA_PROMPT: string = '';

	switch (client) {
		case allowedClients.exsy:
			CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

			Chat History:
			{chat_history}
			Follow Up Input: {question}
			Standalone question:`;

			QA_PROMPT = `Your name is Exsy. You are very organized AI Immigration Paralegal, helping immigrants navigate the complexities of the US law.
			You skip the niceties and fluff, instead talking straight to the point providing valuable and actionable information.
			Use the following pieces of context to answer the question at the end.
			If the question does not have a clear answer, ask the user to clarify by asking the question back rephrased in legal terms and requesting required context.
			DO NOT try to make up an answer.
			If the question is not related to the immigration, politely respond that you can help with immigration.
			Also, for immigration questions, please suggest two best follow-up questions - have them listed at the end of the response in the format: "!QUESTIONS!: \nQuestion 1 \nQuestion 2"
			
			{context}
			
			Question: {question}
			Helpful answer in markdown:`;
			return { CONDENSE_PROMPT, QA_PROMPT };

		case allowedClients.lubausa:
			CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

			Chat History:
			{chat_history}
			Follow Up Input: {question}
			Standalone question:`;

			QA_PROMPT = `You are a helpful AI Paralegal, Luba's assistant. You are an expert in immigration law. 
			Use the following pieces of context to answer the question at the end.
			If the question does not have a clear answer, suggest trying to rephrase the question or to discuss the matter with an immigration lawyer. 
			DO NOT try to make up an answer.
			If the question is not related to immigration, politely respond that you can help with immigration related questions.
			Also, in case the primary question is related to immigration, please suggest two best follow-up questions - have them listed at the end of the response in the format: "!QUESTIONS!: \nQuestion 1 \nQuestion 2"
			
			{context}
			
			Question: {question}
			Helpful answer in markdown:`;
			return { CONDENSE_PROMPT, QA_PROMPT };

		default:
			return { CONDENSE_PROMPT, QA_PROMPT };
	}
}

export const makeChain = (vectorstore: PineconeStore, client: string) => {
	const { CONDENSE_PROMPT, QA_PROMPT } = generatePrompts(client);
	const model = new OpenAI({
		temperature: 0, // increase temepreature to get more creative answers
		// modelName: 'gpt-3.5-turbo-16k-0613', //change this to gpt-4 if you have access
		modelName: 'gpt-3.5-turbo',
	});

	const chain = ConversationalRetrievalQAChain.fromLLM(
		model,
		vectorstore.asRetriever(),
		{
			qaTemplate: QA_PROMPT,
			questionGeneratorTemplate: CONDENSE_PROMPT,
			returnSourceDocuments: true, //The number of source documents returned is 4 by default
		},
	);
	return chain;
};

