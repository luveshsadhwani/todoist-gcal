require("dotenv").config({ path: "../.env" });

const todoistApiToken = process.env.TODOIST_API_TOKEN;
const todoistSyncUrl = process.env.TODOIST_SYNC_URL;
const mongoUrl = process.env.MONGO_URL;

const axios = require("axios");
const { MongoClient } = require("mongodb");

const client = new MongoClient(mongoUrl);

async function connectToSyncTokens() {
  try {
    await client.connect();
    console.log("Connected correctly to server");
    const db = client.db("sandbox");
    return db.collection("todoistSyncTokens");
  } catch (err) {
    console.log(err);
  }
}

const getSyncToken = async () => {
  try {
    const response = await axios.get(todoistSyncUrl, {
      headers: {
        Authorization: `Bearer ${todoistApiToken}`,
      },
      params: {
        sync_token: "*",
        resource_types: '["items"]',
      },
    });

    return response.data.sync_token;
  } catch (e) {
    console.error(e);
  }
};

async function storeSyncTokenInCollection(syncToken: string, collection: any) {
  try {
    await collection.insertOne({ syncToken });
    console.log("Sync token stored");
  } catch (err) {
    console.log(err);
  }
}

async function run() {
  const syncTokensCollection = await connectToSyncTokens();
  const syncToken = await getSyncToken();
  await storeSyncTokenInCollection(syncToken, syncTokensCollection);

  client.close();
}

run();
