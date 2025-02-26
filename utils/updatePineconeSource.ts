import { pinecone } from '@/utils/pinecone-client';

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME ?? '');

const PINECONE_NAME_SPACE = 'gpt4-langchain';
// State the Current Source here (TO BE REPLACE) - change "\"   with "\\"
const originalSource = "D:\\Coding\\playground\\tesla10k\\gpt4-pdf-chatbot-langchain\\docs\\i-9instr.pdf";
// Print the Actual url link You want to be displayed here:
const sourceToReplaceWith = "https://www.uscis.gov/sites/default/files/document/forms/i-9instr.pdf";

// Fetch vectors that match the specified filter
const fetchResult = await index.query({
	queryRequest: {
		vector: new Array(1536).fill(0),
		namespace: PINECONE_NAME_SPACE,
		filter: {
			"source": { "$eq": originalSource }
		},
		topK: 10000,
		includeMetadata: false
	}
})

// get vectorIds from response
const vectorIdsToUpdate = fetchResult.matches?.map(result => result.id);
console.log("🚀 ~ file: updatePineconeSource.ts:23 ~ vectorIdsToUpdate:", vectorIdsToUpdate?.length)

// update sources for all vectors that were retrieved in the previous query
for (const id of vectorIdsToUpdate!) {
	console.log("🚀 ~ file: updatePineconeSource.ts:27 ~ id:", id)
	await index.update({
		updateRequest: {
			id,
			namespace: PINECONE_NAME_SPACE,
			setMetadata: {
				source: sourceToReplaceWith
			}
		}
	});
}
console.log('Update done!!')