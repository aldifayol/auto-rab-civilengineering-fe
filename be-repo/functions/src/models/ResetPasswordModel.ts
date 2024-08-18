import mongoose, { Model, Schema } from 'mongoose';
import { ResetPasswordInterface } from '../Interface/ResetPasswordInterface';

const ResetPasswordSchema: Schema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to UserAuth
    token: { type: String, required: true, unique: true },
    is_reset: { type: Boolean, required: true },
    is_expired: { type: Boolean, required: true },
    until_at: { type: String, required: true },
    created_by: { type: String, required: false },
    updated_by: { type: String, required: false }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Create model with the schema
export const ResetPassword = mongoose.model<ResetPasswordInterface, Model<ResetPasswordInterface>>('reset_password', ResetPasswordSchema);