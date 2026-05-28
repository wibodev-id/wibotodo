import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const DEMO_EMAIL = 'demo@wibotodo.app';
const DEMO_PASSWORD = 'demo12345';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  private readonly googleClientId: string | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {
    this.googleClientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    this.googleClient = new OAuth2Client(this.googleClientId);
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        name: dto.name ?? null,
      },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    return { user, token: this.signToken(user.id, user.email) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token: this.signToken(user.id, user.email),
    };
  }

  async demo() {
    return this.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
  }

  async googleLogin(dto: GoogleLoginDto) {
    if (!this.googleClientId) {
      throw new InternalServerErrorException('Google login is not configured');
    }

    let payload;
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: dto.credential,
        audience: this.googleClientId,
      });
      payload = ticket.getPayload();
    } catch {
      throw new UnauthorizedException('Invalid Google credential');
    }

    if (!payload || !payload.sub || !payload.email || !payload.email_verified) {
      throw new UnauthorizedException('Invalid Google credential');
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name ?? null;
    const avatarUrl = payload.picture ?? null;

    let user = await this.prisma.user.findUnique({ where: { googleId } });

    if (!user) {
      const byEmail = await this.prisma.user.findUnique({ where: { email } });
      if (byEmail) {
        user = await this.prisma.user.update({
          where: { id: byEmail.id },
          data: {
            googleId,
            avatarUrl: byEmail.avatarUrl ?? avatarUrl,
            name: byEmail.name ?? name,
          },
        });
      } else {
        user = await this.prisma.user.create({
          data: { email, googleId, name, avatarUrl },
        });
      }
    }

    return {
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
      token: this.signToken(user.id, user.email),
    };
  }

  private signToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwt.sign(payload);
  }
}
