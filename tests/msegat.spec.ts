import dotenv from 'dotenv';
import {Msegat} from "../src";

dotenv.config(); // Make sure to load your environment variables

describe('Msegat Real Tests', () => {
    const config = {
        MSEGAT_USERNAME: process.env.MSEGAT_USERNAME || 'testUser',
        MSEGAT_API_KEY: process.env.MSEGAT_API_KEY || 'testApiKey',
        MSEGAT_USER_SENDER: process.env.MSEGAT_USER_SENDER || 'testSender',
    };

    let msegat: Msegat;

    beforeAll(() => {
        msegat = new Msegat(config.MSEGAT_USERNAME, config.MSEGAT_API_KEY, config.MSEGAT_USER_SENDER);
    });

    test('sendMessage should send a message successfully', async () => {
        const number = '1234567890'; // Use a real phone number for testing
        const message = 'Test Message';

        try {
            const result = await msegat.sendMessage(number, message);
            console.log(result); // Log the result to inspect the response
            expect(result).toHaveProperty('status'); // Adjust this based on the actual response structure
        } catch (error) {
            console.error(error);
            throw error; // Fail the test if there's an error
        }
    });

    test('sendPersonalizedMessages should send personalized messages successfully', async () => {
        const numbers = ['1234567890', '0987654321']; // Use real phone numbers for testing
        const msg = 'Hello {name}';
        const vars = [{ name: 'John' }, { name: 'Doe' }];

        try {
            const result = await msegat.sendPersonalizedMessages(numbers, msg, vars);
            console.log(result); // Log the result to inspect the response
            expect(result).toHaveProperty('status'); // Adjust this based on the actual response structure
        } catch (error) {
            console.error(error);
            throw error; // Fail the test if there's an error
        }
    });

    test('calculateMessageCost should calculate the cost successfully', async () => {
        const contactType = 'individual';
        const contacts = '1234567890'; // Use real contact for testing
        const msg = 'Test Message';
        const by = 'unit';
        const msgEncoding = 'UTF8';

        try {
            const result = await msegat.calculateMessageCost(contactType, contacts, msg, by, msgEncoding);
            console.log(result); // Log the result to inspect the response
            expect(result).toHaveProperty('cost'); // Adjust this based on the actual response structure
        } catch (error) {
            console.error(error);
            throw error; // Fail the test if there's an error
        }
    });

    test('validateConfig should throw error if config is invalid', () => {
        expect(() => {
            new Msegat('', '', '');
        }).toThrow('Please add msegat username in the environment variables.');
    });
});
