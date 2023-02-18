var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var fs = require("fs");
function getSyncTokenAndRequestDateTime() {
    console.log("Getting sync token");
    // get synctoken from text file
    var syncToken = fs.readFileSync("syncToken.txt", "utf8");
    console.log("Sync token: ", syncToken);
    var requestDateTime = new Date();
    return { syncToken: syncToken, requestDateTime: requestDateTime };
}
var _a = getSyncTokenAndRequestDateTime(), currentSyncToken = _a.syncToken, previousRequestDateTime = _a.requestDateTime;
// set the current request date time
var currentRequestDateTime = new Date();
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
var syncUpdates = callSyncApi(currentSyncToken);
console.log("Todoist updates:");
console.table(syncUpdates);
// filter out updates that are older than the previous request date
function filterUpdatesByRequestDateTime(updates, previousRequestDateTime) {
    console.log("Filtering updates by request date time");
    var filteredUpdates = updates.filter(function (update) {
        return new Date(update.dueDate) > previousRequestDateTime;
    });
    console.log("Filtered updates:");
    console.table(filteredUpdates);
    return filteredUpdates;
}
var filteredSyncUpdates = filterUpdatesByRequestDateTime(syncUpdates, previousRequestDateTime);
var DUMMY_PERSIONAL_INTEGRATION_DATA = [
    { task_id: 3, event_id: 1, name: "Task 3", source: "todoist" },
    { task_id: 1, event_id: 2, name: "Task 2", source: "todoist" },
    { task_id: 6, event_id: 7, name: "Task 4", source: "todoist" },
];
var connectToIntegrationsDatabase;
connectToIntegrationsDatabase = function () {
    console.log("Connecting to integrations database");
};
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
var existingIntegrations = getExistingIntegrations(filteredSyncUpdates);
// merge filtered sync updates with existing integrations. ensure this merge will use sync updates as the source of truth and override relevant fields in existing integrations
// ensure that keys between sync updates and existing integrations are shared
function mergeUpdatesWithExistingIntegrations(updates, existingIntegrations) {
    console.log("Merge updates with existing integrations");
    var mergedIntegrations = updates.map(function (update) {
        var existingIntegration = existingIntegrations.find(function (integration) { return integration.task_id === update.id; });
        if (existingIntegration) {
            // don't return id from update
            return {
                task_id: update.id,
                event_id: existingIntegration.event_id,
                name: update.name,
                label: update.label,
                source: "todoist"
            };
        }
        else {
            return {
                task_id: update.id,
                event_id: 0,
                name: update.name,
                label: update.label,
                source: "todoist"
            };
        }
    });
    console.log("Merged integrations:");
    console.table(mergedIntegrations);
    return mergedIntegrations;
}
var mergedIntegrations = mergeUpdatesWithExistingIntegrations(filteredSyncUpdates, existingIntegrations);
// filter out new integrations by checking if event_id is 0
function getNewIntegrations(updates, existingIntegrations) {
    console.log("Get new integrations");
    var newIntegrations = updates.filter(function (update) {
        return !existingIntegrations.some(function (integration) { return integration.task_id === update.id; });
    });
    console.log("New integrations:");
    console.table(newIntegrations);
    return newIntegrations;
}
var newIntergrations = getNewIntegrations(filteredSyncUpdates, mergedIntegrations);
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
// 7. Upsert the array of updates to the google calendar api
function upsertGoogleCalendarEventInBulk(googleCalendarEvents) {
    console.log("Google calendar events to upsert ", googleCalendarEvents.length);
    return googleCalendarEvents;
}
var response = upsertGoogleCalendarEventInBulk(updatedGoogleCalendarEvents);
// 8. Update the merged updates with the new google calendar event id
function updateMergedIntegrationsWithGoogleCalendarEventId(mergedIntegrations, googleCalendarEvents) {
    console.log("Updating merged integrations with google calendar event id");
    return mergedIntegrations.map(function (integration) {
        var googleCalendarEvent = googleCalendarEvents.find(function (event) { return event.name === integration.name; });
        if (googleCalendarEvent) {
            return __assign(__assign({}, integration), { event_id: googleCalendarEvent.id });
        }
        return integration;
    });
}
var parsedUpdates = updateMergedIntegrationsWithGoogleCalendarEventId(mergedIntegrations, response);
// 9. Upsert the array of merged updates to the integrations database
function upsertIntegrationInBulk(integrations) {
    console.log("Integrations to upsert ", integrations.length);
    return integrations;
}
upsertIntegrationInBulk(parsedUpdates);
// 10. Store the new sync token and the request date time
function storeSyncToken(syncToken, requestDateTime) {
    console.log("Storing sync token ", syncToken);
    // the current sync token is stored in the format sync_token_x, so increment the x, which represents how many runs the script has done
    var newRunNumber = parseInt(syncToken.split("_")[2]) + 1;
    var newSyncToken = "sync_token_".concat(newRunNumber);
    fs.writeFile("syncToken.txt", newSyncToken, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        console.log("Sync token stored");
    });
    console.log("Storing request date time", requestDateTime);
}
storeSyncToken(currentSyncToken, currentRequestDateTime);
