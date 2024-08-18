import mongoose, { Document, Model, mongo } from "mongoose";

export interface UserAuthInterface extends Document {
    user_id?: string;
    username: string;
    password?: string;
    email: string;
    token?: string;
    last_login?: string;
    is_login?: boolean;
    is_active: boolean;
    created_by?: string;
    updated_by?: string;
    created_at?: Date;
    updated_at?: Date;
    resets?: mongoose.Types.ObjectId[];
}