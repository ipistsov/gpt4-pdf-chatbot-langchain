import { pinecone } from '@/utils/pinecone-client';

const index = pinecone.Index(process.env.PINECONE_INDEX_NAME ?? '');

const PINECONE_NAME_SPACE = 'gpt4-langchain';
const sourceToDelete = "https://www.uscis.gov/book/export/html/68600";

// Fetch vectors that match the specified filter
const fetchResult = await index.query({
	queryRequest: {
		vector: new Array(1536).fill(0),
		namespace: PINECONE_NAME_SPACE,
		filter: {
			"source": { "$eq": sourceToDelete }
		},
		topK: 10000,
		includeMetadata: false
	}
})

// get vectorIds from response
const vectorIdsToDelete = fetchResult.matches!.map(result => result.id);
console.log("🚀 ~ file: deleteVectorsOfASource.ts:23 ~ vectorIdsToDelete:", vectorIdsToDelete)

// Maximum chunk size
const chunkSize = 1000;

// Function to split an array into chunks
function chunkArray(array: string[], chunkSize: number) {
	const chunks = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
}

// Split the vectorIdsToDelete into chunks
const chunks = chunkArray(vectorIdsToDelete, chunkSize);

// Iterate over each chunk and run the delete1 operation
for (const chunk of chunks) {
	await index.delete1({
		ids: chunk,
		namespace: PINECONE_NAME_SPACE
	});
}

console.log('Deletion done!!')