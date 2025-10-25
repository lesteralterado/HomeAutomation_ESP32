# Push Notifications Guide for Home Automation App

Hello! This guide will help you understand how push notifications work in our smart home app. It's made simple, like for 6th graders!

## What are Push Notifications?

Push notifications are like little messages that pop up on your phone. They tell you when something happens in your smart home, like when a light turns on by itself because of a schedule.

## Step 1: Allow Notifications

When you open the app for the first time:
1. Your phone will ask: "Allow notifications?"
2. Tap "Allow" so the app can send you messages.

## Step 2: Test Notifications

In the app, at the bottom, there's a green button that says "🔔 Test Notification".
1. Tap it.
2. You should see a notification pop up on your phone!

## Step 3: Schedule Notifications

When you set a schedule for your lights or fans:
1. Go to the Schedule button (bottom right).
2. Add a time and choose to turn ALL relays ON or OFF.
3. Save it.
4. At that time, the app will turn ALL relays ON/OFF AND send you a notification!

**New Feature:** Schedules now control ALL your relays at once! When you set a schedule, it affects every device in your home simultaneously.

## How It Works (For Curious Kids)

- The app talks to Firebase (like a big computer in the cloud).
- When it's time for a schedule, Firebase tells your phone: "Hey, show this message!"
- Your phone shows the notification, even if the app is closed.

## Fun Facts

- Notifications work on iPhone and Android.
- They help you know what's happening at home, even when you're not there.
- It's like your home is texting you!

## Testing Push Notifications on Android

Important: Starting with Expo SDK 53, push notifications (remote notifications) are not supported in Expo Go on Android. To test push notifications on Android, you need to use a development build.

### Steps to Create a Development Build:

1. **Install EAS CLI** (if not already installed):
   ```
   npm install -g eas-cli
   ```

2. **Login to Expo** (if not already logged in):
   ```
   eas login
   ```

3. **Build the development APK**:
   ```
   eas build --platform android --profile development
   ```
   This will create a development build that includes push notification support.

4. **Install the APK on your Android device**:
   - Download the APK from the build link provided by EAS.
   - Install it on your Android device or emulator.

5. **Run the app**:
   - Open the installed app.
   - Test notifications as described in Step 2.

Note: Development builds allow you to test features not available in Expo Go, like push notifications on Android.

## Testing the New Unified Schedule System

Your schedules now control ALL relays at once! Here's how to test:

1. **Manual Control**: Turn any relay ON manually - you'll see a ⏰ icon appear, meaning schedules are now enabled
2. **Create Schedule**: Set a schedule to turn ALL relays ON or OFF at a specific time
3. **Test Execution**: Use the manual test endpoint to trigger schedules immediately:
   ```
   POST https://us-central1-home-automation-esp-d7d8c.cloudfunctions.net/runSchedulesManual?time=14:05
   ```
   Replace `14:05` with the current time to test your schedules

## Troubleshooting

- If no notifications: Check if you said "Allow" when asked.
- Still no? Try closing and reopening the app.
- On Android: Make sure you're using a development build, not Expo Go.
- Schedules not working: Check that the relay is manually turned ON first (⏰ icon should appear)

Enjoy your smart home! 🏠✨