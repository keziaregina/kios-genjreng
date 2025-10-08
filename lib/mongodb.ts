import { Db, MongoClient } from "mongodb";

declare global {
    // biar TS tau kita bikin properti global custom
    // gunakan `var` untuk deklarasi global
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const dbName = "kios_genjreng";
const uri: string | undefined = process.env.MONGODB_URI;
const options: any = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
    throw new Error('No uri mongo has inserted');
}

if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }

    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export default clientPromise as Promise<MongoClient>;

export async function initDB(): Promise<Db> {
    const client = await clientPromise;
    return client.db(dbName);
}