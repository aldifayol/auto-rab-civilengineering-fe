import mongoose, { Document, Model } from "mongoose";

export interface ResetPasswordInterface extends Document {
    user_id: mongoose.Types.ObjectId;
    token: string;
    is_reset: boolean;
    is_expired: boolean;
    until_at: Date;
    created_by?: string;
    updated_by?: string;
    created_at?: Date;
    updated_at?: Date;
}