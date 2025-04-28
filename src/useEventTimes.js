import { ref } from 'vue';
import axios from 'axios';

export function useEventTimes() {
  const eventStart = ref(new Date());
  const eventEnd = ref(new Date());
  const cutoff = ref(new Date());
  const countdownTimer = ref(new Date());
  const walkInStart = ref(new Date());
  const buttonStart = ref(new Date());

  async function fetchEventTimes(eventId = 'testEvent5') {
    const res = await axios.get(`https://wzun0tc594.execute-api.us-west-2.amazonaws.com/eventTimes?eventId=${eventId}`);
    const data = res.data;
    eventStart.value = new Date(data.start);
    eventEnd.value = new Date(data.end);
    cutoff.value = new Date(data.cutoff);
    countdownTimer.value = new Date(data.countdownTimer);
    walkInStart.value = new Date(data.walkInStart);
    buttonStart.value = new Date(data.buttonStart);
  }

  async function fetchServerTime() {
    const res = await axios.get(`https://s6ivtaeizj.execute-api.us-west-2.amazonaws.com/returnUTC`);
    const serverDate = res.data.serverDate;
    return new Date(serverDate);
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
