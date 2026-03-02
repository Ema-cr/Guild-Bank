import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { BankSettings } from '@/models/BankSettings';
import { BankLog } from '@/models/BankLog';

export async function GET() {
    try {
        await connectToDatabase();
        let settings = await BankSettings.findOne();
        if (!settings) {
            settings = await BankSettings.create({ totalGold: 0 });
        }
        return NextResponse.json({ totalGold: settings.totalGold });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { amount, action, userId, userName } = await req.json(); // amount in copper

        if (!amount || !action || !userId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let settings = await BankSettings.findOne();
        if (!settings) {
            settings = await BankSettings.create({ totalGold: 0 });
        }

        if (action === 'gold_deposit') {
            settings.totalGold += amount;
        } else if (action === 'gold_withdraw') {
            if (settings.totalGold < amount) {
                return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
            }
            settings.totalGold -= amount;
        }

        await settings.save();

        // Create log
        await BankLog.create({
            userId,
            userName,
            action,
            goldAmount: amount
        });

        return NextResponse.json({ totalGold: settings.totalGold });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
