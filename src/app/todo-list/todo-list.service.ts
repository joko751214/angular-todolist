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
  }

  baseURL: string = 'http://localhost:3000/';

  private list: Todo[] = [];
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
          this.pageList = this.generatePageArray(
            this.linkObj.first,
            this.linkObj.last
          );
          this.list = body.map((item) => new Todo(item.title, item.id));
        }
      });
  }

  // 新增代辦事項
  add(title: string): void {
    // 避免傳入的 title 是無效值或空白字串，稍微判斷一下
    if (title) {
      this.http
        .post(
          'http://localhost:3000/lists',
          { title },
          {
            observe: 'response',
          }
        )
        .subscribe((res) => {
          if (res.status === 201) this.fetchData();
        });
    }
  }

  // 取得代辦事項清單
  getList(): Todo[] {
    return this.list;
  }

  // 刪除代辦事項
  removeTodo(id: number | string) {
    this.http
      .delete(`http://localhost:3000/lists/${id}`, {
        observe: 'response',
      })
      .subscribe(async (res) => {
        if (res.status === 200) {
          await this.fetchData();
          this.checkPageStatus();
        }
      });
  }

  // 取得已完成 / 未完成的清單
  getWithCompleted(completed: boolean): Todo[] {
    return this.list.filter((todo) => todo.done() === completed);
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
      if (allDone) this.fetchData();
    });
  }

  // 獲取分頁資訊
  getPageLIst() {
    return this.pageList;
  }

  // 更改目前分頁
  setPage(page) {
    this.page = page;
  }

  // 檢查刪除後獲得的分頁列表有沒有改變
  checkPageStatus() {
    console.log(this.page, 'page');
    console.log(this.linkObj, 'linkObj');
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
}
