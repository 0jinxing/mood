export class CodeDTO {
  email: string;
}

export class RegisterDTO {
  email: string;
  password: string;

  username: string;

  code: string;
}

export class LoginDTO {
  email: string;
  password: string;
}
