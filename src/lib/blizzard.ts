const CLIENT_ID = process.env.BLIZZARD_CLIENT_ID;
const CLIENT_SECRET = process.env.BLIZZARD_CLIENT_SECRET;
const REGION = 'us'; // Adjust based on your preferred region
const LOCALE = 'en_US';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken() {
    const now = Date.now();
    if (accessToken && now < tokenExpiry) {
        return accessToken;
    }

    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`https://oauth.battle.net/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        throw new Error('Failed to get Blizzard access token');
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = now + data.expires_in * 1000 - 60000; // Buffer of 1 minute
    return accessToken;
}

export async function getItemData(itemId: number) {
    const token = await getAccessToken();

    // Fetch basic item info
    const response = await fetch(
        `https://${REGION}.api.blizzard.com/data/wow/item/${itemId}?namespace=static-${REGION}&locale=${LOCALE}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) return null;
    const data = await response.json();

    // Fetch item media (icon)
    const mediaResponse = await fetch(
        `https://${REGION}.api.blizzard.com/data/wow/media/item/${itemId}?namespace=static-${REGION}&locale=${LOCALE}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }
    );

    let icon = '/default-slot-icon.png';
    if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json();
        const iconAsset = mediaData.assets?.find((a: any) => a.key === 'icon');
        if (iconAsset) {
            icon = iconAsset.value;
        }
    }

    return {
        itemId: data.id,
        name: data.name,
        quality: data.quality.type,
        icon: icon,
    };
}
