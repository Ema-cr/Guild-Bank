import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    icon: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'member',
    }
}, { timestamps: true });

// Check if model already exists to prevent Next.js hot reload issues
export const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Helper function to seed initial users
export async function seedUsers() {
    const initialUsers = [
        { name: 'Zanahorio', icon: '/zanahorio.jpg.png', role: 'admin' },
        { name: 'Skull', icon: '/skull.jpg.png', role: 'admin' },
        { name: 'Morcilla', icon: '/morcilla.jpg.png', role: 'admin' },
    ];

    for (const user of initialUsers) {
        const existing = await User.findOne({ name: user.name });
        if (!existing) {
            await User.create(user);
        }
    }
}
