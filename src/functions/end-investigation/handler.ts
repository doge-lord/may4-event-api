import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse, formatErrorResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { TeamManager } from "@libs/managers/team-manager";

const endInvestigation: ValidatedEventAPIGatewayProxyEvent<{}> = async (
  event
) => {
  const teamId = event.requestContext.authorizer.principalId;

  try {
    const team = await TeamManager.endInvestigation(teamId);

    return formatJSONResponse(team as any);
  } catch (error) {
    return formatErrorResponse(500);
  }
};

export const main = middyfy(endInvestigation);
