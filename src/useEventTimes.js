import { ref } from '@vue/composition-api';
import axios from 'axios';

export function useEventTimes() {
  const eventStart = ref(new Date());
  const eventEnd = ref(new Date());
  const cutoff = ref(new Date());
  const countdownTimer = ref(new Date());
  const walkInStart = ref(new Date());
  const buttonStart = ref(new Date());

  function parseMDTDate(dateStr) {
    if (!dateStr) return new Date();
    // Convert "April 29, 2025 15:33:00 MDT" to ISO format with timezone
    const date = new Date(dateStr);
    // Adjust for MDT (UTC-6)
    date.setHours(date.getHours() - 6);
    return date;
  }

  async function fetchEventTimes(eventId = 'testEvent5') {
    try {
      const res = await axios.get(`https://wzun0tc594.execute-api.us-west-2.amazonaws.com/eventTimes?eventId=${eventId}`);
      const data = res.data;
      console.log('Raw API response:', data);

      if (data) {
        // Log each field before parsing
        console.log('eventStart:', data.eventStart);
        console.log('walkInStart:', data.walkInStart);
        console.log('buttonStart:', data.buttonStart);
        console.log('eventEnd:', data.eventEnd);
        console.log('countdownTimer:', data.countdownTimer);

        eventStart.value = parseMDTDate(data.eventStart);
        eventEnd.value = parseMDTDate(data.eventEnd);
        cutoff.value = parseMDTDate(data.cutoff);
        countdownTimer.value = parseMDTDate(data.countdownTimer);
        walkInStart.value = parseMDTDate(data.walkInStart);
        buttonStart.value = parseMDTDate(data.buttonStart);

        // Log parsed dates
        console.log('Parsed dates:', {
          eventStart: eventStart.value.toISOString(),
          eventEnd: eventEnd.value.toISOString(),
          cutoff: cutoff.value.toISOString(),
          countdownTimer: countdownTimer.value.toISOString(),
          walkInStart: walkInStart.value.toISOString(),
          buttonStart: buttonStart.value.toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching event times:', error);
    }
  }

  async function fetchServerTime() {
    try {
      const res = await axios.get(`https://s6ivtaeizj.execute-api.us-west-2.amazonaws.com/returnUTC`);
      console.log('Server time response:', res.data);
      const serverDate = new Date(res.data.serverDate);
      console.log('Parsed server time:', serverDate.toISOString());
      return serverDate;
    } catch (error) {
      console.error('Error fetching server time:', error);
      return new Date();
    }
  }

  return {
    eventStart,
    eventEnd,
    cutoff,
    countdownTimer,
    walkInStart,
    buttonStart,
    fetchEventTimes,
    fetchServerTime,
  };
}
