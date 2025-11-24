export class RegisterDto {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: 'customer' | 'admin' | 'salesman';
}
