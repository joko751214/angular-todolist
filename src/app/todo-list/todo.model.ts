export class Todo {
  title = '';
  completed = false;
  editStatus = false;

  constructor(title: string) {
    this.title = title || ''; // 為避免傳入的值為 Falsy 值，稍作處理
  }

  done(): boolean {
    return this.completed;
  }

  getTitle(): string {
    return this.title;
  }

  toggleCompletion(): void {
    this.completed = !this.completed;
  }

  editing(): boolean {
    return this.editStatus;
  }

  editable(val: boolean) {
    this.editStatus = val;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  setCompleted(completed: boolean): void {
    this.completed = completed;
  }
}
