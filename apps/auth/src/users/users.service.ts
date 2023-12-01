import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';

import {
  CreateUserDto,
  PaginationDto,
  UpdateUserDto,
  User,
  Users,
} from '@app/common';
import { randomUUID } from 'crypto';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly users: User[] = [];

  onModuleInit() {
    for (let index = 0; index < 100; index++) {
      this.create({
        username: randomUUID(),
        password: randomUUID(),
        age: Math.ceil(Math.random() * 100),
      });
    }
  }
  create(createUserDto: CreateUserDto): User {
    const user: User = {
      ...createUserDto,
      subscribed: false,
      socialMedia: {},
      id: randomUUID(),
    };
    this.users.push(user);
    return user;
  }

  findAll(): Users {
    return { users: this.users };
  }

  findOne(id: string): User {
    return this.users.find((usr) => usr.id === id);
  }

  update(id: string, updateUserDto: UpdateUserDto): User {
    const userIndex = this.users.findIndex((usr) => usr.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = {
        ...this.users[userIndex],
        ...updateUserDto,
      };
      return this.users[userIndex];
    } else throw new NotFoundException('User not found');
  }

  remove(id: string) {
    const userIndex = this.users.findIndex((usr) => usr.id === id);
    if (userIndex !== -1) {
      return this.users.splice(userIndex, 1)[0];
    } else throw new NotFoundException('User not found');
  }

  queryUsers(
    paginationDtoStream: Observable<PaginationDto>,
  ): Observable<Users> {
    const subject = new Subject<Users>();
    const onNext = (paginationDto: PaginationDto) => {
      const start = paginationDto.page * paginationDto.skip;
      subject.next({
        users: this.users.slice(start, start + paginationDto.skip),
      });
    };
    function onComplete() {
      return subject.complete();
    }
    paginationDtoStream.subscribe({
      next: onNext,
      complete: onComplete,
    });
    return subject.asObservable();
  }
}
