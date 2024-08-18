import { UserAuthInterface } from "./UserAuthInterface";

export interface PayloadJwt {
    id: string;
    username: string;
    email: string;
    last_login: string;
    is_login: boolean;
    is_active: boolean
}

export interface PayloadLogin {
    user: PayloadJwt
    token: string
}