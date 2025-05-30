import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService, ConfigType } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import * as argon2 from 'argon2'

import { UsersService } from 'src/users/services/users.service'
import { AuthJwtPayload } from '../types/token.model'
import refreshJwtConfig from '../config/refresh-jwt.config'
import { CookieOptions } from 'express'

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private userService: UsersService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshJwtConfiguration: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username)
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const isMatch = await bcrypt.compare(password, user.password)
    if (user && isMatch)
      return { sub: user.id, username: user.username, role: user.roleId } as AuthJwtPayload

    return null
  }

  async login(payload: AuthJwtPayload) {
    const { accessToken, refreshToken } = await this.generateTokens(payload)
    const hashedRefreshToken = await argon2.hash(refreshToken)
    await this.userService.updateRefreshToken(payload.sub, hashedRefreshToken)
    return {
      id: payload.sub,
      accessToken,
      refreshToken,
    }
  }

  async generateTokens(payload: AuthJwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, this.refreshJwtConfiguration),
    ])
    return {
      accessToken,
      refreshToken,
    }
  }

  async validateJwtUser(userId: number) {
    const user = await this.userService.findOne(userId)
    if (!user) throw new UnauthorizedException('Not allow')
    const payload: AuthJwtPayload = { sub: user.id, username: user.username, role: user.roleId }
    return payload
  }

  getUser(userId: number) {
    return this.userService.findOne(userId)
  }

  async refreshToken(payload: AuthJwtPayload) {
    const { accessToken, refreshToken } = await this.generateTokens(payload)
    const hashedRefreshToken = await argon2.hash(refreshToken)
    await this.userService.updateRefreshToken(payload.sub, hashedRefreshToken)
    return {
      id: payload.sub,
      accessToken,
      refreshToken,
    }
  }

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId)
    if (!user || !user.refreshToken) throw new UnauthorizedException('Invalid refresh token')

    const isMatch = await argon2.verify(user.refreshToken, refreshToken)
    if (!isMatch) throw new UnauthorizedException('Invalid refresh token')
    const payload: AuthJwtPayload = { sub: user.id, username: user.username, role: user.roleId }
    return payload
  }

  logout(userId: number) {
    return this.userService.updateRefreshToken(userId, null)
  }

  cookieSetup(): CookieOptions {
    const isProductionMode = this.configService.get('NODE_ENV') === 'production'
    return {
      httpOnly: true,
      secure: isProductionMode ? true : false,
      domain: this.configService.get('CONSUMER_HOST'),
      sameSite: isProductionMode ? 'lax' : 'strict',
    }
  }
}
