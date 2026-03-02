import mongoose from 'mongoose';

const BankLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    userName: String, // Cached for quicker display
    action: {
        type: String,
        enum: ['deposit', 'withdraw', 'gold_deposit', 'gold_withdraw'],
        required: true,
    },
    itemId: Number,
    itemName: String,
    quantity: Number,
    goldAmount: Number, // In copper
}, { timestamps: true });

export const BankLog = mongoose.models.BankLog || mongoose.model('BankLog', BankLogSchema);
