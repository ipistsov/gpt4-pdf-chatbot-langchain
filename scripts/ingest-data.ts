import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

/* Name of directory to retrieve your files from 
   Make sure to add your PDF files inside the 'docs' folder
*/
const filePath = 'docs';

export const run = async () => {
  try {
    /*load raw docs from the all files in the directory */
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new PDFLoader(path),
    });

    
    // const loader = new PDFLoader(filePath);
    const rawDocs = await directoryLoader.load();

    /* Split text into chunks */
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

    console.log('creating vector store...');
    /*create and store the embeddings in the vectorStore*/
    const embeddings = new OpenAIEmbeddings();
    const index = pinecone.Index(PINECONE_INDEX_NAME); //change to your own index name

    //embed the PDF documents
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


/*     THIS CODE WAS CREATED BY CHAT GPT AUTOMATICALLY, BASED ON 
https://github.com/lubausa/askluba/blob/main/app/Http/Controllers/HomeController.php
Watch out:
1. API KEY in open access
2. Keeps the split by 1000 characters

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { pinecone } from '@/utils/pinecone-client';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { PINECONE_INDEX_NAME, PINECONE_NAME_SPACE } from '@/config/pinecone';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { readFile } from 'fs/promises';
import { JSDOM } from 'jsdom';

interface FileData {
  name: string;
  description: string;
  path: string | null;
  status: string | null;
  parent_id: string | null;
}

const filePath = 'docs';

const aiHelperApiKey = 'da81f75b-eb50-41fe-9a40-cf0f03c74457';
const aiHelperEnvironment = 'us-west1-gcp';

const aiHelper = new AiHelper(aiHelperApiKey, aiHelperEnvironment);

const run = async () => {
  try {
    const directoryLoader = new DirectoryLoader(filePath, {
      '.pdf': (path) => new PDFLoader(path),
    });

    const rawDocs = await directoryLoader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    const docs = await textSplitter.splitDocuments(rawDocs);
    console.log('split docs', docs);

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

class AiHelper {
  private pinecone: Pinecone;

  constructor(apiKey: string, environment: string) {
    this.pinecone = new Pinecone(apiKey, environment);
  }

  async getEmbeddings(description: string) {
    // Implementation of getting embeddings from AI helper
    // Replace this with your actual implementation
    return Promise.resolve({});
  }
}

const addFile = async (text: string, title: string | null, parentId: string | null, status: string | null) => {
  const description = captionF(text);

  for (const fileText of description) {
    const name = md5(microtime() + rand(0, 10) + substr(fileText, 0, 10));

    const isFile = await File.query().where('name', '=', name).first();

    if (!isFile) {
      const fileData: FileData = {
        name,
        description: fileText,
        path: title,
        status,
        parent_id: parentId,
      };

      // Save the fileData to your database or perform any other necessary actions
      // Replace the code below with your actual implementation
      await saveFileData(fileData);

      return fileData.id;
    }
  }

  return false;
};

const saveFileData = async (fileData with cutoff of 2021-09-01, 0 messages total

*/