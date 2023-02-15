Heuristics:

1. Get the sync token from integrations database
2. Use the sync token to get updates from the todoist sync api
3. Check which updates are new and which are updates to existing integrations. Merge update events with existing integrations and store new integrations separately. 
4. For each new integration, create a new google calendar event
5. For each existing integration, fetch the google event id from google calendar api
6. Update the google calendar event from existing integration
7. Send an update to the google calendar api in a single batch
8. Update the new integrations with the new google event id
9. Upsert the array of new and existing integrations to the integrations database
10. Store the new sync token in the integrations database
