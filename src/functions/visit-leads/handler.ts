import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse, formatErrorResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { LeadManager } from "@libs/managers/lead-manager";
import { TeamManager } from "@libs/managers/team-manager";

import schema from "./schema";

const leads: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const teamId = event.requestContext.authorizer.principalId;
  const { id: leadId } = event.pathParameters;

  try {
    const lead = await LeadManager.getLeadById(leadId);
    const team = await TeamManager.markLeadAsVisited(teamId, lead);

    console.log(JSON.stringify(team, null, 2));

    return formatJSONResponse({ lead, team });
  } catch (error) {
    if (error.message === "ITEM_NOT_FOUND") {
      return formatErrorResponse(404, "LEAD_NOT_FOUND");
    }

    return formatErrorResponse(500);
  }
};

export const main = middyfy(leads);
