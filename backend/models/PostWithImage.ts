// models/PostWithImage.ts
import { Post } from "./Post.js";

export class PostWithImage extends Post {
  private _image: string;

  constructor(id: number, title: string, content: string, createdBy: number, image: string) {
    super(id, title, content, createdBy);
    this._image = image;
  }

  get image() { return this._image; }
  set image(newImage: string) { this._image = newImage; }

  // Polymorphism: override getSummary to include image info
  public getSummary(): string {
    return `${this.title} by user ${this.createdBy} with image ${this._image}`;
  }
}
