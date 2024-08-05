import { request } from 'https';
import { URL } from 'url';

interface MsegatConfig {
  MSEGAT_USERNAME: string;
  MSEGAT_USER_SENDER: string;
  MSEGAT_API_KEY: string;
}

interface SendVarsPayload {
  userName: string;
  apiKey: string;
  numbers: string[];
  userSender: string;
  msg: string;
  timeToSend?: string;
  exactTime?: string;
  msgEncoding: string;
  reqBulkId?: string;
  reqFilter?: string;
  vars: object[];
}

interface CalculateCostPayload {
  userName: string;
  apiKey: string;
  contactType: string;
  contacts: string;
  msg: string;
  by: string;
  msgEncoding: string;
}

/**
 * Msegat class to send messages using Msegat API.
 * @class
 * @public
 * @version 1.0.0
 */
export class Msegat {
  private readonly config: MsegatConfig;

  constructor(MSEGAT_USERNAME: string, MSEGAT_API_KEY: string, MSEGAT_USER_SENDER?: string) {
    this.config = {
      MSEGAT_USERNAME: MSEGAT_USERNAME,
      MSEGAT_API_KEY: MSEGAT_API_KEY,
      MSEGAT_USER_SENDER: MSEGAT_USER_SENDER || 'almasah',
    };

    this.validateConfig();
  }

  private validateConfig() {
    const { MSEGAT_USERNAME, MSEGAT_USER_SENDER, MSEGAT_API_KEY } = this.config;

    if (!MSEGAT_USERNAME) {
      throw new Error('Please add msegat username in the environment variables.');
    }
    if (!MSEGAT_USER_SENDER) {
      throw new Error('Please add msegat user sender in the environment variables.');
    }
    if (!MSEGAT_API_KEY) {
      throw new Error('Please add msegat API key in the environment variables.');
    }
  }

  private createPayload(numbers: string, message: string) {
    return {
      userName: this.config.MSEGAT_USERNAME,
      numbers,
      userSender: this.config.MSEGAT_USER_SENDER || 'almasah',
      apiKey: this.config.MSEGAT_API_KEY,
      msg: message,
      msgEncoding: 'UTF8',
    };
  }

  private createPayloadForPersonalizedSMS(numbers: string[], msg: string, vars: object[], options?: {
    timeToSend?: string;
    exactTime?: string;
    msgEncoding?: string;
    reqBulkId?: string;
    reqFilter?: string;
  }) {
    return {
      userName: this.config.MSEGAT_USERNAME,
      apiKey: this.config.MSEGAT_API_KEY,
      numbers,
      userSender: this.config.MSEGAT_USER_SENDER,
      msg,
      msgEncoding: options?.msgEncoding || 'UTF8',
      vars,
      ...options,
    } as SendVarsPayload;
  }

  private createPayloadForCostCalculation(contactType: string, contacts: string, msg: string, by: string, msgEncoding: string) {
    return {
      userName: this.config.MSEGAT_USERNAME,
      apiKey: this.config.MSEGAT_API_KEY,
      contactType,
      contacts,
      msg,
      by,
      msgEncoding,
    } as CalculateCostPayload;
  }

  private async sendRequest(url: string, payload: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const req = request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      });

      req.on('error', (e) => {
        reject(new Error(`Problem with request: ${e.message}`));
      });

      req.write(JSON.stringify(payload));
      req.end();
    });
  }

  /**
   * Send personalized messages to multiple numbers with variables.
   * @param numbers
   * @param msg
   * @param vars
   * @param options
   */
  public async sendPersonalizedMessages(
      numbers: string[],
      msg: string,
      vars: object[],
      options?: {
        timeToSend?: string;
        exactTime?: string;
        msgEncoding?: string;
        reqBulkId?: string;
        reqFilter?: string;
      },
  ): Promise<any> {
    const payload = this.createPayloadForPersonalizedSMS(numbers, msg, vars, options);
    try {
      return await this.sendRequest('https://www.msegat.com/gw/sendVars.php', payload);
    } catch (error: any) {
      throw new Error(`Error sending personalized messages: ${error.message}`);
    }
  }

  /**
   * Calculate the cost of sending a message.
   * @param contactType
   * @param contacts
   * @param msg
   * @param by
   * @param msgEncoding
   */
  public async calculateMessageCost(
      contactType: string,
      contacts: string,
      msg: string,
      by: string,
      msgEncoding: string,
  ): Promise<any> {
    const payload = this.createPayloadForCostCalculation(contactType, contacts, msg, by, msgEncoding);
    try {
      return await this.sendRequest('https://www.msegat.com/gw/calculateCost.php', payload);
    } catch (error: any) {
      throw new Error(`Error calculating message cost: ${error.message}`);
    }
  }

  /**
   * Send a message to a single number.
   * @param number
   * @param message
   */
  public async sendMessage(number: string, message: string): Promise<any> {
    const payload = this.createPayload(number, message);
    try {
      return await this.sendRequest('https://www.msegat.com/gw/sendsms.php', payload);
    } catch (error: any) {
      throw new Error(`Error sending message: ${error.message}`);
    }
  }

  /**
   * Send an OTP code to a single number.
   * @param number
   * @param lang
   * @returns Promise<{ code: number; id: number; message: string; }>
   *     The response object contains the code, id, and message.
   *     The code is the status code, the id is the OTP code ID, and the message is the response message.
   *     The code is 0 if the request was successful.
   */
  public async sendOTPCode(number: string, lang: 'Ar' | 'En'): Promise<{
    code: number;
    id: number;
    message: string;
  }> {
    const payload = {
      lang,
      userName: this.config.MSEGAT_USERNAME,
      number,
      apiKey: this.config.MSEGAT_API_KEY,
      userSender: this.config.MSEGAT_USER_SENDER,
    };
    try {
      return await this.sendRequest('https://www.msegat.com/gw/sendOTPCode.php', payload);
    } catch (error: any) {
      throw new Error(`Error sending OTP code: ${error.message}`);
    }
  }

  /**
   * Verify the OTP code.
   * @param code
   * @param id
   * @param lang
   * @returns Promise<{ code: number; message: string; }>
   *     The response object contains the code and message.
   *     The code is 0 if the request was successful.
   *     The message is the response message.
   */
  public async verifyOTPCode(code: string, id: number, lang: 'Ar' | 'En'): Promise<{
    code: number;
    message: string;
  }> {
    const payload = {
      lang,
      userName: this.config.MSEGAT_USERNAME,
      apiKey: this.config.MSEGAT_API_KEY,
      code,
      id,
      userSender: this.config.MSEGAT_USER_SENDER,
    };
    try {
      return await this.sendRequest('https://www.msegat.com/gw/verifyOTPCode.php', payload);
    } catch (error: any) {
      throw new Error(`Error verifying OTP code: ${error.message}`);
    }
  }
}
