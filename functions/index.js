const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { DateTime } = require('luxon');
const { Expo, ExpoPushMessage, ExpoPushToken } = require('expo-server-sdk');

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

// Function to send push notification
async function sendPushNotification(message) {
  try {
    const tokenSnap = await db.ref('pushToken').once('value');
    const token = tokenSnap.val();
    if (!token) {
      console.log('No push token found');
      return;
    }

    if (!Expo.isExpoPushToken(token)) {
      console.error(`Push token ${token} is not a valid Expo push token`);
      return;
    }

    const expo = new Expo();
    const messages = [{
      to: token,
      sound: 'default',
      body: message,
      data: { withSome: 'data' },
    }];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending push notification:', error);
      }
    }

    console.log('Push notification sent:', tickets);
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
  }
}

// Reusable handler so the same logic can be invoked by the scheduled trigger and by an HTTP test trigger
async function runSchedulesHandler(overrideNow) {
  const now = overrideNow || DateTime.now().setZone(TIMEZONE);
  const hhmm = now.toFormat('HH:mm');
  const minuteKey = now.toFormat('yyyyLLddHHmm'); // unique minute key

  console.log(`runSchedules triggered at ${now.toISO()} (${TIMEZONE}) — checking schedules for ${hhmm}`);

  const schedulesSnap = await db.ref('schedules').once('value');
  const schedules = schedulesSnap.val();
  if (!schedules) {
    console.log('No schedules found.');
    return { executed: 0 };
  }

  const updates = {};
  const logEntries = [];

  // First, get current relay states and schedule enabled states
  const relaysSnap = await db.ref('relays').once('value');
  const currentRelays = relaysSnap.val() || {};

  const scheduleEnabledSnap = await db.ref('scheduleEnabled').once('value');
  const scheduleEnabled = scheduleEnabledSnap.val() || {};

  for (const [id, s] of Object.entries(schedules)) {
    try {
      const schedule = s;
      if (!schedule || !schedule.time || !schedule.relay || !schedule.action) continue;

      // Prevent executing the same schedule multiple times in the same minute
      if (schedule._lastExecutedMinute === minuteKey) continue;

      if (schedule.time === hhmm) {
        const desiredState = schedule.action === 'ON' ? true : false;

        // Check if ANY relay needs to change state (since schedules now control ALL relays)
        const relaysThatNeedChange = Object.keys(currentRelays).filter(relayKey => {
          const currentState = currentRelays[relayKey] || false;
          const isScheduleEnabled = scheduleEnabled[relayKey] || false;
          return currentState !== desiredState && isScheduleEnabled;
        });

        // If any relays need to change, update ALL relays to the desired state
        if (relaysThatNeedChange.length > 0) {
          // Update all relays to the desired state
          Object.keys(currentRelays).forEach(relayKey => {
            updates[`relays/${relayKey}`] = desiredState;
          });

          // mark schedule as executed for this minute
          updates[`schedules/${id}/_lastExecutedMinute`] = minuteKey;
          updates[`schedules/${id}/lastRunAt`] = now.toISO();

          logEntries.push({ id, relay: 'ALL', time: schedule.time, action: schedule.action, executedAt: now.toISO() });
        }
      }
    } catch (err) {
      console.error('Error processing schedule', id, err);
    }
  }

  if (Object.keys(updates).length === 0) {
    console.log('No matching schedules to run this minute.');
    return { executed: 0 };
  }

  // Perform a single multi-path update
  await db.ref().update(updates);

  // Optionally append logs under /scheduleLogs
  const logsRef = db.ref('scheduleLogs');
  for (const entry of logEntries) {
    await logsRef.push(entry);
  }

  // Send push notification if there were executions
  if (logEntries.length > 0) {
    await sendPushNotification(`Scheduled action executed: ${logEntries.map(e => `${e.relay} ${e.action}`).join(', ')}`);
  }

  console.log(`Executed ${logEntries.length} schedule(s).`);
  return { executed: logEntries.length };
}

exports.runSchedules = functions.pubsub.schedule('* * * * *').timeZone(TIMEZONE).onRun(async (context) => {
  return runSchedulesHandler();
});

// HTTP test trigger to allow manual runs for debugging. Call with a simple GET/POST request.
exports.runSchedulesManual = functions.https.onRequest(async (req, res) => {
  try {
    // Optional: allow overriding time via query param 'time' in ISO or 'HH:mm'?
    // If 'time' is provided as 'HH:mm', we'll build a DateTime in the configured timezone for today.
    let overrideNow;
    const timeParam = req.query.time || req.body && req.body.time;
    if (timeParam && /^[0-9]{1,2}:[0-9]{2}$/.test(String(timeParam))) {
      const [h, m] = String(timeParam).split(':').map(x => parseInt(x, 10));
      overrideNow = DateTime.now().setZone(TIMEZONE).set({ hour: h, minute: m, second: 0, millisecond: 0 });
      console.log('Manual trigger using override time', overrideNow.toISO());
    }

    const result = await runSchedulesHandler(overrideNow);
    res.status(200).json({ ok: true, result });
  } catch (err) {
    console.error('Manual runSchedules failed', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});
