import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TodoListService } from './todo-list.service';
import { Todo } from './todo.model';
import { TodoStatusType } from './todo-status-type.enum';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
})
export class TodoListComponent implements OnInit {
  @ViewChild('editedtodo', { static: false })
  set editedtodo(element: ElementRef<HTMLInputElement>) {
    if (element) {
      element.nativeElement.focus();
    }
  }
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
        return this.todoListService.getAllList();
    }
  }

  // 獲取所有代辦事項清單
  getAllList(): Todo[] {
    return this.todoListService.getAllList();
  }

  // 刪除代辦事項
  removeTodo(id: number) {
    this.todoListService.removeTodo(id);
  }

  // 編輯代辦事項
  editTodo(todo: Todo) {
    todo.editable(true);
  }

  // 更新代辦事項標題
  updateTodo(todo: Todo, newTitle: string): void {
    if (!todo.editing()) {
      return;
    }

    const title = newTitle.trim();

    if (title) {
      this.todoListService.updateTodo(todo.id, title);
    } else {
      const index = this.getList().indexOf(todo);
      if (index !== -1) {
        this.removeTodo(todo.id);
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
  getTotalPage() {
    return this.todoListService.getTotalPage();
  }

  // 設定分頁狀態
  async setPageStatus(value) {
    if (value === this.page) {
      return;
    }
    this.todoListService.setPage(value);
    this.page = this.todoListService.getPage();
    // 分頁切換時，要將原先紀錄的勾選狀態清空
    this.todoListService.getAllList('clean');
  }

  // 檢查分頁 active 狀態
  cheeckPageStatus(page) {
    return this.todoListService.getPage() === page;
  }
}
