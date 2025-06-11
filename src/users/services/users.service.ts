import { Injectable, NotFoundException } from '@nestjs/common'
import { FindOneOptions, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'

import { CreateUserDto } from '../dtos/create-user.dto'
import { UpdateUserDto } from '../dtos/update-user.dto'
import { User } from '../entities/user.entity'
import { EmployeesService } from '../../employees/services/employees.service'
import { RolesService } from '../../roles/services/roles.service'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
    private employeesService: EmployeesService,
    private roleService: RolesService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = this.repository.create(createUserDto)
    const hashPassword = await bcrypt.hash(newUser.password, 10)
    newUser.password = hashPassword
    const employee = await this.employeesService.findOne(createUserDto.employeeId)
    const role = await this.roleService.findOne(createUserDto.roleId)
    newUser.employee = employee
    newUser.role = role

    return this.repository.save(newUser)
  }

  findAll(findOptions?: FindOneOptions<User>) {
    return this.repository.find(findOptions || {})
  }

  async findOne(id: number, relations: string[] = []) {
    const user = await this.repository.findOne({ where: { id }, relations })
    if (!user) throw new NotFoundException(`User ${id} not found`)
    return user
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return this.repository.update(id, updateUserDto)
  }

  remove(id: number) {
    return `This action removes a #${id} user`
  }

  async findByUsername(username: string, relations: string[] = []) {
    const user = await this.repository.findOne({ where: { username }, relations })
    return user
  }

  async findUserByChatId(chatId: number) {
    const user = await this.repository.findOne({ where: { chatId } })
    return user
  }

  updateRefreshToken(id: number, hashedRefreshToken: string) {
    return this.repository.update(id, { refreshToken: hashedRefreshToken })
  }
}
