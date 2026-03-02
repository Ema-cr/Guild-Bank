import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { BankLog } from '@/models/BankLog';

export async function GET() {
    try {
        await connectToDatabase();
        const logs = await BankLog.find()
            .sort({ createdAt: -1 })
            .limit(50);
        return NextResponse.json(logs);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
