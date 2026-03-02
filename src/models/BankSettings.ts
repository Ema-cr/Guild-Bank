import mongoose from 'mongoose';

const BankSettingsSchema = new mongoose.Schema({
    totalGold: {
        type: Number,
        default: 0, // Gold is stored in copper (100 silver = 1 gold, 100 copper = 1 silver)
    },
    tabs: [{
        name: String,
        icon: String,
        id: Number
    }]
}, { timestamps: true });

export const BankSettings = mongoose.models.BankSettings || mongoose.model('BankSettings', BankSettingsSchema);
