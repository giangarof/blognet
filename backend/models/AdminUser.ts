import { User } from './User.js';

export class AdminUser extends User {
  constructor(
    firstname: string,
    lastname: string,
    username: string,
    email: string,
    password: string,
    id?: number
  ) {
    super(firstname, lastname, username, email, password, true, id); // is_admin = true
  }

  public getRole(): string {
    return "Super Admin";
  }

  public deleteUser(user: User): string {
    return `User ${user.getFullName()} deleted by ${this.getFullName()}`;
  }
}


