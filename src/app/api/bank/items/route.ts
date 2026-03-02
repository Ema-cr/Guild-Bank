import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { BankItem } from '@/models/BankItem';
import { BankLog } from '@/models/BankLog';
import { getItemData } from '@/lib/blizzard';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const tabIndex = parseInt(searchParams.get('tabIndex') || '0');

        const items = await BankItem.find({ tabIndex });
        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { itemId, quantity, professionQuality, tabIndex, slotIndex, userId, userName } = await req.json();

        if (!itemId || !quantity || slotIndex === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get fresh item data from Blizzard if not provided or to verify
        const blizzardData = await getItemData(itemId);
        if (!blizzardData) {
            return NextResponse.json({ error: 'Item not found in Blizzard database' }, { status: 404 });
        }

        // Check if slot is occupied
        let existingItem = await BankItem.findOne({ tabIndex, slotIndex });

        if (existingItem) {
            if (existingItem.itemId === itemId) {
                // Same item, increment quantity (max 20)
                const newQuantity = Math.min(20, existingItem.quantity + quantity);
                const added = newQuantity - existingItem.quantity;
                existingItem.quantity = newQuantity;
                // Update professionQuality as well if provided
                if (professionQuality !== undefined) {
                    existingItem.professionQuality = professionQuality;
                }
                await existingItem.save();
                // ... rest of logic

                // Log action
                if (added > 0) {
                    await BankLog.create({
                        userId,
                        userName,
                        action: 'deposit',
                        itemId,
                        itemName: blizzardData.name,
                        quantity: added
                    });
                }
            } else {
                return NextResponse.json({ error: 'Slot already occupied by a different item' }, { status: 400 });
            }
        } else {
            // New item in slot
            const newItem = await BankItem.create({
                itemId,
                name: blizzardData.name,
                icon: blizzardData.icon,
                quality: blizzardData.quality,
                professionQuality: professionQuality || 1,
                quantity: Math.min(20, quantity),
                tabIndex,
                slotIndex
            });

            await BankLog.create({
                userId,
                userName,
                action: 'deposit',
                itemId,
                itemName: blizzardData.name,
                quantity: newItem.quantity
            });

            existingItem = newItem;
        }

        return NextResponse.json(existingItem);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectToDatabase();
        const { tabIndex, slotIndex, withdrawAmount, userId, userName } = await req.json();

        let item = await BankItem.findOne({ tabIndex, slotIndex });
        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        const quantityToRemove = withdrawAmount ? Math.min(item.quantity, withdrawAmount) : item.quantity;
        const remainingQuantity = item.quantity - quantityToRemove;

        if (remainingQuantity > 0) {
            item.quantity = remainingQuantity;
            await item.save();
        } else {
            await BankItem.findByIdAndDelete(item._id);
        }

        await BankLog.create({
            userId,
            userName,
            action: 'withdraw',
            itemId: item.itemId,
            itemName: item.name,
            quantity: quantityToRemove
        });

        return NextResponse.json({ success: true, remaining: remainingQuantity });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
