import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ConversationModel} from "./models/conversation.model";
import {questionsList} from "./questions/questions.mock";
import fuzzysort from 'fuzzysort'
import * as math from 'mathjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'RoboBob';
  question = '';
  conversationLog: ConversationModel[] = [];
  @ViewChild('inputRef', {static: false}) input!: ElementRef;
  @ViewChild('conversationContainer', {static: false}) conversationContainer!: ElementRef;

  questionsList = questionsList;
  answering: boolean = false;
  randomQuestions = [];
  name = 'RoboBob';

  sendQuestion() {
    const time = new Date().getTime().toString();
    this.conversationLog.push({text: this.question, type: 'user', time});
    this.answering = true;

    setTimeout(() => {
      this.scrollToBottom();
    }, 100);

    setTimeout((question: any) => {
      this.answering = false;
      this.answerQuestion(question);
    }, 1600, this.question);

    this.question = '';
    this.input?.nativeElement.focus();
  }

  answerQuestion(question: any) {
    const time = new Date().getTime().toString();
    let answer: ConversationModel;

    const cleanedQuestion = question.replace(/['"]/g, '');

    const [searcherAnswer, searcherQuestion] = [
      fuzzysort.go(cleanedQuestion, this.questionsList, {key: 'question'}),
      fuzzysort.go(cleanedQuestion, this.questionsList, {key: 'answer'})
    ];

    if (searcherAnswer[0] !== undefined) {
      const [text1, text2] = [searcherAnswer[0].obj.answer, searcherAnswer[1]?.obj.answer];

      let text = text1;
      if (text2 && text1 !== text2 && searcherAnswer[1].score > -0.8) {
        text += `, or it may be ${text2}`;
      }

      text = text.replace('{{TIME}}', new Date().toLocaleTimeString());
      text = text.replace('{{DATE}}', new Date().toLocaleDateString());

      answer = {text, type: 'bot', time};
    } else if (searcherQuestion[0] !== undefined) {
      const [q, a] = [searcherQuestion[0].obj.question, searcherQuestion[0].obj.answer];
      const text = `I have found this question which might serve as an answer. ${q} The answer being, ${a}.`;

      answer = {text, type: 'bot', time};
    } else {
      const calculation = question.replace(/[^0-9\+\-\*\/\.]/g, '');
      const calcResult = math.evaluate(calculation);
      if (calcResult === undefined) {
        answer = {text: 'Could you please rephrase your question', type: 'bot', time};
      } else {
        answer = {text: `I have calculated that to be ${calcResult}`, type: 'bot', time};
      }
    }

    this.conversationLog.push(answer);

    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  shuffleArray() {
    const array = this.questionsList;
    const arrayLength = array.length;
    for (let i = arrayLength - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      array.splice(i, 1, array.splice(j, 1, array[i])[0]);
    }
    return array;
  }

  ngOnInit() {
    this.answering = true;
    const exampleQuestions = this.shuffleArray().slice(0, 3)
      .map(item => `<li>${item.question}</li>`)
      .join('');

    setTimeout(() => {
      this.answering = false;
      this.conversationLog.push({
        text: `<b>Hello and Welcome</b><br><br>Please ask me some questions,
              you can ask my name, what the time is, the date, or ask me to do some simple
              calculations.<br><br>Some examples<br><ul>${exampleQuestions}</ul>
              I also use fuzzy logic, so you can ask me questions in different ways,
              I can also attept to find the question if you ask me the answer`,
        type: 'bot',
        time: new Date().getTime().toString()
      });
    }, 2500);
  }

  ngAfterViewInit(): void {
    this.input?.nativeElement.focus();
  }

  scrollToBottom(): void {
    this.conversationContainer.nativeElement.scrollTop = this.conversationContainer?.nativeElement.scrollHeight;
  }
}
