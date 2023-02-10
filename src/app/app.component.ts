import {AfterViewInit, Component, ElementRef, HostBinding, OnInit, ViewChild} from '@angular/core';
import * as math from 'mathjs';
import {ConversationModel} from "./models/conversation.model";
import FuzzySearch from "fuzzy-search";
import fuzzysort from 'fuzzysort'
import {questionsList} from "./questions/questions.mock";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'RoboBot';
  question = '';
  conversationLog: ConversationModel[] = [];
  @ViewChild('inputRef', {static: false}) input!: ElementRef;
  @ViewChild('conversationContainer', {static: false}) conversationContainer!: ElementRef;

  questionsList = questionsList;
  answering: boolean = false;

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
    }, 1500, this.question);

    this.question = '';
    this.input?.nativeElement.focus();
  }

  answerQuestion(question: any) {
    const time = new Date().getTime().toString();
    let answer: ConversationModel;

    const searcherAnswer = fuzzysort.go(question.replace(/['"]/g, ''), this.questionsList, {key: 'question'});

    if (searcherAnswer[0] !== undefined) {

      let text = searcherAnswer[0].obj.answer;
      text = text.replace('{{TIME}}', new Date().toLocaleTimeString());
      text = text.replace('{{DATE}}', new Date().toLocaleDateString());

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

  ngOnInit() {
    this.conversationLog.push({
      text: 'Hello and welcome<br><br>Please ask me some questions, you can ask my name, what the time is, the date, or ask me to do some simple calculations',
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
