import { Injectable } from '@angular/core';
import { Todo } from './todo.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TodoListService {
  constructor(private http: HttpClient) {
    this.fetchData();
    // this.addList('666');
  }

  baseURL: string = 'http://localhost:3000/';

  private list: Todo[] = [];
  private pageList = [];
  private page = 1;

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

  fetchData(): void {
    this.http
      .get(`http://localhost:3000/lists?_page=${this.page}&_limit=10`, {
        observe: 'response',
      })
      .subscribe((data) => {
        const body: any = data.body;
        const link = data.headers.get('Link');
        const linkObj = this.parseLinkHeader(link);
        this.pageList = this.generatePageArray(linkObj.first, linkObj.last);
        this.list = body.map((item) => new Todo(item.title, item.id));
      });
  }

  // 新增代辦事項
  add(title: string): void {
    // 避免傳入的 title 是無效值或空白字串，稍微判斷一下
    if (title) {
      // this.list.push(new Todo(title));
      const headers = { 'content-type': 'application/json' };
      this.http
        .post('http://localhost:3000/lists', { title }, { headers: headers })
        .subscribe((item: any) => {
          if (item.id) this.fetchData();
        });
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

  // 獲取分頁資訊
  getPageLIst() {
    return this.pageList;
  }

  // 更改目前分頁
  setPage(page) {
    this.page = page;
  }
}
