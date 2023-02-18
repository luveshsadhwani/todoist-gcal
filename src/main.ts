const fs = require("fs");

// 1. Get the sync token and previous request date time
type TodoistSyncToken = string;

type RequestDateTime = Date;

function getSyncTokenAndRequestDateTime(): {
  syncToken: TodoistSyncToken;
  requestDateTime: RequestDateTime;
} {
  console.log("Getting sync token");
  // get synctoken from text file
  const syncToken = fs.readFileSync("syncToken.txt", "utf8");
  console.log("Sync token: ", syncToken);
  const requestDateTime = new Date();
  return { syncToken, requestDateTime };
}
const {
  syncToken: currentSyncToken,
  requestDateTime: previousRequestDateTime,
} = getSyncTokenAndRequestDateTime();

// set the current request date time
const currentRequestDateTime = new Date();

// 2. Use the sync token to get updates from the sync api
type TodoistUpdateEvent = {
  id: number | string;
  name: string;
  dueDate: string;
  label?: string;
};

const DUMMY_SYNC_API_DATA: TodoistUpdateEvent[] = [
  {
    id: 70,
    name: "Task 1",
    dueDate: Date(),
  },
  { id: 1, name: "Task 2 UPDATED", dueDate: Date(), label: "Office" },
  { id: 3, name: "Task 3", dueDate: Date(), label: "Home" },
];

function callSyncApi(syncToken: TodoistSyncToken): Array<TodoistUpdateEvent> {
  console.log("Calling sync api");
  const data = DUMMY_SYNC_API_DATA;
  return data;
}

const syncUpdates = callSyncApi(currentSyncToken);
console.log("Todoist updates:");
console.table(syncUpdates);

// filter out updates that are older than the previous request date
function filterUpdatesByRequestDateTime(
  updates: Array<TodoistUpdateEvent>,
  previousRequestDateTime: RequestDateTime
): Array<TodoistUpdateEvent> {
  console.log("Filtering updates by request date time");
  const filteredUpdates = updates.filter((update) => {
    return new Date(update.dueDate) > previousRequestDateTime;
  });
  console.log("Filtered updates:");
  console.table(filteredUpdates);
  return filteredUpdates;
}
const filteredSyncUpdates = filterUpdatesByRequestDateTime(
  syncUpdates,
  previousRequestDateTime
);

// 3. Check which updates are new and which are updates to existing integrations. Merge update events with existing integrations and store new integrations separately.
type TodoistIntegration = {
  task_id: number | string;
  event_id: number | string;
  name: string;
  label?: string;
  source: string;
};

type PersonalIntegrationCollection = Array<TodoistIntegration>;

const DUMMY_PERSIONAL_INTEGRATION_DATA: PersonalIntegrationCollection = [
  { task_id: 3, event_id: 1, name: "Task 3", source: "todoist" },
  { task_id: 1, event_id: 2, name: "Task 2", source: "todoist" },
  { task_id: 6, event_id: 7, name: "Task 4", source: "todoist" },
];

let connectToIntegrationsDatabase: () => void;
connectToIntegrationsDatabase = () => {
  console.log("Connecting to integrations database");
};
connectToIntegrationsDatabase();

// get existing updates from database
function getExistingIntegrations(
  updates: Array<TodoistUpdateEvent>
): PersonalIntegrationCollection {
  console.log("Get existing integrations from database");
  // return elements from DUMMY_PERSIONAL_INTEGRATION_DATA that are in parsedUpdates
  const existingIntegrations = DUMMY_PERSIONAL_INTEGRATION_DATA.filter(
    (integration) => {
      return updates.some((update) => update.id === integration.task_id);
    }
  );
  console.log("Existing integrations:");
  console.table(existingIntegrations);
  return existingIntegrations;
}
const existingIntegrations = getExistingIntegrations(filteredSyncUpdates);

// merge filtered sync updates with existing integrations. ensure this merge will use sync updates as the source of truth and override relevant fields in existing integrations
// ensure that keys between sync updates and existing integrations are shared
function mergeUpdatesWithExistingIntegrations(
  updates: Array<TodoistUpdateEvent>,
  existingIntegrations: PersonalIntegrationCollection
): PersonalIntegrationCollection {
  console.log("Merge updates with existing integrations");
  const mergedIntegrations = updates.map((update) => {
    const existingIntegration = existingIntegrations.find(
      (integration) => integration.task_id === update.id
    );
    if (existingIntegration) {
      // don't return id from update
      return {
        task_id: update.id,
        event_id: existingIntegration.event_id,
        name: update.name,
        label: update.label,
        source: "todoist",
      };
    } else {
      return {
        task_id: update.id,
        event_id: 0,
        name: update.name,
        label: update.label,
        source: "todoist",
      };
    }
  });
  console.log("Merged integrations:");
  console.table(mergedIntegrations);
  return mergedIntegrations;
}
const mergedIntegrations = mergeUpdatesWithExistingIntegrations(
  filteredSyncUpdates,
  existingIntegrations
);

