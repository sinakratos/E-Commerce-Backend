import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  async sendVerificationEmail(email: string, token: string) {
    const filePath = path.join(
      process.cwd(),
      'src',
      'mail',
      'templates',
      'verify-email.html',
    );

    let html = fs.readFileSync(filePath, 'utf8');

    const verifyUrl = `${process.env.SERVER_URL}/auth/verify-email?token=${token}`;
    const name = email.split('@')[0];

    html = html
      .replace('{{verifyUrl}}', verifyUrl)
      .replace('{{name}}', name)
      .replace('{{Token}}', token);

    return this.transporter.sendMail({
      to: email,
      subject: 'Verify your account',
      html,
    });
  }
}
