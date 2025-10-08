const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { DateTime } = require('luxon');

admin.initializeApp();
const db = admin.database();

/**
 * Cron job that runs every minute.
 * It reads /schedules and executes any schedule that matches the current time (HH:mm) and hasn't been executed for this minute.
 * Execution strategy:
 *  - For each schedule entry { relay, time: 'HH:mm', action: 'ON'|'OFF', createdAt }
 *  - If schedule.time === current HH:mm (in UTC offset specified below) AND lastExecutedMinute !== currentMinute, then set relays/{relay} accordingly and update lastExecutedMinute and a small log.
 *
 * NOTE: This function keeps execution idempotent per-minute by recording lastExecutedMinute on each schedule entry.
 */

// Configure timezone if you want local timezone handling. Use IANA names like 'Asia/Singapore'.
const TIMEZONE = process.env.TIMEZONE || 'UTC';

exports.runSchedules = functions.pubsub.schedule('* * * * *').timeZone(TIMEZONE).onRun(async (context) => {
  const now = DateTime.now().setZone(TIMEZONE);
  const hhmm = now.toFormat('HH:mm');
  const minuteKey = now.toFormat('yyyyLLddHHmm'); // unique minute key

  console.log(`runSchedules triggered at ${now.toISO()} (${TIMEZONE}) — checking schedules for ${hhmm}`);

  const schedulesSnap = await db.ref('schedules').once('value');
  const schedules = schedulesSnap.val();
  if (!schedules) {
    console.log('No schedules found.');
    return null;
  }

  const updates = {};
  const logEntries = [];

  for (const [id, s] of Object.entries(schedules)) {
    try {
      const schedule = s;
      if (!schedule || !schedule.time || !schedule.relay || !schedule.action) continue;

      // Prevent executing the same schedule multiple times in the same minute
      if (schedule._lastExecutedMinute === minuteKey) continue;

      if (schedule.time === hhmm) {
        const relayPath = `relays/${schedule.relay}`;
        const value = schedule.action === 'ON' ? true : false;
        updates[relayPath] = value;

        // mark schedule as executed for this minute
        updates[`schedules/${id}/_lastExecutedMinute`] = minuteKey;
        updates[`schedules/${id}/lastRunAt`] = now.toISO();

        logEntries.push({ id, relay: schedule.relay, time: schedule.time, action: schedule.action, executedAt: now.toISO() });
      }
    } catch (err) {
      console.error('Error processing schedule', id, err);
    }
  }

  if (Object.keys(updates).length === 0) {
    console.log('No matching schedules to run this minute.');
    return null;
  }

  // Perform a single multi-path update
  await db.ref().update(updates);

  // Optionally append logs under /scheduleLogs
  const logsRef = db.ref('scheduleLogs');
  for (const entry of logEntries) {
    await logsRef.push(entry);
  }

  console.log(`Executed ${logEntries.length} schedule(s).`);
  return null;
});
