<!-- src/App.vue - Main application component for event launch page -->
<template>
  <div id="app">
    <!-- Main event title -->
    <h1>Event Launch Page</h1>

    <!-- Debug Box - Displays real-time information about event timing and state -->
    <div class="debug-box">
      <h3>Debug Information</h3>
      <div class="debug-content">
        <!-- Current server time display -->
        <p><strong>Server Time:</strong> {{ formatDateTime(now) }}</p>
        <!-- Current event state with descriptive label -->
        <p><strong>Current State:</strong> {{ getStateLabel(evtStatus) }}</p>
        <!-- Event timing sequence in chronological order -->
        <p><strong>Walk-in Start:</strong> {{ formatDateTime(walkInStart) }}</p>
        <p><strong>Event Start:</strong> {{ formatDateTime(eventStart) }}</p>
        <p><strong>Button Start:</strong> {{ formatDateTime(buttonStart) }}</p>
        <p><strong>Event End:</strong> {{ formatDateTime(eventEnd) }}</p>
      </div>
    </div>

    <!-- Event Status Messages - Different messages based on current event state -->
    <div v-if="evtStatus === 0">Before event day (countdown running)</div>
    <div v-else-if="evtStatus === 1">Pre-event: walk-in soon</div>
    <div v-else-if="evtStatus === 2">Walk-in video playing</div>
    <div v-else-if="evtStatus === 3">Main event video playing</div>
    <div v-else-if="evtStatus === 4">Event is completed</div>
    <div v-else-if="evtStatus === 5">Event is fully over</div>

    <!-- Countdown Timer - Shows remaining time until next event phase -->
    <div v-if="showCountdown" class="countdown">
      <p>Countdown: {{ cdDays }}d {{ cdHours }}h {{ cdMinutes }}m {{ cdSeconds }}s</p>
    </div>

    <!-- Walk-in Video Player - Shown during pre-event phase -->
    <div v-if="evtStatus === 2" class="video-container">
      <div class="main-video-embed">
        <iframe
          src="https://player.vimeo.com/video/140273446?autoplay=1&muted=1"
          width="640"
          height="360"
          frameborder="0"
          allow="autoplay; fullscreen"
          allowfullscreen
        ></iframe>
      </div>
    </div>

    <!-- Main Event Video Player - Shown during main event -->
    <div v-if="evtStatus === 3" class="video-container">
      <div class="main-video-embed">
        <iframe
          src="https://player.vimeo.com/video/308980461?autoplay=1&muted=1"
          width="640"
          height="360"
          frameborder="0"
          allow="autoplay; fullscreen"
          allowfullscreen
        ></iframe>
      </div>
    </div>

    <!-- Interactive Button - Shown at specific times during the event -->
    <div v-if="showButton" class="test-btn-container">
      <button class="test-green-btn">We were robbed!</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'App',
  
  // Component state management
  data() {
    return {
      // Event status (0-5) representing different phases of the event
      evtStatus: 0,
      
      // Current time, updated regularly and synced with server
      now: new Date(),
      
      // Countdown timer components
      cdDays: 0,
      cdHours: 0,
      cdMinutes: 0,
      cdSeconds: 0,
      showCountdown: true,
      
      // Button visibility control
      showButton: false,
      
      // Event timing variables
      eventStart: new Date(),    // Main event start time
      eventEnd: new Date(),      // Main event end time
      cutoff: new Date(),        // Event cutoff time
      countdownTimer: new Date(), // Countdown reference time
      walkInStart: new Date(),    // Pre-event walk-in start time
      buttonStart: new Date(),    // Time when interactive button should appear
      
      // Interval timers for updates
      timingsInterval: null,     // Server sync interval
      clockInterval: null        // Local clock update interval
    }
  },

  methods: {
    /**
     * Formats a date object into a readable string
     * @param {Date} date - The date to format
     * @returns {string} Formatted date string in MM/DD/YYYY, HH:MM AM/PM format
     */
    formatDateTime(date) {
      if (!date) return 'Not set'
      try {
        return date.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      } catch (e) {
        console.error('Date formatting error:', e)
        return 'Invalid Date'
      }
    },

    /**
     * Converts numeric event status to descriptive label
     * @param {number} status - Event status code (0-5)
     * @returns {string} Descriptive status label
     */
    getStateLabel(status) {
      const states = {
        0: 'Before event (countdown running)',
        1: 'Pre-event: walk-in soon',
        2: 'Walk-in video playing',
        3: 'Main event video playing',
        4: 'Event completed',
        5: 'Event fully over'
      }
      return `${status}: ${states[status] || 'Unknown'}`
    },

    /**
     * Updates event status based on current time relative to event timings
     * Compares current time against walk-in, event start, and event end times
     */
    updateStatus() {
      const now = this.now.getTime()
      const walkInTime = this.walkInStart.getTime()
      const eventStartTime = this.eventStart.getTime()
      const eventEndTime = this.eventEnd.getTime()

      // Debug logging of time comparisons
      console.log('Time checks:', {
        now: new Date(now).toLocaleString(),
        walkIn: new Date(walkInTime).toLocaleString(),
        eventStart: new Date(eventStartTime).toLocaleString(),
        eventEnd: new Date(eventEndTime).toLocaleString()
      })

      // Determine current event status based on time comparisons
      if (now >= eventEndTime) {
        this.evtStatus = 5  // Event fully over
      } else if (now >= eventStartTime) {
        this.evtStatus = 3  // Main event playing
      } else if (now >= walkInTime) {
        this.evtStatus = 2  // Walk-in video
      } else {
        this.evtStatus = 0  // Before event
      }
    },

    /**
     * Updates countdown timer display
     * Calculates days, hours, minutes, and seconds until next event phase
     */
    updateCountdown() {
      if (!this.countdownTimer || !this.now) return
      
      const diff = this.countdownTimer.getTime() - this.now.getTime()
      console.log('Countdown diff:', diff)

      if (diff > 0) {
        this.showCountdown = true
        // Convert milliseconds to days, hours, minutes, seconds
        this.cdDays = Math.floor(diff / (1000 * 60 * 60 * 24))
        this.cdHours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        this.cdMinutes = Math.floor((diff / (1000 * 60)) % 60)
        this.cdSeconds = Math.floor((diff / 1000) % 60)
      } else {
        this.showCountdown = false
      }
    },

    /**
     * Controls visibility of interactive button based on timing
     */
    updateButtonVisibility() {
      if (!this.buttonStart || !this.now) return
      this.showButton = this.now >= this.buttonStart
    },

    /**
     * Fetches event timing data from API
     * Updates all event-related times (walk-in, start, end, button)
     */
    async fetchEventTimes() {
      try {
        const res = await axios.get('https://wzun0tc594.execute-api.us-west-2.amazonaws.com/eventTimes?eventId=testEvent5')
        const data = res.data
        if (!data) {
          console.error('No data in response:', res)
          return
        }

        // Debug log the raw data
        console.log('Data before parsing:', data)

        // Parse the dates using the correct fields
        this.eventStart = new Date(data.eventStart.replace(' MDT', ''))
        this.walkInStart = new Date(data.walkInStart.replace(' MDT', ''))
        this.eventEnd = new Date(data.eventEnd.replace(' MDT', ''))
        this.buttonStart = new Date(data.buttonStart.replace(' MDT', ''))  // Use buttonStart instead of eventStartDay
        this.countdownTimer = new Date(data.countdownTimer.replace(' MDT', ''))  // Add countdown timer

        // Log the parsed times for verification
        console.log('Times after parsing:', {
          eventStart: this.eventStart.toLocaleString(),
          walkInStart: this.walkInStart.toLocaleString(),
          eventEnd: this.eventEnd.toLocaleString(),
          buttonStart: this.buttonStart.toLocaleString(),
          countdownTimer: this.countdownTimer.toLocaleString()
        })

      } catch (error) {
        console.error('Error in fetchEventTimes:', error)
      }
    },

    /**
     * Fetches current time from server to ensure synchronization
     * @returns {Date} Server time as Date object
     */
    async fetchServerTime() {
      try {
        const res = await axios.get('https://s6ivtaeizj.execute-api.us-west-2.amazonaws.com/returnUTC')
        console.log('Server time response:', res.data)
        return new Date(res.data.serverDate)
      } catch (error) {
        console.error('Error fetching server time:', error)
        return new Date()
      }
    }
  },

  /**
   * Lifecycle hook: Called when component is mounted
   * Initializes timers and starts periodic updates
   */
  async mounted() {
    try {
      // Initial data fetch
      await this.fetchEventTimes()
      this.now = await this.fetchServerTime()
      this.updateStatus()

      // Set up 1-second interval for local time updates
      this.clockInterval = setInterval(() => {
        this.now = new Date(this.now.getTime() + 1000)
        this.updateStatus()
        this.updateCountdown()
        this.updateButtonVisibility()
      }, 1000)

      // Set up 2-second interval for server synchronization
      this.timingsInterval = setInterval(async () => {
        await this.fetchEventTimes()
        const serverTime = await this.fetchServerTime()
        if (serverTime) {
          this.now = serverTime
        }
        this.updateStatus()
      }, 2000)

    } catch (error) {
      console.error('Error during initialization:', error)
    }
  },

  /**
   * Lifecycle hook: Called before component is destroyed
   * Cleans up intervals to prevent memory leaks
   */
  beforeDestroy() {
    if (this.timingsInterval) {
      clearInterval(this.timingsInterval)
      this.timingsInterval = null
    }
    if (this.clockInterval) {
      clearInterval(this.clockInterval)
      this.clockInterval = null
    }
  }
}
</script>

<style>
/* Main app container */
#app {
  font-family: Arial, sans-serif;
  padding: 20px;
}

/* Video container with 16:9 aspect ratio */
.main-video-embed {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
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

/* Interactive button styling */
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

.test-btn-container {
  margin-top: 30px;
}

/* Debug information box styling */
.debug-box {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: #00ff00;
  padding: 15px;
  border-radius: 5px;
  font-family: monospace;
  z-index: 1000;
  max-width: 400px;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
}

.debug-box h3 {
  margin: 0 0 10px 0;
  color: #00ff00;
  border-bottom: 1px solid #00ff00;
  padding-bottom: 5px;
}

.debug-box .debug-content {
  font-size: 14px;
}

.debug-box p {
  margin: 5px 0;
}

.debug-box strong {
  color: #00ff00;
}

/* Countdown timer styling */
.countdown {
  font-size: 1.2em;
  margin: 20px 0;
}
</style>
