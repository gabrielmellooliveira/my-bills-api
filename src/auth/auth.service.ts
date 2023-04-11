import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { sign } from 'jsonwebtoken';
import { Model } from 'mongoose';
import { User } from 'src/users/models/users.model';
import { Request } from 'express';

@Injectable()
export class AuthService {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  public async createAccessToken(userId: string): Promise<string> {
    return sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION,
    });
  }

  public async validateUser(userId: string): Promise<User> {
    const user = await this.userModel.findOne({ _id: userId });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  public returnJwtExtractor(): (request: Request) => string {
    return this.jwtExtractor;
  }

  private jwtExtractor(request: Request): string {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new BadRequestException('Bad request');
    }

    const [, token] = authHeader.split(' ');

    return token;
  }
}
