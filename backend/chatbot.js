const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const dotenv = require('dotenv');
dotenv.config();

// Instantiate the OpenAI model
const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.4,
    max_tokens: 1000,
    verbose: true
});

const getAIResponse = async(userMessage) => {
    try {
        // Create a prompt template
        const prompt = ChatPromptTemplate.fromTemplate(
            "You are a helpful assistant. Answer user {query}"
        );

        // Create an output parser
        const parser = new StringOutputParser();

        // Chain together the prompt and the model
        const chain = prompt.pipe(model).pipe(parser);
        console.log('Generating response...');

        // Return AI response
        return await chain.invoke({ query: userMessage });
    } catch (error) {
        console.error('Error generating response:', error);
        throw error; // Rethrow the error to be handled by the caller
    }
}

// Export generateResponse Function
module.exports = { getAIResponse };










/*const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const readline = require('readline');
const dotenv = require('dotenv');
dotenv.config();

const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo', // Changed from 'name' to 'modelName'
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0.4,
    max_tokens: 1000,
    verbose: true
});

async function generateResponse(userMessage) {
    const prompt = ChatPromptTemplate.fromTemplate(
        "You are a helpful assistant. Answer user {query}"
    );

    const parser = new StringOutputParser();

    const chain = prompt.pipe(model).pipe(parser);
    console.log('Genrating response...');
    return await chain.invoke({ query: userMessage });
}

/*generateResponse('helloooooo').then(response => {
    console.log(response);
}).catch(err => {
    console.error(err);
});

module.exports = { generateResponse };*/
