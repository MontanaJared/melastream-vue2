<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- Main event title -->
    <h1>Event Launch Page</h1>

    <!-- Event status messages based on evtStatus -->
    <div v-if="evtStatus === 0">Before event day (countdown running)</div>
    <div v-else-if="evtStatus === 1">Pre-event: walk-in soon</div>
    <div v-else-if="evtStatus === 2">Walk-in video playing</div>
    <div v-else-if="evtStatus === 3">Main event video playing</div>
    <div v-else-if="evtStatus === 4">Event is completed</div>
    <div v-else-if="evtStatus === 5">Event is fully over</div>

    <!-- Countdown timer display -->
    <div v-if="showCountdown">
      <p>Countdown: {{ cdDays }}d {{ cdHours }}h {{ cdMinutes }}m {{ cdSeconds }}s</p>
    </div>

    <!-- Walk-in video section (shows only during walk-in period) -->
    <div v-if="evtStatus === 2">
      <div class="main-video-embed">
        <iframe
          src="https://player.vimeo.com/video/140273446?autoplay=1&muted=1"
          width="640"
          height="360"
          frameborder="0"
          allow="autoplay; fullscreen"
          allowfullscreen
          style="max-width: 100%;"
        ></iframe>
      </div>
    </div>

    <!-- Main event video section (shows only during main event) -->
    <div v-if="evtStatus === 3">
      <div class="main-video-embed">
        <iframe
          src="https://player.vimeo.com/video/308980461?autoplay=1&muted=1"
          width="640"
          height="360"
          frameborder="0"
          allow="autoplay; fullscreen"
          allowfullscreen
          style="max-width: 100%;"
        ></iframe>
      </div>
    </div>

    <!-- Test Button: Appears when now >= buttonStart -->
    <div v-if="showButton" class="test-btn-container">
      <button class="test-green-btn">We were robbed!</button>
    </div>
  </div>
</template>

<script setup>
// Import Vue composition API utilities
import { ref, onMounted, onUnmounted } from 'vue';
// Import the event timing composable
import { useEventTimes } from './useEventTimes'; // Provides event timing refs and fetchers

// Event status: 0=before event, 1=pre-walkin, 2=walk-in, 3=main event, 4=completed, 5=over
const evtStatus = ref(0);
// Holds the current time (updated every second)
const now = ref(new Date());

// Countdown timer pieces
const cdDays = ref(0);
const cdHours = ref(0);
const cdMinutes = ref(0);
const cdSeconds = ref(0);

// Controls visibility of countdown and test button
const showCountdown = ref(true);
const showButton = ref(false);

// Destructure all event timing refs and fetchers from the composable
const {
  eventStart,    // Main event start time
  eventEnd,      // Main event end time
  cutoff,        // Event cutoff time
  countdownTimer,// Countdown target time
  walkInStart,   // Walk-in video start time
  buttonStart,   // Time when the test button should appear
  fetchEventTimes, // Fetches event timings from Lambda
  fetchServerTime, // Fetches current server time
} = useEventTimes();

let timingsInterval = null; // Will hold the polling interval ID

// Lifecycle: on mount, fetch timings and start intervals
onMounted(async () => {
  // Initial fetch of event timings and server time
  await fetchEventTimes('testEvent5');
  now.value = await fetchServerTime();

  // Update the clock, event status, countdown, and button every second
  setInterval(() => {
    now.value = new Date(now.value.getTime() + 1000);
    updateStatus();
    updateCountdown();
    updateButtonVisibility();
  }, 1000);

  // Poll for new event timings every 10 seconds
  timingsInterval = setInterval(async () => {
    await fetchEventTimes('testEvent5');
  }, 10000); // 10,000 ms = 10 seconds
});

// Lifecycle: clear polling interval on unmount
onUnmounted(() => {
  if (timingsInterval) clearInterval(timingsInterval);
});

// Updates the event status based on current time and event timings
function updateStatus() {
  if (now.value >= eventEnd.value) {
    evtStatus.value = 5; // Event fully over
  } else if (now.value >= eventStart.value) {
    evtStatus.value = 3; // Event live
  } else if (now.value >= walkInStart.value) {
    evtStatus.value = 2; // Walk-in video
  } else {
    evtStatus.value = 0; // Before walk-in
  }
}

// Updates the countdown timer display and visibility
function updateCountdown() {
  const diff = countdownTimer.value.getTime() - now.value.getTime();

  if (diff > 0) {
    showCountdown.value = true; // Re-enable countdown if timer is in the future
    cdDays.value = Math.floor(diff / (1000 * 60 * 60 * 24));
    cdHours.value = Math.floor((diff / (1000 * 60 * 60)) % 24);
    cdMinutes.value = Math.floor((diff / (1000 * 60)) % 60);
    cdSeconds.value = Math.floor((diff / 1000) % 60);
  } else {
    showCountdown.value = false;
  }
}

// Controls the visibility of the test button based on buttonStart
function updateButtonVisibility() {
  if (buttonStart && buttonStart.value && now.value >= buttonStart.value) {
    showButton.value = true;
  } else {
    showButton.value = false;
  }
}
</script>

<style>
#app {
  font-family: Arial, sans-serif;
  padding: 20px;
}

/* Responsive video embed for walk-in and main event */
.main-video-embed {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
  overflow: hidden;
  max-width: 100%;
}
.main-video-embed iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Green, rounded test button styling */
.test-green-btn {
  background-color: #27ae60;
  color: #fff;
  border: none;
  border-radius: 24px;
  padding: 12px 32px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.15);
  transition: background 0.2s;
}
.test-green-btn:hover {
  background-color: #219150;
}

/* Adds spacing above the test button */
.test-btn-container {
  margin-top: 30px;
}
</style>
