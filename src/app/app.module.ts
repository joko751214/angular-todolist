import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TodoListComponent } from './todo-list/todo-list.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent, TodoListComponent],
  imports: [BrowserModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
