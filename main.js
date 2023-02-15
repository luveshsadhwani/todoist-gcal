var fs = require("fs");
var syncToken = "";
function getSyncToken() {
    console.log("Getting sync token from database");
    // get synctoken from text file
    syncToken = fs.readFileSync("syncToken.txt", "utf8");
    console.log("Sync token: ", syncToken);
    return syncToken;
}
getSyncToken();
var DUMMY_SYNC_API_DATA = [
    {
        id: 70,
        name: "Task 1",
        dueDate: Date()
    },
    { id: 1, name: "Task 2 UPDATED", dueDate: Date(), label: "Office" },
    { id: 3, name: "Task 3", dueDate: Date(), label: "Home" },
];
function callSyncApi(syncToken) {
    console.log("Calling sync api");
    var data = DUMMY_SYNC_API_DATA;
    return data;
}
var syncUpdates = callSyncApi(syncToken);
console.log("Todoist updates:");
console.table(syncUpdates);
var DUMMY_PERSIONAL_INTEGRATION_DATA = [
    { task_id: 3, event_id: 1, name: "Task 3", source: "todoist" },
    { task_id: 1, event_id: 2, name: "Task 2", source: "todoist" },
    { task_id: 6, event_id: 7, name: "Task 4", source: "todoist" },
];
function connectToIntegrationsDatabase() {
    console.log("Connecting to integrations database");
}
connectToIntegrationsDatabase();
// get existing updates from database
function getExistingIntegrations(updates) {
    console.log("Get existing integrations from database");
    // return elements from DUMMY_PERSIONAL_INTEGRATION_DATA that are in parsedUpdates
    var existingIntegrations = DUMMY_PERSIONAL_INTEGRATION_DATA.filter(function (integration) {
        return updates.some(function (update) { return update.id === integration.task_id; });
    });
    console.log("Existing integrations:");
    console.table(existingIntegrations);
    return existingIntegrations;
}
var existingIntegrations = getExistingIntegrations(syncUpdates);
// filter out existing integrations from syncUpdates and call this new integrations
function getNewIntegrations(updates, existingIntegrations) {
    console.log("Get new integrations");
    var newIntegrations = updates.filter(function (update) {
        return !existingIntegrations.some(function (integration) { return integration.task_id === update.id; });
    });
    console.log("New integrations:");
    console.table(newIntegrations);
    return newIntegrations;
}
var newIntergrations = getNewIntegrations(syncUpdates, existingIntegrations);
function createGoogleCalendarEvent(todoistUpdate) {
    console.log("Creating google calendar event for integration ");
    return {
        id: 0,
        name: todoistUpdate.name,
        dueDate: Date(),
        organizer: "Luvesh L Sadhwani"
    };
}
var newGoogleCalendarEvents = newIntergrations.map(createGoogleCalendarEvent);
// 5. For each existing integration, fetch the google event id from google calendar api
var DUMMY_GOOGLE_CALENDAR_EVENTS = [
    {
        id: 1,
        name: "Task 1",
        dueDate: Date(),
        organizer: "Luvesh L Sadhwani"
    },
    {
        id: 2,
        name: "Task 2",
        dueDate: Date(),
        organizer: "Luvesh L Sadhwani"
    },
];
function getGoogleCalendarEventsById(integrationIds) {
    console.log("Getting google calendar events by IDs");
    return DUMMY_GOOGLE_CALENDAR_EVENTS;
}
var existingGoogleCalendarEvents = getGoogleCalendarEventsById(existingIntegrations);
console.log("Existing google calendar events:");
console.table(existingGoogleCalendarEvents);
// 6. Update the google calendar event from existing integration
function updateGoogleCalendarEvent(googleCalendarEvent, todoistUpdate) {
    console.log("Updating google calendar event");
    return {
        id: googleCalendarEvent.id,
        name: todoistUpdate.name,
        dueDate: Date(),
        organizer: "Luvesh L Sadhwani"
    };
}
var updatedGoogleCalendarEvents = existingIntegrations.map(function (integration) {
    var googleCalendarEvent = existingGoogleCalendarEvents.find(function (event) { return event.id === integration.event_id; });
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
