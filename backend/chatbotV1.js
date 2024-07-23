const { ChatOpenAI } = require('@langchain/openai');
const { OpenAIEmbeddings } = require('@langchain/openai');
const { ChatPromptTemplate, MessagesPlaceholder } = require('@langchain/core/prompts');
const { createStuffDocumentsChain } = require('langchain/chains/combine_documents');
const { StringOutputParser } = require('@langchain/core/output_parsers')
const { createHistoryAwareRetriever } = require('langchain/chains/history_aware_retriever');
const { createRetrievalChain } = require('langchain/chains/retrieval');
const { MemoryVectorStore } = require('langchain/vectorstores/memory');
const { CheerioWebBaseLoader } = require('@langchain/community/document_loaders/web/cheerio');
const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

let chatHistory = [];
let conversationChain;

const createBot = async () => {
    // Instantiate chat model
    const languageModel = new ChatOpenAI({
        modelName: 'gpt-3.5-turbo',
        apiKey: process.env.OPENAI_API_KEY,
        temperature: 0.4,
        max_tokens: 600,
        verbose: true
    });

    // Create a web scrapper
    const loader = new CheerioWebBaseLoader(
        'https://www.jawwal.ps/',  // Home page
        'https://www.paltel.ps/ar/individuals/%D8%A8%D8%A7%D9%84%D8%AA%D9%84-%D9%81%D8%A7%D9%8A%D8%A8%D8%B1', // Giga Fiber
        'https://www.jawwal.ps/ar/individuals/campaigns-and-offers/west-bank/8296',  // Yallah Shabab  West Bank exclusive
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

    const vectorStore = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());
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
            //outputParser: new StringOutputParser()
          });

          //TODO: format and structure the response

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
    //conversationChain = await createBot();
    rl.question('User: ', async (userMessage) => {
        while (userMessage.toLowerCase() !== 'exit') {
            const response = await getAIResponse(userMessage);
            //console.log(`AI: ${response}`);
            rl.question('User: ', (newMessage) => {
                userMessage = newMessage;
            });
        }
        rl.close();
    });
};

//main();

module.exports = { getAIResponse, createBot };

