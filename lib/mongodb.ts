import { MongoClient } from "mongodb";

declare global {
    // biar TS tau kita bikin properti global custom
    // gunakan `var` untuk deklarasi global
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri: any = process.env.MONGODB_URI;
const options: any = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
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

export default clientPromise;