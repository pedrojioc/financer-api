import { Injectable, NotFoundException } from '@nestjs/common'
import { Like, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

import { CreateCustomerDto } from '../dtos/create-customer.dto'
import { UpdateCustomerDto } from '../dtos/update-customer.dto'
import { Customer } from '../entities/customer.entity'
import { FinancialActivityService } from './financial-activity.service'
import { FilterPaginatorDto } from 'src/lib/filter-paginator/dtos/filter-paginator.dto'
import { FilterPaginator } from 'src/lib/filter-paginator'
import { Gender } from 'src/genders/entities/gender.entity'

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer) private repository: Repository<Customer>,
    private activityService: FinancialActivityService,
  ) {}

  async create(userPayload: CreateCustomerDto) {
    const newCustomer = this.repository.create(userPayload)
    const activity = await this.activityService.findOne(userPayload.financialActivityId)
    newCustomer.financialActivity = activity
    newCustomer.gender = { id: userPayload.genderId } as Gender
    return this.repository.save(newCustomer)
  }

  findAll(params: FilterPaginatorDto) {
    const paginator = new FilterPaginator(this.repository, {
      itemsPerPage: 10,
      relations: ['financialActivity'],
    })
    const result = paginator
      .search(params.searchBy, params.searchValue)
      .paginate(params.page)
      .execute()
    return result
  }

  async findOne(id: number) {
    const customer = await this.repository.findOneBy({ id })
    if (!customer) throw new NotFoundException(`User ID ${id} not found`)
    return customer
  }

  async findByIdName(terms: string) {
    if (!terms) return this.repository.find({ take: 10 })

    const customers = await this.repository.find({
      where: { idNumber: Like(`${terms}%`) },
      take: 10,
    })
    return customers
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return this.repository.update(id, updateCustomerDto)
  }

  remove(id: number) {
    return `This action removes a #${id} customer`
  }
}
