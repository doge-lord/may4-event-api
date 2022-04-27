import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, "body"> & {
  body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

export const formatJSONResponse = (
  response: Record<string, unknown>,
  headers?: APIGatewayProxyResult["headers"]
) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,UPDATE,OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept",
      ...headers,
    },
    body: JSON.stringify(response),
  };
};

export const formatErrorResponse = (
  statusCode: number,
  error = "",
  response: Record<string, unknown> = {}
) => {
  if (statusCode >= 500) {
    return {
      statusCode,
      body: JSON.stringify({ error: "SERVER_ERROR" }),
    };
  }

  return {
    statusCode,
    body: JSON.stringify({ ...response, error }),
  };
};
