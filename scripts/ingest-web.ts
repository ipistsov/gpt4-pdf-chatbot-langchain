/*     Web Data Loader - https://js.langchain.com/docs/modules/indexes/document_loaders/examples/web_loaders/web_cheerio
Install cheerio with CMD in the folder:       yarn add cheerio    */

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";

/* Sources:
   USCIS Policy Manual - "https://www.uscis.gov/book/export/html/68600"  
   INA Immigration & Nationality Act - "https://uscode.house.gov/view.xhtml;jsessionid=5B1AC77B70A711A0E8C6FC38A3149193?req=granuleid%3AUSC-prelim-title8&saved=%7CZ3JhbnVsZWlkOlVTQy1wcmVsaW0tdGl0bGU4LXNlY3Rpb24xMTAx%7C%7C%7C0%7Cfalse%7Cprelim&edition=prelim"
          */
  
const loader = new CheerioWebBaseLoader(
  "https://uscode.house.gov/view.xhtml;jsessionid=5B1AC77B70A711A0E8C6FC38A3149193?req=granuleid%3AUSC-prelim-title8&saved=%7CZ3JhbnVsZWlkOlVTQy1wcmVsaW0tdGl0bGU4LXNlY3Rpb24xMTAx%7C%7C%7C0%7Cfalse%7Cprelim&edition=prelim"
);

const rawDocs = await loader.load();


 /* Split text into chunks. Set ChunkSize & Overlap - https://js.langchain.com/docs/modules/indexes/text_splitters/examples/recursive_character */

export const run = async () => {
  try {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 4000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    /*create and store the embeddings in the vectorStore - Update index name and more at .env*/
    console.log('creating vector store...');
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

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