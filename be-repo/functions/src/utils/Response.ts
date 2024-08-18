
interface ApiResponse {
    status: boolean;
    code: number;
    message?: string;
    data?: any;
    errors?: any;
}

export class ResponseData {
    static async success(status: boolean, code: number, message: string, data?: any): Promise<ApiResponse> {
        return { status, code, message, data };
    }
    static async errors(status: boolean, code: number, message: string, errors?: any): Promise<ApiResponse> {
        return { status, code, message, errors };
    }
    static async notFound() { }
    static async forbidden() { }
}