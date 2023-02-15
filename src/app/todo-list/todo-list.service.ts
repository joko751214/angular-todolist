import { Injectable } from '@angular/core';
import { Todo } from './todo.model';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TodoListService {
  constructor(private http: HttpClient) {
    this.fetchData();
    this.fetchAllData();
  }

  baseURL: string = 'http://localhost:3000/';

  private list: Todo[] = [];
  private allList: Todo[] = [];
  private pageList = [];
  private page = 1;

  private linkObj: any = {};

  // 解析 Header Link 資訊
  parseLinkHeader(linkHeader) {
    const linkHeadersArray = linkHeader
      .split(', ')
      .map((header) => header.split('; '));

    const linkHeadersMap = linkHeadersArray.map((header) => {
      // 分頁只有1頁時，json-server回傳的 Link 會是空白，導致下面的 replace 報錯
      if (header.length === 1) return null;
      const thisHeaderRel = header[1].replace(/"/g, '').replace('rel=', '');
      const thisHeaderUrl = Number(
        header[0].slice(1, -1).split('_page=')[1].split('&')[0]
      );
      return [thisHeaderRel, thisHeaderUrl];
    });
    if (linkHeadersMap.includes(null)) return { first: 1, last: 1 };
    else return Object.fromEntries(linkHeadersMap);
  }

  // 自動產生分頁的數量
  generatePageArray(first, last): number[] {
    const pageArr = [];
    for (var i = first; i < last + 1; i++) {
      pageArr.push(i);
    }
    return pageArr;
  }

  // 取得代辦事項清單
  fetchData(): void {
    this.http
      .get(`http://localhost:3000/lists?_page=${this.page}&_limit=10`, {
        observe: 'response',
      })
      .subscribe((data) => {
        const body: any = data.body;
        const link = data.headers.get('Link');
        this.linkObj = this.parseLinkHeader(link);
        if (data.status === 200) {
          // this.pageList = this.generatePageArray(
          //   this.linkObj.first,
          //   this.linkObj.last
          // );
          this.list = body.map((item) => new Todo(item.title, item.id));
        }
      });
  }

  // 取得所有代辦事項清單
  fetchAllData(): void {
    this.http
      .get(`http://localhost:3000/lists`, { observe: 'response' })
      .subscribe((data) => {
        if (data.status === 200) {
          const body: any = data.body;
          this.allList = body.map((item) => new Todo(item.title, item.id));
        }
      });
  }

  // 新增代辦事項
  add(title: string): void {
    if (title) {
      this.http
        .post('http://localhost:3000/lists', { title }, { observe: 'response' })
        .subscribe((res) => {
          if (res.status === 201) {
            // 排除全部清空時沒有 id 的問題
            const id: number =
              this.allList.length > 0
                ? this.allList[this.allList.length - 1].id + 1
                : 1;

            this.allList.push(new Todo(title, id));
          }
        });
    }
  }

  // 取得代辦事項清單
  getList(): Todo[] {
    return this.list;
  }

  // 取得代辦事項清單
  getAllList(): Todo[] {
    const firstNumber = 10 * (this.page - 1);
    const lastNumber = this.page * 10;
    return this.allList.slice(firstNumber, lastNumber);
  }

  // 刪除代辦事項
  removeTodo(id: number | string): void {
    this.http
      .delete(`http://localhost:3000/lists/${id}`, {
        observe: 'response',
      })
      .subscribe(async (res) => {
        if (res.status === 200) {
          const index = this.allList.findIndex((item) => item.id === id);
          this.allList.splice(index, 1);
          // 針對該頁列表完全清空後，就將頁面退到前一頁
          if (this.page > 1 && this.getAllList().length === 0) {
            this.setPage(this.page - 1);
          }
        }
      });
  }

  // 取得已完成 / 未完成的清單
  getWithCompleted(completed: boolean): Todo[] {
    return this.allList.filter((todo) => todo.done() === completed);
  }

  // 從清單中移除所有已完成之待辦事項
  async removeCompleted(): Promise<void> {
    const idsFetch = this.getWithCompleted(true).map((item) => {
      return this.http.delete(`http://localhost:3000/lists/${item.id}`, {
        observe: 'response',
      });
    });
    forkJoin(idsFetch).subscribe((response) => {
      const allDone = response.every((res) => res.status === 200);
      if (this.getWithCompleted(false).length === 0) this.setPage(1);
      if (allDone) this.fetchData();
    });
  }

  // 獲取分頁資訊
  getTotalPage() {
    const totalPage = Math.ceil(this.allList.length / 10);
    return this.generatePageArray(1, totalPage);
  }

  // 獲取目前分頁
  getPage() {
    return this.page;
  }

  // 更改目前分頁
  setPage(page) {
    this.page = page;
  }

  // 更新代辦事項標題
  updateTodo(id: number, title: string) {
    this.http
      .put(
        `http://localhost:3000/lists/${id}`,
        { title },
        { observe: 'response' }
      )
      .subscribe((res) => {
        if (res.status === 200) this.fetchData();
      });
  }

  // 添加畫面的 list 資料
  addList(title: string, id: number) {}
}
