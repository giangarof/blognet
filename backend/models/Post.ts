// models/Post.ts
export class Post {
  private _id: number;
  private _title: string;
  private _content: string;
  private _createdBy: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  constructor(id: number, title: string, content: string, createdBy: number, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._title = title;
    this._content = content;
    this._createdBy = createdBy;
    this._createdAt = createdAt || new Date();
    this._updatedAt = updatedAt || new Date();
  }

  // Encapsulation: getters and setters
  get id() { return this._id; }
  get title() { return this._title; }
  get content() { return this._content; }
  get createdBy() { return this._createdBy; }
  get createdAt() { return this._createdAt; }
  get updatedAt() { return this._updatedAt; }

  set title(newTitle: string) { this._title = newTitle; this._updatedAt = new Date(); }
  set content(newContent: string) { this._content = newContent; this._updatedAt = new Date(); }

  public getSummary(): string {
    return `${this._title} by user ${this._createdBy} on ${this._createdAt.toLocaleString()}`;
  }
}

