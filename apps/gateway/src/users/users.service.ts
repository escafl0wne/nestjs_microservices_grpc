import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  AUTH,
  CreateUserDto,
  PaginationDto,
  USERS_SERVICE_NAME,
  UpdateUserDto,
  UsersServiceClient,
} from '@app/common';
import { ClientGrpc } from '@nestjs/microservices';
import { ReplaySubject } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private usersService: UsersServiceClient;

  constructor(@Inject(AUTH) private client: ClientGrpc) {}
  onModuleInit() {
    this.usersService =
      this.client.getService<UsersServiceClient>(USERS_SERVICE_NAME);
  }
  create(createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  findAll() {
    return this.usersService.findAllUsers({});
  }

  findOne(id: string) {
    return this.usersService.findOneUser({ id });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser({ id, ...updateUserDto });
  }

  remove(id: string) {
    return this.usersService.removeUser({ id });
  }

  emailUsers() {
    const users$ = new ReplaySubject<PaginationDto>();
    users$.next({ page: 0, skip: 25 });
    users$.next({ page: 1, skip: 25 });
    users$.next({ page: 2, skip: 25 });
    users$.next({ page: 3, skip: 25 });

    let chunkNumber = 1;
    users$.complete();
    this.usersService.queryUsers(users$).subscribe((users) => {
      console.log('Chunck', chunkNumber);
      chunkNumber++;
    });
  }
}
