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
  name = 'RoboBob';

  sendQuestion() {
    if (this.question === '') {
      return;
    }
    const time = new Date().getTime().toString();
    this.conversationLog.push({text: this.question, type: 'user', time, link: false});
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
    localStorage.setItem('conversationLog', JSON.stringify(this.conversationLog));
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

      let text = text1
      if (text2 && text1 !== text2 && searcherAnswer[1].score > -0.3) {
        text += `, or maybe ${text2} as well.`;
      }

      text = text.replace('{{TIME}}', new Date().toLocaleTimeString());
      text = text.replace('{{DATE}}', new Date().toLocaleDateString());

      answer = {text, type: 'bot', time, link: false};
    } else if (searcherQuestion[0] !== undefined && searcherQuestion[0].score > -0.3) {
      const [q, a] = [searcherQuestion[0].obj.question, searcherQuestion[0].obj.answer];
      const text = `I have found this question which might serve as an answer. ${q} The answer being, ${a}.`;

      answer = {
        text,
        type: 'bot',
        time,
        link: true,
        question: q
      };
    } else {
      const calculation = question.replace(/[^0-9\+\-\*\/\.]/g, '');
      const calcResult = math.evaluate(calculation);
      if (calcResult === undefined) {
        answer = {
          text: 'Could you please rephrase your question',
          type: 'bot',
          time,
          link: false
        };
      } else {
        answer = {
          text: `I have calculated that to be ${calcResult}`,
          type: 'bot',
          time,
          link: false
        };
      }
    }

    this.conversationLog.push(answer);
    localStorage.setItem('conversationLog', JSON.stringify(this.conversationLog));
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
    this.conversationLog = JSON.parse(localStorage.getItem('conversationLog') || '[]');
    if (this.conversationLog.length === 0) {
      this.bootstrapConversation();
    }
  }

  bootstrapConversation() {
    this.answering = true;
    setTimeout(() => {
      const exampleQuestions = this.shuffleArray().slice(0, 3)
        .map(item => `<li>${item.question}</li>`)
        .join('');
      this.answering = false;
      this.conversationLog.push({
        text: `<b>Hello and Welcome</b><br><br>Please ask me some questions,
              you can ask my name, what the time is, the date, or ask me to do some simple
              calculations.<br><br>Some examples<br><ul>${exampleQuestions}</ul>
              I also use fuzzy logic, so you can ask me questions in different ways,
              I can also attept to find the question if you ask me the answer.`,
        type: 'bot',
        time: new Date().getTime().toString(),
        link: false
      });
    }, 2500);
  }

  ngAfterViewInit(): void {
    this.input?.nativeElement.focus();
    this.scrollToBottom()
  }

  scrollToBottom(): void {
    this.conversationContainer.nativeElement.scrollTop = this.conversationContainer?.nativeElement.scrollHeight;
  }

  resetConversation() {
    localStorage.removeItem('conversationLog');
    this.conversationLog = [];
    this.bootstrapConversation();
  }

  externalQuery(text: string | null | undefined) {
    if(text === null || text === undefined) {
      return;
    }
    this.question = text;
    this.sendQuestion();
  }
}
