export class Todo {
  id = null;
  title = '';
  completed = false;
  editStatus = false;

  constructor(title: string, id: number) {
    this.title = title || '';
    this.id = id;
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

  setCompleted(completed: boolean): void {
    this.completed = completed;
  }
}
