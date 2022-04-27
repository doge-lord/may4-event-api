import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import * as cookie from "cookie";

export const generateCookie = () => {
  return cookie.serialize("token", "", {
    maxAge: 0,
    httpOnly: true,
  });
};

const logout: ValidatedEventAPIGatewayProxyEvent<{}> = async () => {
  return formatJSONResponse({}, { "Set-Cookie": generateCookie() });
};

export const main = middyfy(logout);
