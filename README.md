Heuristics:

Token Module = 1, 10
Todoist Module = 2
Integrations Module 3,8,9
Gcal module = 4,5,6,7


1. Get the sync token and previous request date time
2. Use the sync token to get updates from the todoist sync api
    2.1 If the token is lost, call the sync api with a blank sync token parameter
    2.2 Filter out the updates between the current and previous request date times
3. Check which updates are new and which are updates to existing integrations. Merge update events with existing integrations and store new integrations separately. 
4. For each new integration, create a new google calendar event
5. For each existing integration, fetch the google event id from google calendar api
6. Update the google calendar event from existing integration
7. Send an update to the google calendar api in a single batch
8. Update the new integrations with the new google event id
9. Upsert the array of new and existing integrations to the integrations database
10. Store the new sync token and the request date time

Typescript notes
1. We can provide a type inference if typescript cannot infer the typ

``` const x = ambiguousReturnType as number[]```
2. Typescript is aware of native node types
3. Provides a readonly modifier to a class property which makes the property immutable
4. Interfaces are open to extensions and can be re-opened, types are extended by intersections (type A = B & { key: value}). Rule of thumb is to use interfaces
5. If we use classes just to create objects, we can consider using interfaces (less bloated)
6. We can ensure arrays of objects to have an interface for each object
7. Literal types - useful for enum checking

