import { DynamoDB } from "aws-sdk";

const dbClient =
  process.env.IS_OFFLINE === "true"
    ? new DynamoDB.DocumentClient({
        region: "localhost",
        endpoint: "http://localhost:8000",
      })
    : new DynamoDB.DocumentClient();

export default dbClient;
