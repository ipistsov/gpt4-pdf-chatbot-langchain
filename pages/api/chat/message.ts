import type { NextApiRequest, NextApiResponse } from 'next';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import excuteQuery from '@/config/db';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	//only accept post requests
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	// extract hash and question from the request body
	const [hash, question] = req.body;

	if (!question || !hash) {
		return res.status(400).json({ message: 'No question or hash in the request' });
	}

	// OpenAI recommends replacing newlines with spaces for best results
	const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

	try {
		// get the last 10 questions of the user with this hash
		let history = await excuteQuery({
			query: 'SELECT * FROM history WHERE hash = ? ORDER BY created_at DESC LIMIT 10',
			values: [hash]
		}) as any[];

		// if the question is same and response is still pending return empty response
		if (history[0]?.question === sanitizedQuestion) {
			if (history[0]?.pending) {
				return res.status(200).json({
					success: true,
					data: "",
					keywords: "",
					sourceData: [],
				});
			} else {
				// if the response is not pending, return the answer
				return res.status(200).json({
					success: true,
					data: history[0].answer ?? "",
					keywords: "",
					sourceData: history[0].source_data ?? [],
				});
			}
		}

		// get the question history of current user for context
		history = history.reverse().map(record => {
			return [record.question, record.answer]
		})

		// insert the question in database
		const insertedRecord = await excuteQuery({
			query: 'INSERT INTO history(hash, question) VALUES(?, ?);',
			values: [hash, sanitizedQuestion]
		}) as any;


		/* create vectorstore*/
		PineconeStore.fromExistingIndex(
			new OpenAIEmbeddings({}),
			{
				pineconeIndex: pinecone.Index(PINECONE_INDEX_NAME),
				textKey: 'text',
				namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
			},
		)
			.then(async vectorStore => {
				//create chain
				const chain = makeChain(vectorStore);
				//Ask a question using chat history
				return await chain.call({
					question: sanitizedQuestion,
					chat_history: history || [],
				});
			})
			.then(response => {
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
				return {
					text: response.text,
					sourceData
				}
			})
			.then(async sanitizedResponse => {
				// save the response in database
				await excuteQuery({
					query: 'UPDATE history SET pending = 0, answer = ?, source_data = ? WHERE id = ?;',
					values: [
						sanitizedResponse.text,
						JSON.stringify(sanitizedResponse.sourceData),
						insertedRecord.insertId]
				})
			})
			.catch(console.error);

		// return empty response after OpenAI API has been triggered
		return res.status(200).json({
			success: true,
			data: "",
			keywords: "",
			sourceData: [],
		});
	} catch (error: any) {
		console.error('Error from message API', error);
		res.status(500).json({
			success: false,
			error: error.message || 'Something went wrong'
		});
	}
}
