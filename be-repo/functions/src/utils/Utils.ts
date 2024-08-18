// src/utils/hash.ts

import bcrypt from 'bcrypt';
import crypto from "crypto";
import * as dotenv from "dotenv"
import transporter from '../config/Email';
import { Options as MailOptions } from 'nodemailer/lib/mailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { SALT_ROUND } from './Constant';

dotenv.config()

export class Utils {

    static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, SALT_ROUND);
    }

    static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    static async generateRandomString(length: number): Promise<string> {
        // return crypto.randomBytes(32).toString("hex");
        const randomString = crypto.randomBytes(Math.ceil(length / 2)).toString('hex');
        // Slice the string to the desired length
        return randomString.slice(0, length);
    }

    // static async sendEmail(to: string, subject: string, message: string, html: any, context: any): Promise<void> {
    static async sendEmail(options: MailOptions): Promise<void> {
        try {
            await transporter.sendMail(options);
            console.log('Email sent successfully');
        } catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Error sending email');
        }
    }

    // Function to render the email template
    static async renderEmailTemplate(templateName: string, context: object): Promise<string> {
        const templatePath = path.join(__dirname, '../views', `${templateName}.hbs`);

        // Read the template file
        const templateSource = fs.readFileSync(templatePath, 'utf8');

        // Compile the template using Handlebars instance
        const template = handlebars.compile(templateSource);

        // Render the template with context data
        return template(context);
    };

    static async expires(until_at: Date): Promise<boolean> {
        const now = new Date()
        if (now > until_at) return false
        return true
    }

    static getFormattedTimestamp(): string {
        const date = new Date();

        // Manually adjust for GMT+7
        const gmtPlus7Offset = 7 * 60; // Offset in minutes
        const localTime = date.getTime();
        const gmtPlus7Time = new Date(localTime + gmtPlus7Offset * 60000);

        const isoString = gmtPlus7Time.toISOString(); // "2024-08-06T15:09:38.804Z"

        // Format the timezone offset for GMT+7
        const formattedOffset = "+07:00";

        // Combine the ISO string without 'Z' and the formatted timezone offset
        return `${isoString.slice(0, -1)}${formattedOffset}`;
    }

    static async getFormattedTimezone(): Promise<string> {
        const date = new Date();

        // Format the date to GMT+7 using the Intl.DateTimeFormat API
        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Bangkok', // GMT+7 timezone
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
        };

        const dateTimeFormat = new Intl.DateTimeFormat('en-GB', options);

        // Format the date parts
        const parts = dateTimeFormat.formatToParts(date);

        // Helper function to get part from Intl.DateTimeFormat parts array
        const getPartValue = (type: string) => parts.find(part => part.type === type)?.value;

        const year = getPartValue('year');
        const month = getPartValue('month');
        const day = getPartValue('day');
        const hour = getPartValue('hour');
        const minute = getPartValue('minute');
        const second = getPartValue('second');

        // Get milliseconds separately
        const milliseconds = date.getMilliseconds().toString().padStart(3, '0');

        // Format the timezone offset for GMT+7
        const formattedOffset = "+07:00";

        // Combine the parts into the desired format
        return `${year}-${month}-${day}T${hour}:${minute}:${second}.${milliseconds}${formattedOffset}`;

    }

}