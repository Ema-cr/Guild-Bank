const { MongoClient } = require('mongodb');
const dns = require('dns');

const uri = "";
dns.setServers(['8.8.8.8']);

async function testConnection() {
    console.log("Testing DNS resolution for _mongodb._tcp.clusterprueba1.jupkf72.mongodb.net...");
    dns.resolveSrv('_mongodb._tcp.clusterprueba1.jupkf72.mongodb.net', (err, addresses) => {
        if (err) {
            console.error("DNS Resolution Error:", err);
        } else {
            console.log("DNS Resolution Success:", addresses);
        }
    });

    console.log("\nAttempting to connect with MongoClient...");
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Successfully connected to MongoDB Atlas!");
        const db = client.db('admin');
        const status = await db.command({ isMaster: 1 });
        console.log("ReplicaSet Name:", status.setName);
        await client.close();
    } catch (e) {
        console.error("Connection Error:", e);
    }
}

testConnection();
