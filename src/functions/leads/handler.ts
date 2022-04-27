import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/api-gateway";
import { formatJSONResponse } from "@libs/api-gateway";
import { middyfy } from "@libs/lambda";
import { LeadManager } from "@libs/managers/lead-manager";

import schema from "./schema";

const leads: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const { id } = event.pathParameters;

  try {
    const result = await LeadManager.getLeadById(id);
    return formatJSONResponse({ status: 200, result });
  } catch (error) {
    if (error.message === "ITEM_NOT_FOUND") {
      return formatJSONResponse({ status: 404 });
    }

    return formatJSONResponse({ status: 500 });
  }
};

export const main = middyfy(leads);
