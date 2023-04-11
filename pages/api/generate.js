import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const googleCalendarApiKey = process.env.GOOGLE_CALENDAR_API_KEY
const calendarId = process.env.GOOGLE_CALENDAR_ID;
const openai = new OpenAIApi(configuration);
const { google } = require('googleapis');
const calendar = google.calendar('v3');

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }
  const eventText = await getCalendarEvents();

  const character = req.body.character;
  // res.status(200).json({result: eventText + character})
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: generatePrompt(eventText,character),
    });
    res.status(200).json({ result: completion.data.choices[0].message.content });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generatePrompt(eventText, character) {
  return [
    {"role": "system", "content": `You are a helpful assistant for basketball group chat s reminder. You should act as you are a ${character}.`},
    {"role": "user", "content": `Please tell me next schedule of basketball session. Here is the info. ${eventText}. Tell us bullet points and use emojis.`},
]
}

async function getCalendarEvents() {
  let ret = "";
  try {
    const now = new Date().toISOString();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 60);
    const endDateString = endDate.toISOString();

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: now,
      timeMax: endDateString,
      singleEvents: true,
      orderBy: 'startTime',
      key: googleCalendarApiKey,
    });

    const events = response.data.items;

    if (events.length === 0) {
      console.log('No upcoming events found.');
      ret += `no upcoming events`
      return ret
    } else {
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const start = event.start.dateTime || event.start.date;
        console.log(`${start} - ${event.summary}`);
        ret += `${start} - ${event.summary}\n`;
      }
    }
    return ret
  } catch (error) {
    console.error('Error retrieving events', error);
    return `got error retrieving events`
  }
}