// filter out new integrations by checking if event_id is 0
function getNewIntegrations(
  updates: Array<TodoistUpdateEvent>,
  existingIntegrations: PersonalIntegrationCollection
): Array<TodoistUpdateEvent> {
  console.log("Get new integrations");
  const newIntegrations = updates.filter((update) => {
    return !existingIntegrations.some(
      (integration) => integration.task_id === update.id
    );
  });
  console.log("New integrations:");
  console.table(newIntegrations);
  return newIntegrations;
}

const newIntergrations = getNewIntegrations(
  filteredSyncUpdates,
  mergedIntegrations
);

// 4. For each new integration, create a new google calendar event
type GoogleCalendarEvent = {
  id: number | string;
  name: string;
  dueDate: string;
  label?: string;
  organizer?: string;
};

function createGoogleCalendarEvent(
  todoistUpdate: TodoistUpdateEvent
): GoogleCalendarEvent {
  console.log("Creating google calendar event for integration ");
  return {
    id: 0,
    name: todoistUpdate.name,
    dueDate: Date(),
    organizer: "Luvesh L Sadhwani",
  };
}
const newGoogleCalendarEvents = newIntergrations.map(createGoogleCalendarEvent);

// 5. For each existing integration, fetch the google event id from google calendar api
const DUMMY_GOOGLE_CALENDAR_EVENTS: Array<GoogleCalendarEvent> = [
  {
    id: 1,
    name: "Task 1",
    dueDate: Date(),
    organizer: "Luvesh L Sadhwani",
  },
  {
    id: 2,
    name: "Task 2",
    dueDate: Date(),
    organizer: "Luvesh L Sadhwani",
  },
];
function getGoogleCalendarEventsById(
  integrationIds: PersonalIntegrationCollection
): Array<GoogleCalendarEvent> {
  console.log("Getting google calendar events by IDs");
  return DUMMY_GOOGLE_CALENDAR_EVENTS;
}
const existingGoogleCalendarEvents =
  getGoogleCalendarEventsById(existingIntegrations);
console.log("Existing google calendar events:");
console.table(existingGoogleCalendarEvents);

// 6. Update the google calendar event from existing integration
function updateGoogleCalendarEvent(
  googleCalendarEvent: GoogleCalendarEvent,
  todoistUpdate: TodoistIntegration
): GoogleCalendarEvent {
  console.log("Updating google calendar event");
  return {
    id: googleCalendarEvent.id,
    name: todoistUpdate.name,
    dueDate: Date(),
    organizer: "Luvesh L Sadhwani",
  };
}
const updatedGoogleCalendarEvents = existingIntegrations.map((integration) => {
  const googleCalendarEvent = existingGoogleCalendarEvents.find(
    (event) => event.id === integration.event_id
  );
  if (googleCalendarEvent) {
    return updateGoogleCalendarEvent(googleCalendarEvent, integration);
  }
  return googleCalendarEvent;
});
console.log("Updated google calendar events:");
console.table(updatedGoogleCalendarEvents);

// 7. Upsert the array of updates to the google calendar api
function upsertGoogleCalendarEventInBulk(googleCalendarEvents: any): any {
  console.log("Google calendar events to upsert ", googleCalendarEvents.length);
  return googleCalendarEvents;
}
const response = upsertGoogleCalendarEventInBulk(updatedGoogleCalendarEvents);

// 8. Update the merged updates with the new google calendar event id
function updateMergedIntegrationsWithGoogleCalendarEventId(
  mergedIntegrations: PersonalIntegrationCollection,
  googleCalendarEvents: Array<GoogleCalendarEvent>
): PersonalIntegrationCollection {
  console.log("Updating merged integrations with google calendar event id");
  return mergedIntegrations.map((integration) => {
    const googleCalendarEvent = googleCalendarEvents.find(
      (event) => event.name === integration.name
    );
    if (googleCalendarEvent) {
      return {
        ...integration,
        event_id: googleCalendarEvent.id,
      };
    }
    return integration;
  });
}
const parsedUpdates = updateMergedIntegrationsWithGoogleCalendarEventId(
  mergedIntegrations,
  response
);

// 9. Upsert the array of merged updates to the integrations database
function upsertIntegrationInBulk(integrations: Array<TodoistIntegration>): any {
  console.log("Integrations to upsert ", integrations.length);
  return integrations;
}
upsertIntegrationInBulk(parsedUpdates);

// 10. Store the new sync token and the request date time
function storeSyncToken(
  syncToken: TodoistSyncToken,
  requestDateTime: RequestDateTime
): void {
  console.log("Storing sync token ", syncToken);
  // the current sync token is stored in the format sync_token_x, so increment the x, which represents how many runs the script has done
  const newRunNumber = parseInt(syncToken.split("_")[2]) + 1;
  const newSyncToken = `sync_token_${newRunNumber}`;

  fs.writeFile("syncToken.txt", newSyncToken, (err: any) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Sync token stored");
  });
  console.log("Storing request date time", requestDateTime);
}
storeSyncToken(currentSyncToken, currentRequestDateTime);
