import { Component, OnInit } from '@angular/core';
import { TodoListService } from './todo-list.service';
import { Todo } from './todo.model';
import { TodoStatusType } from './todo-status-type.enum';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
})
export class TodoListComponent implements OnInit {
  constructor(private todoListService: TodoListService) {}

  ngOnInit(): void {}

  todoStatusType = TodoStatusType;
  status = TodoStatusType.All;
  page = 1;

  // 新增代辦事項
  addTodo(inputRef: HTMLInputElement): void {
    const todo = inputRef.value.trim();

    if (todo) {
      this.todoListService.add(todo);
      inputRef.value = '';
    }
  }

  // 獲取代辦事項清單 - 針對下方按鈕處設計的函式
  getList(): Todo[] {
    switch (this.status) {
      case TodoStatusType.Active:
        return this.getRemainingList();
      case TodoStatusType.Completed:
        return this.getCompletedList();
      default:
        return this.todoListService.getList();
    }
  }

  // 獲取所有代辦事項清單
  getAllList(): Todo[] {
    return this.todoListService.getList();
  }

  // 刪除代辦事項
  remove(id: number) {
    this.todoListService.remove(id);
  }

  // 編輯代辦事項
  edit(todo: Todo) {
    todo.editable(true);
  }

  // 更新代辦事項標題
  update(todo: Todo, newTitle: string): void {
    if (!todo.editing) {
      return;
    }

    const title = newTitle.trim();

    if (title) {
      todo.setTitle(title);
      todo.editable(false);
    } else {
      const index = this.getList().indexOf(todo);
      if (index !== -1) {
        this.remove(index);
      }
    }
  }

  // 取消編輯
  cancelEdit(todo: Todo) {
    todo.editable(false);
  }

  // 取得未完成的清單
  getRemainingList(): Todo[] {
    return this.todoListService.getWithCompleted(false);
  }

  // 取得已完成的待辦事項
  getCompletedList(): Todo[] {
    return this.todoListService.getWithCompleted(true);
  }

  // 設定狀態
  setStatus(status: number): void {
    this.status = status;
  }

  // 檢查 active 狀態
  checkStatus(status: number): boolean {
    return this.status === status;
  }

  // 從清單中移除所有已完成之待辦事項
  removeCompleted(): void {
    this.todoListService.removeCompleted();
  }

  // 將所有清單狀態更改為完成狀態
  setAllCompleted(completed: boolean): void {
    this.getAllList().forEach((todo) => todo.setCompleted(completed));
  }

  // 所有的代辦事項是否都已完成
  allCompleted() {
    return this.getAllList().length === this.getCompletedList().length;
  }

  // 獲取分頁資訊
  getPageLIst() {
    return this.todoListService.getPageLIst();
  }

  // 設定分頁狀態
  async setPageStatus(value) {
    this.page = value;
    this.todoListService.setPage(value);
    this.todoListService.fetchData();
  }
  // 檢查分頁 active 狀態
  cheeckPageStatus(page) {
    return this.page === page;
  }
}
