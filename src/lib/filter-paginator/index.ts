import { FindManyOptions, FindOptionsWhere, Like, QueryBuilder, Repository } from 'typeorm'

interface IOptions {
  where?: object
  relations?: string[]
  itemsPerPage?: number
}

interface PaginatorResult {
  data: any[]
  total: number
  currentPage: number
  itemsPerPage: number
}

export class FilterPaginator<T> {
  private queryOptions: FindManyOptions = {
    order: { id: 'DESC' },
  }
  private repository: Repository<T>

  // Page props
  private page: number = 1
  private itemsPerPage: number = 10

  constructor(repository: Repository<T>, options?: IOptions) {
    this.repository = repository
    if (options.where) this.queryOptions.where = options.where
    if (options.relations) this.queryOptions.relations = options.relations
    if (options.itemsPerPage) this.itemsPerPage = options.itemsPerPage
  }

  filter(whereOptions: FindOptionsWhere<T>) {
    this.queryOptions.where = { ...whereOptions }

    return this
  }

  search(field: string, value: number | string): { paginate: Function; execute: Function } {
    if (field && value) {
      this.queryOptions.where = { ...this.queryOptions.where, [field]: Like(`${value}%`) }
    }

    return this
  }

  paginate(page: number): { execute: Function } {
    this.queryOptions.take = this.itemsPerPage
    this.queryOptions.skip = this.itemsPerPage * (page - 1)
    this.page = page

    return this
  }

  async execute(): Promise<PaginatorResult> {
    const [data, counter] = await this.repository.findAndCount(this.queryOptions)
    return {
      data,
      total: counter,
      currentPage: this.page,
      itemsPerPage: this.itemsPerPage,
    }
  }
}

export class BuilderPaginator<T> {
  private builder: QueryBuilder<T>

  constructor(name: string, repository: Repository<T>) {
    this.builder = repository.createQueryBuilder(name)
  }

  filter(whereOptions: Object) {}
}
