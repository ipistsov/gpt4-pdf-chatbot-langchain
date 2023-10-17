import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import excuteQuery from '@/config/db';
import { allowedClients } from '@/utils/allowedClients';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	//only accept post requests
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	// extract hash, text and client from the request body
	// rename text to question
	const { hash, text: question } = req.body;
	let { client } = req.body;

	if (!question || !hash) {
		return res.status(400).json({ message: 'No question or hash in the request' });
	}

	if (!client) {
		// if client is not sent in request, use exsy as default
		client = allowedClients.exsy
	} else if (!Object.keys(allowedClients).includes(client)) {
		// if client is not valid, return error
		return res.status(400).json({ message: 'Invalid client in body' });
	}

	// OpenAI recommends replacing newlines with spaces for best results
	const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

	try {
		// get the last 10 questions of the user with this hash
		let history = await excuteQuery({
			query: 'SELECT * FROM history WHERE hash = ? ORDER BY created_at DESC LIMIT 10',
			values: [hash]
		}) as any[];

		// get the question history of current user for context
		history = history.reverse().map(record => {
			return [record.question, record.answer]
		})

		/* create vectorstore*/
		const vectorStore = await PineconeStore.fromExistingIndex(
			new OpenAIEmbeddings({}),
			{
				pineconeIndex: pinecone.Index(PINECONE_INDEX_NAME),
				textKey: 'text',
				namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
			},
		)

		//create chain
		const chain = makeChain(vectorStore, client);

		//Ask a question using chat history
		const response = await chain.call({
			question: sanitizedQuestion,
			chat_history: history || [],
		});

		// sanitize the response according to our structure
		const sourceData = []
		for (let index = 0; index < response.sourceDocuments.length; index++) {
			if (index >= 3) {
				// get first three sources only
				break;
			}
			sourceData.push({
				message: response.sourceDocuments[index].pageContent,
				source: response.sourceDocuments[index].metadata.source
			})
		}

		const sanitizedResponse = {
			text: response.text,
			sourceData
		};

		let followupQuestions: string[] = []
		// extract the followup questions from the answer
		const splittedText: string = sanitizedResponse.text.split(/!QUESTIONS!: \n|!QUESTIONS!:\n|!QUESTIONS!: /)

		const answer = splittedText[0];

		if (splittedText[1]) {
			// if there are followup questions, create an array of them
			followupQuestions = splittedText[1].split('\n')
		}

		// asynchronously insert the question in database
		excuteQuery({
			query: 'INSERT INTO history(hash, question, answer, followup_questions, source_data, client, pending) VALUES(?, ?, ?, ?, ?, ?, 0);',
			values: [
				hash,
				sanitizedQuestion,
				answer,
				JSON.stringify(followupQuestions),
				JSON.stringify(sanitizedResponse.sourceData),
				client
			]
		}).catch(console.error);

		return res.status(200).json({
			success: true,
			data: answer ?? "",
			keywords: "placeholder",
			sourceData: sanitizedResponse.sourceData ?? [],
			followupQuestions: followupQuestions
		});
	} catch (error: any) {
		console.error('Error from message API', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Something went wrong'
		});
	}
}