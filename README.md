# GPT-4 & LangChain - Create a ChatGPT Chatbot for Your PDF Files 
# Source: https://github.com/mayooear/gpt4-pdf-chatbot-langchain

Use the new GPT-4 api to build a chatGPT chatbot for multiple Large PDF files.

Tech stack used includes LangChain, Pinecone, Typescript, Openai, and Next.js. LangChain is a framework that makes it easier to build scalable AI/LLM apps and chatbots. Pinecone is a vectorstore for storing embeddings and your PDF in text to later retrieve similar docs.

[Tutorial video](https://www.youtube.com/watch?v=ih9PBGVVOO4)

[Join the discord if you have questions](https://discord.gg/E4Mc77qwjm)

The visual guide of this repo and tutorial is in the `visual guide` folder.

**If you run into errors, please review the troubleshooting section further down this page.**

Prelude: Please make sure you have already downloaded node on your system and the version is 18 or greater.

## Development

1. Clone the repo or download the ZIP

```
git clone https://github.com/mayooear/gpt4-pdf-chatbot-langchain
```

2. Install packages

First run `npm install yarn -g` to install yarn globally (if you haven't already).

Then run:

```
yarn install
```

After installation, you should now see a `node_modules` folder.

3. Set up your `.env` file

- Copy `.env.example` into `.env`
  Your `.env` file should look like this:

```
OPENAI_API_KEY=

PINECONE_API_KEY=
PINECONE_ENVIRONMENT=

PINECONE_INDEX_NAME=

```

- Visit [openai](https://help.openai.com/en/articles/4936850-where-do-i-find-my-secret-api-key) to retrieve API keys and insert into your `.env` file.
- Visit [pinecone](https://pinecone.io/) to create and retrieve your API keys, and also retrieve your environment and index name from the dashboard.

4. In the `config` folder, replace the `PINECONE_NAME_SPACE` with a `namespace` where you'd like to store your embeddings on Pinecone when you run `npm run ingest`. This namespace will later be used for queries and retrieval.

5. In `utils/makechain.ts` chain change the `QA_PROMPT` for your own usecase. 
Change `modelName` in `new OpenAI` to `gpt-4`, if you have access to `gpt-4` api. 
!!! Please verify outside this repo that you have access to `gpt-4` api, otherwise the application will not work.

## Convert your PDF files to embeddings

**This repo can load multiple PDF files**

1. Inside `docs` folder, add your pdf files or folders that contain pdf files.

2. Run the script 
- `npm run ingest`  to 'ingest' and embed your PDF docs (make sure all PDFs are in the DOCS folder)
- `npm run ingest-web`  to 'ingest' and embed your WEB docs (make sure to specify the html address at ingest-web.ts)
 If you run into errors troubleshoot below.

3. Check Pinecone dashboard to verify your namespace and vectors have been added.

## Run the app

Once you've verified that the embeddings and content have been successfully added to your Pinecone, 
you can run the app 
`npm run dev` 
to launch the local dev environment, and then type a question in the chat interface.

## Troubleshooting

In general, keep an eye out in the `issues` and `discussions` section of this repo for solutions.

**General errors**

- Make sure you're running the latest Node version. Run `node -v`
- Try a different PDF or convert your PDF to text first. It's possible your PDF is corrupted, scanned, or requires OCR to convert to text.
- `Console.log` the `env` variables and make sure they are exposed.
- Make sure you're using the same versions of LangChain and Pinecone as this repo.
- Check that you've created an `.env` file that contains your valid (and working) API keys, environment and index name.
- If you change `modelName` in `OpenAI`, make sure you have access to the api for the appropriate model.
- Make sure you have enough OpenAI credits and a valid card on your billings account.
- Check that you don't have multiple OPENAPI keys in your global environment. If you do, the local `env` file from the project will be overwritten by systems `env` variable.
- Try to hard code your API keys into the `process.env` variables if there are still issues.

**Pinecone errors**

- Make sure your pinecone dashboard `environment` and `index` matches the one in the `pinecone.ts` and `.env` files.
- Check that you've set the vector dimensions to `1536`.
- Make sure your pinecone namespace is in lowercase.
- Pinecone indexes of users on the Starter(free) plan are deleted after 7 days of inactivity. To prevent this, send an API request to Pinecone to reset the counter before 7 days.
- Retry from scratch with a new Pinecone project, index, and cloned repo.

## Credit

Frontend of this repo is inspired by [langchain-chat-nextjs](https://github.com/zahidkhawaja/langchain-chat-nextjs)


## How to deploy on GCP (suggested by Bing on 6/29/2023). I got stuck on #5. Have not tuned GCP VM either - no OS, nothing


Sure! Here are the steps to set up a GitHub Action to deploy your project to a GCP VM:

1. **Create a service account** in your GCP project with the necessary permissions to deploy to a VM. You can do this by going to the [IAM & Admin](https://console.cloud.google.com/iam-admin/serviceaccounts) page in the Google Cloud Console, selecting your project, and clicking on the "Create Service Account" button. Follow the prompts to create the service account and grant it the necessary permissions.

2. **Download a JSON key** for the service account you just created. You can do this by going to the [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts) page in the Google Cloud Console, selecting the service account you just created, clicking on the "Actions" button (represented by three vertical dots), and selecting "Create key". Select "JSON" as the key type and click on "Create" to download the key.

3. **Add the JSON key as a secret** in your GitHub repository. You can do this by going to the "Settings" tab of your repository, clicking on "Secrets" in the left sidebar, and clicking on the "New repository secret" button. Give the secret a name (e.g., `GCP_SA_KEY`) and paste the contents of the JSON key you downloaded earlier into the "Value" field.

4. **Create a GitHub Actions workflow** file in your repository (e.g., `.github/workflows/deploy.yml`) with the following content:
```yaml
name: Deploy to GCP VM
on:
  push:
    branches:
      - main
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v2
    - name: Set up gcloud
      uses: google-github-actions/setup-gcloud@master
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: 114682467558164399475
    - name: Deploy to GCP VM
      run: |
        # Add your deployment commands here (I GOT STUCK HERE)
```
Make sure to replace `<YOUR_PROJECT_ID>` with your GCP project ID.

5. **Add your deployment commands** to the `run` section of the "Deploy to GCP VM" step in your workflow file. These commands will depend on how you have set up your project and how you want to deploy it to your GCP VM.

That's it! Now, every time you push changes to the `main` branch of your repository, this GitHub Action will run and deploy your project to your GCP VM.

I hope this helps! Let me know if you have any questions or if there's anything else I can help with.