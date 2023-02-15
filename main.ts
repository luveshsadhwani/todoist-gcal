const fs = require("fs");

// 1. Create an async function to get the sync token from the integrations database
type TodoistSyncToken = string;
let syncToken = "";

function getSyncToken(): TodoistSyncToken {
  console.log("Getting sync token from database");
  // get synctoken from text file
  syncToken = fs.readFileSync("syncToken.txt", "utf8");
  console.log("Sync token: ", syncToken);
  return syncToken;
}

getSyncToken();

// 2. Use the sync token to get updates from the sync api
type TodoistUpdateEvent = {
  id: number | string;
  name: string;
  dueDate: string;
  label?: string;
};

const DUMMY_SYNC_API_DATA = [
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

const syncUpdates = callSyncApi(syncToken);
console.log("Todoist updates:");
console.table(syncUpdates);
// 3. Check which updates are new and which are updates to existing integrations. Merge update events with existing integrations and store new integrations separately.
type TodoistIntegration = {
  task_id: number | string;
  event_id: number | string;
  name: string;
  label?: string;
  source: "todoist" | "google";
};

type PersonalIntegrationCollection = Array<TodoistIntegration>;

const DUMMY_PERSIONAL_INTEGRATION_DATA: PersonalIntegrationCollection = [
  { task_id: 3, event_id: 1, name: "Task 3", source: "todoist" },
  { task_id: 1, event_id: 2, name: "Task 2", source: "todoist" },
  { task_id: 6, event_id: 7, name: "Task 4", source: "todoist" },
];

function connectToIntegrationsDatabase(): void {
  console.log("Connecting to integrations database");
}
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
const existingIntegrations = getExistingIntegrations(syncUpdates);

// filter out existing integrations from syncUpdates and call this new integrations
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
const newIntergrations = getNewIntegrations(syncUpdates, existingIntegrations);

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

// 9. Upsert the array of updates to the integrations database
// function upsertIntegrationInBulk(integrations: Array<TodoistIntegration>): any {
//   console.log("Integrations to upsert ", integrations.length);
//   return integrations;
// }
// upsertIntegrationInBulk(parsedUpdates);

// 10. Store the new sync token in the integrations database
// function storeSyncToken(syncToken: TodoistSyncToken): void {
//   console.log("Storing sync token ", syncToken);
//   // the current sync token is stored in the format sync_token_x, so increment the x, which represents how many runs the script has done
//   const newRunNumber = parseInt(syncToken.split("_")[2]) + 1;
//   const newSyncToken = `sync_token_${newRunNumber}`;

//   fs.writeFile("syncToken.txt", newSyncToken, (err: any) => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//     console.log("Sync token stored");
//   });
// }
// storeSyncToken(syncToken);
