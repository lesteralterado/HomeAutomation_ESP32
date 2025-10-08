Firebase Cloud Function that executes schedules saved in Realtime Database.

Deployment
1. Install dependencies:
   cd functions; npm ci

2. Initialize / login with Firebase CLI and target the correct project:
   firebase login
   firebase projects:list
   firebase use <PROJECT_ID>

3. Deploy the function:
   firebase deploy --only functions:runSchedules

Configuration
- TIMEZONE: Optional environment variable to change timezone (IANA name). Defaults to UTC.
  Example:
    firebase functions:config:set app.timezone="Asia/Singapore"

Notes
- This function runs every minute. It checks `/schedules` entries of the shape:
  { relay: 'relay1', time: 'HH:mm', action: 'ON'|'OFF', createdAt: 123456789 }

- When the schedule time matches the current time (in the configured timezone), the function sets `relays/{relay}` to true or false accordingly and records a small log under `/scheduleLogs`.
