# Robobot

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.1.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

This application is a simple chat bot that bases its responses on fuzzy logic against a pre determined set of questions.

The UI/UX was designed to be as simple as possible, with the user only needing to enter their question they wish to ask the bot.

A realistic "Bot is typing" message is displayed while the bot is processing the question. This is an artificial delay to simulate the bot thinking. This gives the end user the impression that the bot is actually thinking about the question or that they may be discussion the question with a human.

The bot is able to look at answers and propose a new question based on the answer. This is done by using the fuzzy logic to determine the most likely answer and then using the answer to propose a new question.

This bot can also detect that question is not in the predetermined set of questions and will respond with a message to that effect, and attempt to process the quesiton as a calculation.

I found the next instruction a little confusing.

> "For this exercise, you can assume that the RoboBob app will run continuously after the session starts. Therefore, there is no need to persist any data beyond the question list."

I took this as the bot needed to retain the questions that were asked, but i was unsure if the bot needed to retain the answers to the questions. I decided to implement the bot to retain the answers to the questions as well. If this is an incorrect assumption, then the bot can be easily modified to only retain the questions.
