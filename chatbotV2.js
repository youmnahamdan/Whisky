/*
In this updated code:

The Pinecone client is initialized and used to upsert documents into the Pinecone vector store.
The getAIResponse function queries the vector store with the user's message to find relevant documents and generate a response.
The main function allows continuous user input until "exit" is entered.
Ensure you have the necessary environment variables set in your .env file:
*/



const { ChatOpenAI } = require('@langchain/openai');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { ChatPromptTemplate, MessagesPlaceholder } = require('@langchain/core/prompts');
const { createStuffDocumentsChain } = require('langchain/chains/combine_documents');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { createHistoryAwareRetriever } = require('langchain/chains/history_aware_retriever');
const { createRetrievalChain } = require('langchain/chains/retrieval');
const { PineconeStore } = require('langchain/vectorstores/pinecone');
const { CheerioWebBaseLoader } = require('@langchain/community/document_loaders/web/cheerio');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');
const { PineconeClient } = require('@pinecone-database/pinecone');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

let chatHistory = [];
let conversationChain;

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const initPineconeClient = async () => {
    const pinecone = new PineconeClient();
    await pinecone.init({
        apiKey: PINECONE_API_KEY,
        environment: PINECONE_ENVIRONMENT,
    });
    return pinecone;
};

const upsertPineconeIndex = async (docs) => {
    const pinecone = await initPineconeClient();
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    // Initialize OpenAI embeddings
    const embeddings = new OpenAIEmbeddings({
        openAIApiKey: OPENAI_API_KEY,
        modelName: 'text-embedding-3-small',
    });

    // Create Pinecone vector store and upsert documents
    await PineconeStore.fromDocuments(docs, embeddings, {
        pineconeIndex: index,
    });

    console.log('Documents upserted successfully');
};

const createBot = async () => {
    // Instantiate chat model
    const languageModel = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo',
        apiKey: OPENAI_API_KEY,
        temperature: 0.4,
        max_tokens: 600,
        verbose: true
    });

    // Create a web scraper
    const loader = new CheerioWebBaseLoader(
        'https://www.jawwal.ps/',  // Home page
        'https://www.paltel.ps/ar/individuals/%D8%A8%D8%A7%D9%84%D8%AA%D9%84-%D9%81%D8%A7%D9%8A%D8%A8%D8%B1', // Giga Fiber
        'https://www.jawwal.ps/ar/individuals/campaigns-and-offers/west-bank/8296',  // Yallah Shabab West Bank exclusive
        'https://www.jawwal.ps/ar/individuals/services/3g', // 3G 
        'https://www.jawwal.ps/ar/individuals/campaigns-and-offers/west-bank',  //Campaigns in WB
        'https://www.jawwal.ps/ar/individuals/campaigns-and-offers/gaza'   //Campaigns in GS
    );
    const rawDocs = await loader.load();

    // Create a text splitter
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 20
    });

    const docs = await splitter.splitDocuments(rawDocs);
    await upsertPineconeIndex(docs); // Upsert documents to Pinecone

    const pinecone = await initPineconeClient();
    const index = pinecone.Index(PINECONE_INDEX_NAME);
    const vectorStore = await PineconeStore.fromExistingIndex(
        new OpenAIEmbeddings({
            openAIApiKey: OPENAI_API_KEY,
            modelName: 'text-embedding-3-small'
        }), 
        { pineconeIndex: index });
    const retriever = vectorStore.asRetriever({});

    // Create a HistoryAwareRetriever
    const retrieverPrompt = ChatPromptTemplate.fromMessages([
        new MessagesPlaceholder('chatHistory'),
        ['user', '{input}'],
        ['user', 'Given the above conversation, generate a search query to look up in order to get information relevant to the conversation']
    ]);

    const retrieverChain = await createHistoryAwareRetriever({
        llm: languageModel,
        retriever,
        rephrasePrompt: retrieverPrompt
    });

    // Define the prompt for the final chain
    const prompt = ChatPromptTemplate.fromMessages([
        'system',
        `You are an AI assistant called Whisky. You are here to help answer questions and provide information 
        to the best of your ability regarding services provided by a Palestinian telecom company called Jawal Paltel.
        Answer queries based on this context: {context}`,
        new MessagesPlaceholder('chatHistory'),
        ['user', '{input}']
    ]);

    const chain = await createStuffDocumentsChain({
        llm: languageModel,
        prompt: prompt,
        outputParser: new StringOutputParser() // Add the output parser here
    });

    // Create the conversation chain
    conversationChain = await createRetrievalChain({
        combineDocsChain: chain,
        retriever: retrieverChain
    });

    return conversationChain;
};

const getAIResponse = async (userMessage) => {
    if (!conversationChain) {
        conversationChain = await createBot();
    }
    try {
        const response = await conversationChain.invoke({
            chatHistory: chatHistory,
            input: userMessage
        });

        chatHistory.push(new HumanMessage({ content: userMessage }));
        chatHistory.push(new AIMessage({ content: response.answer }));

        return response.answer;
    } catch (error) {
        console.error('Error generating response:', error);
        throw error;
    }
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const main = async () => {
    rl.question('User: ', async (userMessage) => {
        while (userMessage.toLowerCase() !== 'exit') {
            const response = await getAIResponse(userMessage);
            console.log(`AI: ${response}`);
            rl.question('User: ', (newMessage) => {
                userMessage = newMessage;
            });
        }
        rl.close();
    });
};

main();

module.exports = { getAIResponse, createBot };
