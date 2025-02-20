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
  address: Address[]; // Never define a related property (List) as nullable or optional
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
  person: Person;  // Never define a related property(Non-List) as nullable or optional; Instead, make the relatedId nullable or optional
}
```

### Defining Entity Class Specifications
```typescript
// PersonSpecification.ts
import {ClassSpecificationBuilder} from "@nightmaregaurav/rtsc";
import {Person} from "./Person";
import {Address} from "./Address";

export const PersonSpecification = new ClassSpecificationBuilder<Person>(Person)
  .useTableName("person") // Optional: By default it uses class name
  .withIdentifier("id")
  .hasMany("address", Address, "personId")
  .build();
```
```typescript
// AddressSpecification.ts
import {ClassSpecificationBuilder} from "@nightmaregaurav/rtsc";
import {Person} from "./Person";
import {Address} from "./Address";

export const AddressSpecification = new ClassSpecificationBuilder<Address>(Address)
  .useTableName("address") // Optional: By default it uses class name
  .withIdentifier("id")
  .hasOne("person", Person, "personId")
  .build();
```

### Registering Entity Class Specifications
```typescript
// DataRegistry.ts (Somewhere in your entry point you must import this file/or place the register calls in a method and call it.)
import {ClassSpecificationRegistry} from "@nightmaregaurav/rtsc";
import {PersonSpecification} from "./PersonSpecification";
import {AddressSpecification} from "./AddressSpecification";

ClassSpecificationRegistry.register(AddressSpecification);
ClassSpecificationRegistry.register(PersonSpecification);
```

### Setup Repositories
```typescript
// Repositories.ts
import {Repository} from "@nightmaregaurav/rtsc";
import {Person} from "./Person";
import {Address} from "./Address";

export const PersonRepository = new Repository(Person);
export const AddressRepository = new Repository(Address);
```

### Usage in Code
```typescript
const person1 = new Person();
person1.id = "1";
person1.name = "John";
person1.age = 30;

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

const address3 = new Address();
address3.id = "3";
address3.street = "789 Oak St";
address3.city = "Springfield";
address3.person = person1;

const address4 = new Address();
address4.id = "4";
address4.street = "101 Maple St";
address4.city = "Springfield";

const address5 = new Address();
address5.id = "5";
address5.street = "112 Pine St";
address5.city = "Springfield";

const person2 = new Person();
person2.id = "2";
person2.name = "Jane"
person2.age = 25;
person2.address = [address4, address5];

(async () => {
  await PersonRepository.create(person1);  // adds person1; address1, address2, address3 will not be added as they are not attached to person1
  await AddressRepository.create(address1);  // adds address1; will attach to person1 inferred from personId
  await AddressRepository.create(address2);  // adds address2; will attach to person1 inferred from personId
  await AddressRepository.create(address3);  // adds address3; will attach to person1 explicitly; will attempt to update person1
  await PersonRepository.create(person2);  // adds person2; address4, address5 will also be added as they are attached to person2

  const people = await PersonRepository
    .getQueryable()
    .include("address")
    .thenInclude("person")
    .getAll();

  console.log(people);

  const backup = await DataDriver.instance.dumpAll();
  console.log(backup);
  await DataDriver.instance.loadAll(backup);
})();
```

### Output of above example will look like this
```json
[
    {
        "id": "1",
        "name": "John",
        "age": 30,
        "address": [
            {
                "id": "1",
                "street": "123 Main St",
                "city": "Springfield",
                "personId": "1",
                "person": {
                    "id": "1",
                    "name": "John",
                    "age": 30
                }
            },
            {
                "id": "2",
                "street": "456 Elm St",
                "city": "Springfield",
                "personId": "1",
                "person": {
                    "id": "1",
                    "name": "John",
                    "age": 30
                }
            },
            {
                "id": "3",
                "street": "789 Oak St",
                "city": "Springfield",
                "personId": "1",
                "person": {
                    "id": "1",
                    "name": "John",
                    "age": 30
                }
            }
        ]
    },
    {
        "id": "2",
        "name": "Jane",
        "age": 25,
        "address": [
            {
                "id": "4",
                "street": "101 Maple St",
                "city": "Springfield",
                "personId": "2",
                "person": {
                    "id": "2",
                    "name": "Jane",
                    "age": 25
                }
            },
            {
                "id": "5",
                "street": "112 Pine St",
                "city": "Springfield",
                "personId": "2",
                "person": {
                    "id": "2",
                    "name": "Jane",
                    "age": 25
                }
            }
        ]
    }
]
```
```json
{
    "rtsc::person:2;": "{\"id\":\"2\",\"name\":\"Jane\",\"age\":25}",
    "rtsc::address:2;": "{\"id\":\"2\",\"street\":\"456 Elm St\",\"city\":\"Springfield\",\"personId\":\"1\"}",
    "rtsc::person:1;": "{\"id\":\"1\",\"name\":\"John\",\"age\":30}",
    "rtsc::::index-of::person-identifiers::": "[\"1\",\"2\"]",
    "rtsc::::index-of::address-identifiers::": "[\"1\",\"2\",\"3\",\"4\",\"5\"]",
    "rtsc::address:1;": "{\"id\":\"1\",\"street\":\"123 Main St\",\"city\":\"Springfield\",\"personId\":\"1\"}",
    "rtsc::::index-of::address-identifiers::which-has-one::person::as::personId::with-identifier::2::": "[\"4\",\"5\"]",
    "rtsc::address:4;": "{\"id\":\"4\",\"street\":\"101 Maple St\",\"city\":\"Springfield\",\"personId\":\"2\"}",
    "rtsc::::index-of::address-identifiers::which-has-one::person::as::personId::with-identifier::1::": "[\"1\",\"2\",\"3\"]",
    "rtsc::address:3;": "{\"id\":\"3\",\"street\":\"789 Oak St\",\"city\":\"Springfield\",\"personId\":\"1\"}",
    "rtsc::address:5;": "{\"id\":\"5\",\"street\":\"112 Pine St\",\"city\":\"Springfield\",\"personId\":\"2\"}"
}
```

### Backup and Restore
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
