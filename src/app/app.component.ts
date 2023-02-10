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
    let question = {text: this.question, type: 'user', time};
    this.conversationLog.push(question);
    this.answering = true;

    setTimeout(() => {
      this.scrollToBottom();
    }, 100);

    setTimeout((question: any) => {
      this.answering = false;
      this.answerQuestion(question);
    }, 1200, this.question);

    this.question = '';
    this.input?.nativeElement.focus();
  }

  answerQuestion(question: any) {
    const time = new Date().getTime().toString();
    let answer: ConversationModel;

    const searcherAnswer = fuzzysort.go(question.replace(/['"]/g, ''), this.questionsList, {key: 'question'});
    const searcherQuestion = fuzzysort.go(question.replace(/['"]/g, ''), this.questionsList, {key: 'answer'});

    if (searcherAnswer[0] !== undefined) {
      let text = searcherAnswer[0].obj.answer;
      if (searcherAnswer[1] !== undefined) {
        if(
          (searcherAnswer[0].obj.answer !== searcherAnswer[1].obj.answer) &&
          searcherAnswer[1].score > -0.8
        ) {
          text += ', or it may be ' +
            searcherAnswer[1].obj.answer + searcherAnswer[1].score;
        }
      }
      text = text.replace('{{TIME}}', new Date().toLocaleTimeString());
      text = text.replace('{{DATE}}', new Date().toLocaleDateString());

      answer = {text, type: 'bot', time};
    } else if (searcherQuestion[0] !== undefined) {
      let text = 'I have found this question which might serve as an answer. ' +
        searcherQuestion[0].obj.question +
        ' The answer being ' +
        searcherQuestion[0].obj.answer +
        '.';

      answer = {text, type: 'bot', time};
    } else {
      const calculation = question.replace(/[^0-9\+\-\*\/\.]/g, '');
      if (math.evaluate(calculation) === undefined) {
        answer = {text: 'Could you please rephrase your question', type: 'bot', time};
      } else {
        answer = {text: `I have calculated that to be ${math.evaluate(calculation)}`, type: 'bot', time};
      }
    }

    this.conversationLog.push(answer);
    setTimeout(() => {
      this.scrollToBottom();
    }, 100);
  }

  shuffleArray() {
    const array = this.questionsList
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  ngOnInit() {
    let exampleQuestions = []
    for(let item of this.shuffleArray().slice(0, 3)) {
      exampleQuestions.push(`<li>${item.question}</li>`);
    }

    this.conversationLog.push({
      text: 'Hello and welcome<br><br>Please ask me some questions' +
        ', you can ask my name, what the time is, the date, or ask ' +
        'me to do some simple calculations<br><br>Some examples<br>' +
        '<ul>' + exampleQuestions.join('')+ '</ul>I also use fuzzy ' +
        'logic, so you can ask me questions in different ways, I can' +
        ' also attept to for the question if you ask me the answer',
      type: 'bot',
      time: new Date().getTime().toString()
    });
  }

  ngAfterViewInit(): void {
    this.input?.nativeElement.focus();
  }

  scrollToBottom(): void {
    this.conversationContainer.nativeElement.scrollTop = this.conversationContainer?.nativeElement.scrollHeight;
  }
}
