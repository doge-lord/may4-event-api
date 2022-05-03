import * as AWS from "aws-sdk";

export const successfullResponse = {
  statusCode: 200,
  body: "Success",
};

export const failedResponse = (statusCode, error) => ({
  statusCode,
  body: error,
});

export const send = (data: any, connectionId: string) => {
  const endpoint = process.env.OFFLINE
    ? "ws://localhost:3001"
    : "https://6n96f7g8rh.execute-api.us-east-1.amazonaws.com/dev";

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint: endpoint,
  });

  const params = {
    ConnectionId: connectionId,
    Data: data,
  };

  return apigwManagementApi.postToConnection(params).promise();
};
