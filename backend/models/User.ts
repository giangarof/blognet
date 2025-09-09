export class User {
  private password: string;
  public is_admin: boolean;
  public id?: number | undefined;

  constructor(
    public firstname: string,
    public lastname: string,
    public username: string,
    public email: string,
    password: string,
    is_admin = false,
    id?: number
  ) {
    this.password = password;
    this.is_admin = is_admin;
    this.id = id;
  }

  public getPassword(): string {
    return this.password;
  }

  public setPassword(newPassword: string) {
    this.password = newPassword;
  }

  public getFullName(): string {
    return `${this.firstname} ${this.lastname}`;
  }

  public getRole(): string {
    return this.is_admin ? "Admin" : "User";
  }
}

