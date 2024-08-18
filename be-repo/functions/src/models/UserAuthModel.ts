import mongoose, { Model, Schema } from 'mongoose';
import { UserAuthInterface } from '../Interface/UserAuthInterface';

const UserSchema: Schema = new Schema({
    user_id: { type: String, required: false },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    token: { type: String, required: false },
    last_login: { type: String, required: false },
    is_login: { type: Boolean, required: false },
    is_active: { type: Boolean, required: true },
    created_by: { type: String, required: false },
    updated_by: { type: String, required: false }
}, {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

UserSchema.virtual('resets', {
    ref: 'reset_password', // The model to use
    localField: '_id', // Find animals where `owner_id` is equal to the `_id` of the owner
    foreignField: 'user_id', // Use the `owner_id` field in Animal to make the connection
});

// Ensure virtual fields are included when converting to JSON or Objects
UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });

// Create model with the schema
export const UserAuth = mongoose.model<UserAuthInterface, Model<UserAuthInterface>>('user', UserSchema);