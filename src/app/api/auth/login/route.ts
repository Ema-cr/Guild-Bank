import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { User, seedUsers } from '@/models/User';

export async function POST(request: Request) {
    try {
        await connectToDatabase();
        await seedUsers(); // Ensure our 3 main users exist in the DB

        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const user = await User.findOne({ name });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // In a real app, you would set an HttpOnly cookie or return a JWT here
        // For now, we return success and pass the user details
        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                icon: user.icon,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
