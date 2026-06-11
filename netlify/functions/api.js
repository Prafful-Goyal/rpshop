const serverless = require("serverless-http");

const { createServer } = require("../../src/server");
const { connectDatabase } = require("../../src/config/database");

const app = createServer();
const handler = serverless(app);

exports.handler = async (event, context) => {
  try {
    await connectDatabase();
    return await handler(event, context);
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: error.message || "Function failed to start"
      })
    };
  }
};
