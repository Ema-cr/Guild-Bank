import mongoose from 'mongoose';

const BankItemSchema = new mongoose.Schema({
    itemId: {
        type: Number,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    icon: {
        type: String,
        required: true,
    },
    quality: {
        type: String,
        default: 'Common',
    },
    professionQuality: {
        type: Number,
        default: 1, // 1: Bronze, 2: Silver, 3: Gold
    },
    quantity: {
        type: Number,
        default: 1,
        max: 20, // As requested, max 20 per slot
    },
    tabIndex: {
        type: Number,
        default: 0,
        required: true,
    },
    slotIndex: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

// Index for quick lookup of a tab's items
BankItemSchema.index({ tabIndex: 1, slotIndex: 1 }, { unique: true });

export const BankItem = mongoose.models.BankItem || mongoose.model('BankItem', BankItemSchema);
