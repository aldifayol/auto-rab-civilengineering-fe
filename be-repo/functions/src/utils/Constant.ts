// constants.ts

// Regular expression for email validation
export const EMAIL_REGEX: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const SALT_ROUND:number = 12;

// API-related constants
export const EXPIRED_JWT: string = '1d';
export const API_VERSION: string = 'v0.0.1';
export const DEFAULT_PAGE_SIZE: number = 10;

// Other constants
export const EXPIRED_TOKEN_RESET_PASSWORD: number = 2;
export const LENGTH_TOKEN_RESET_PASSWORD: number = 6;
export const MAX_NAME_LENGTH: number = 50;

// HTTP CODE
