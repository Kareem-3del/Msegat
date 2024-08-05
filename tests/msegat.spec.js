"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const src_1 = require("../src");
dotenv_1.default.config(); // Make sure to load your environment variables
describe('Msegat Real Tests', () => {
    const config = {
        MSEGAT_USERNAME: process.env.MSEGAT_USERNAME || 'testUser',
        MSEGAT_API_KEY: process.env.MSEGAT_API_KEY || 'testApiKey',
        MSEGAT_USER_SENDER: process.env.MSEGAT_USER_SENDER || 'testSender',
    };
    let msegat;
    beforeAll(() => {
        msegat = new src_1.Msegat(config.MSEGAT_USERNAME, config.MSEGAT_API_KEY, config.MSEGAT_USER_SENDER);
    });
    test('sendMessage should send a message successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const number = '1234567890'; // Use a real phone number for testing
        const message = 'Test Message';
        try {
            const result = yield msegat.sendMessage(number, message);
            console.log(result); // Log the result to inspect the response
            expect(result).toHaveProperty('status'); // Adjust this based on the actual response structure
        }
        catch (error) {
            console.error(error);
            throw error; // Fail the test if there's an error
        }
    }));
    test('sendPersonalizedMessages should send personalized messages successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const numbers = ['1234567890', '0987654321']; // Use real phone numbers for testing
        const msg = 'Hello {name}';
        const vars = [{ name: 'John' }, { name: 'Doe' }];
        try {
            const result = yield msegat.sendPersonalizedMessages(numbers, msg, vars);
            console.log(result); // Log the result to inspect the response
            expect(result).toHaveProperty('status'); // Adjust this based on the actual response structure
        }
        catch (error) {
            console.error(error);
            throw error; // Fail the test if there's an error
        }
    }));
    test('calculateMessageCost should calculate the cost successfully', () => __awaiter(void 0, void 0, void 0, function* () {
        const contactType = 'individual';
        const contacts = '1234567890'; // Use real contact for testing
        const msg = 'Test Message';
        const by = 'unit';
        const msgEncoding = 'UTF8';
        try {
            const result = yield msegat.calculateMessageCost(contactType, contacts, msg, by, msgEncoding);
            console.log(result); // Log the result to inspect the response
            expect(result).toHaveProperty('cost'); // Adjust this based on the actual response structure
        }
        catch (error) {
            console.error(error);
            throw error; // Fail the test if there's an error
        }
    }));
    test('validateConfig should throw error if config is invalid', () => {
        expect(() => {
            new src_1.Msegat('', '', '');
        }).toThrow('Please add msegat username in the environment variables.');
    });
});
