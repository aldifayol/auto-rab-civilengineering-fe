// src/utils/emailConfig.ts

import nodemailer from 'nodemailer';

import * as dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST as string,
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASS as string,
    },
    tls: {
        rejectUnauthorized: false
    }
});

export default transporter;