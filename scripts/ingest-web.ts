/*     Web Data Loader - https://js.langchain.com/docs/modules/indexes/document_loaders/examples/web_loaders/web_cheerio
Install cheerio with CMD in the folder:       yarn add cheerio    */

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";


const loader = new CheerioWebBaseLoader(
  "https://www.uscis.gov/book/export/html/68600"
);

const rawDocs = await loader.load();

export const run = async () => {
  try {
    /* Split text into chunks - https://js.langchain.com/docs/modules/indexes/text_splitters/examples/recursive_character */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 3000,    // max number of tokens per chunk
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    //embed the documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      namespace: PINECONE_NAME_SPACE,
      textKey: 'text',
    });
  } catch (error) {
    console.log('error', error);
    throw new Error('Failed to ingest your data');
  }
};

(async () => {
  await run();
  console.log('ingestion complete');
})();