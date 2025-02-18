# RTSC (Relational TypeScript Classes)
[![npm version](https://badge.fury.io/js/@nightmaregaurav%2Frtsc.svg)](https://badge.fury.io/js/@nightmaregaurav%2Frtsc)
[![HitCount](https://hits.dwyl.com/nightmaregaurav/rtsc.svg?style=flat)](http://hits.dwyl.com/nightmaregaurav/rtsc)<br>
[![NPM](https://nodei.co/npm/@nightmaregaurav/rtsc.png?mini=true)](https://nodei.co/npm/@nightmaregaurav/rtsc/)
***

## Description
RTSC is a library that allows you to define classes that can be stored and retrieved from data storage in a relational way. It is designed to mimic the behavior of a relational database ORM, but it is not an ORM. Neither is it supposed to be used with a remote database. It can be helpful for handling data in local storage, like LocalStorage, IndexedDB, sql.js, SessionStorage, etc.

## Installation
```bash
npm install @nightmaregaurav/rtsc
````

### Declaring DataDriver
```typescript
// DataDriverSetup.ts (Somewhere in your entry point you must import this file/or place the register calls in a method and call it.)
import {DataDriver, DefaultDataDriver} from "@nightmaregaurav/rtsc";

DataDriver.configure(new DefaultDataDriver());
```

### Defining Entity Classes
```typescript
// Person.ts
import {Address} from "./Address";

export class Person {
    id: string;
    name: string;
    age: number;
    address: Address[]; // Relational property (List) does not need to be optional
}
```
```typescript
// Address.ts
import {Person} from "./Person";

export class Address {
    id: string;
    street: string;
    city: string;
    personId: string;
    person?: Person; // Optional: relational property is always optional just in case it is not included
}
```

### Defining Entity Class Specifications
```typescript
// PersonSpecification.ts
import {RelationalClassSpecificationBuilder} from "@nightmaregaurav/rtsc";
import {Person} from "./Person";
import {Address} from "./Address";

export const PersonSpecification = new RelationalClassSpecificationBuilder<Person>(Person)
    .useTableName("person") // Optional: By default it uses class name
    .withIdentifier("id")
    .hasMany("address", Address, "personId")
    .build();
```
```typescript
// AddressSpecification.ts
import {RelationalClassSpecificationBuilder} from "@nightmaregaurav/rtsc";
import {Person} from "./Person";
import {Address} from "./Address";

export const AddressSpecification = new RelationalClassSpecificationBuilder<Address>(Address)
    .useTableName("address") // Optional: By default it uses class name
    .withIdentifier("id")
    .hasOne("person", Person, "personId")
    .build();
```

### Registering Entity Class Specifications
```typescript
// DataRegistry.ts (Somewhere in your entry point you must import this file/or place the register calls in a method and call it.)
import {RelationalClassSpecificationRegistry} from "@nightmaregaurav/rtsc";
import {PersonSpecification} from "./PersonSpecification";
import {AddressSpecification} from "./AddressSpecification";

RelationalClassSpecificationRegistry.register(AddressSpecification);
RelationalClassSpecificationRegistry.register(PersonSpecification);
```

### Setup Repositories
```typescript
// Repositories.ts
import {RelationalRepository} from "@nightmaregaurav/rtsc";

export const PersonRepository = new RelationalRepository(Person);
export const AddressRepository = new RelationalRepository(Address);
```

### Usage in Code
```typescript
const person = new Person();
person.id = "1";
person.name = "John";
person.age = 30;

const address1 = new Address();
address1.id = "1";
address1.street = "123 Main St";
address1.city = "Springfield";
address1.personId = "1";

const address2 = new Address();
address2.id = "2";
address2.street = "456 Elm St";
address2.city = "Springfield";
address2.personId = "1";

(async () => {
    await PersonRepository.create(person);
    await AddressRepository.create(address1);
    await AddressRepository.create(address2);

    const people = await PersonRepository
        .getQueryable()
        .include("address")
        .thenInclude("person")
        .getAll();

   console.log(people);
})();

// Output:
// [Person {
//     id: '1',
//     name: 'John',
//     age: 30,
//     address: [
//         Address {
//             id: '1',
//             street: '123 Main St',
//             city: 'Springfield',
//             personId: '1',
//             person: {
//                 id: '1',
//                 name: 'John',
//                 age: 30,
//             }
//         },
//         Address {
//             id: '2',
//             street: '456 Elm St',
//             city: 'Springfield',
//             personId: '1',
//             person: {
//                 id: '1',
//                 name: 'John',
//                 age: 30,
//             }
//         }
//     ]
// }]
```

### Backup and Restore (Clearing the storage is not handled, so you need to handle it yourself)
```typescript
// Backup.ts
import {DataDriver} from "@nightmaregaurav/rtsc";

const dump = await DataDriver.instance.dumpAll();
// do whatever you want with dump
```
```typescript
// Restore.ts
import {DataDriver} from "@nightmaregaurav/rtsc";

// get dump from somewhere
await DataDriver.instance.loadAll(dump);
```

## How to Contribute
* Fork the repository
* Clone the forked repository
* Make changes
* Commit and push the changes
* Create a pull request
* Wait for the pull request to be merged
* Celebrate
* Repeat

*If you are new to open source, you can read [this](https://opensource.guide/how-to-contribute/) to learn how to contribute to open source projects.*<br>
*If you are new to GitHub, you can read [this](https://guides.github.com/activities/hello-world/) to learn how to use GitHub.*<br>
*If you are new to Git, you can read [this](https://www.atlassian.com/git/tutorials/learn-git-with-bitbucket-cloud) to learn how to use Git.*<br>
*If you are new to TypeScript, you can read [this](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html) to learn how to use TypeScript.*<br>


## License
RTSC is released under the MIT License. You can find the full license details in the [LICENSE](LICENSE) file.

Made with ❤️ by [NightmareGaurav](https://github.com/nightmaregaurav).

---
Open For Contribution
---
