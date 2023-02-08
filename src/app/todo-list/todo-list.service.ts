import { Injectable } from '@angular/core';
import { Todo } from './todo.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class TodoListService {
  constructor(private http: HttpClient) {
    this.http.get('http://localhost:3000/lists').subscribe((res: Todo[]) => {
      // console.log(new Todo(res));
    });
  }

  private list: Todo[] = [];

  // 新增代辦事項
  add(title: string): void {
    // 避免傳入的 title 是無效值或空白字串，稍微判斷一下
    if (title) {
      this.list.push(new Todo(title));
    }
  }

  // 取得代辦事項清單
  getList(): Todo[] {
    return this.list;
  }

  // 刪除代辦事項
  remove(index: number) {
    this.list.splice(index, 1);
  }

  // 取得已完成 / 未完成的清單
  getWithCompleted(completed: boolean): Todo[] {
    return this.list.filter((todo) => todo.done() === completed);
  }

  // 從清單中移除所有已完成之待辦事項
  removeCompleted(): void {
    this.list = this.getWithCompleted(false);
  }
}
