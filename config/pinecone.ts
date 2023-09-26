/**
 * Change the namespace to the namespace on Pinecone you'd like to store your NEW embeddings.
 * When you run `npm run ingest`. This namespace will later be used for queries and retrieval.
 */

if (!process.env.PINECONE_INDEX_NAME) {
  throw new Error('Missing Pinecone index name in .env file');
}

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME ?? '';

const PINECONE_NAME_SPACE = 'uscis-family-of-us-citizens'; // ADD HERE (https://gpt4-langchain-8cb711f.svc.us-central1-gcp.pinecone.io)

export { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE };
