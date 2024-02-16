# RTSC (Relational TypeScript Classes)
[![npm version](https://badge.fury.io/js/@nightmaregaurav%2Frtsc.svg)](https://badge.fury.io/js/@nightmaregaurav%2Frtsc)
[![HitCount](https://hits.dwyl.com/nightmaregaurav/rtsc.svg?style=flat)](http://hits.dwyl.com/nightmaregaurav/rtsc)<br>
[![NPM](https://nodei.co/npm/@nightmaregaurav/rtsc.png?mini=true)](https://nodei.co/npm/@nightmaregaurav/rtsc/)
***

## Description
RTSC is a library that allows you to define classes that can be stored and retrieved from a data storage in a relational way. It is designed to mimic the behavior of a relational database ORM, but it is not an ORM. Neither is it supposed to be used with remote database. It pulls entire table from storage and then performs operations to bind relational data and store it back. So, it is not suitable for remote databases. But it can be helpful for local storages, like LocalStorage, IndexedDB, sql.js, SessionStorage, etc.

## Installation
```bash
npm install @nightmaregaurav/rtsc
````

## Usage
### Defining Entity Classes
```typescript
// Person.ts
import {Address} from "./Address";

export class Person {
    id: string;
    name: string;
    age: number;
    address: Address[];
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
    person: Person;
}
```

### Defining Entity Class Specifications
```typescript
// PersonSpecification.ts
import {RelationalClassSpecificationBuilder} from "@nightmaregaurav/rtsc/RelationalClassSpecificationBuilder";
import {Person} from "./Person";
import {Address} from "./Address";

export const PersonSpecification = new RelationalClassSpecificationBuilder(Person)
    .withTableName("person") // Optional: By default it uses class name
    .hasIdentifier("id")
    .hasMany("address", Address, "personId")
    .build();
```
```typescript
// AddressSpecification.ts
import {RelationalClassSpecificationBuilder} from "@nightmaregaurav/rtsc/RelationalClassSpecificationBuilder";
import {Person} from "./Person";
import {Address} from "./Address";

export const AddressSpecification = new RelationalClassSpecificationBuilder(Address)
    .withTableName("address") // Optional: By default it uses class name
    .hasIdentifier("id")
    .hasOne("person", Person, "personId")
    .build();
```

### Registering Entity Class Specifications
```typescript
// DataRegistry.ts
import {RelationalClassSpecificationRegistry} from "@nightmaregaurav/rtsc/RelationalClassSpecificationRegistry";
import {Person} from "./Person";
import {Address} from "./Address";
import {PersonSpecification} from "./PersonSpecification";
import {AddressSpecification} from "./AddressSpecification";

RelationalClassSpecificationRegistry.register(AddressSpecification);
RelationalClassSpecificationRegistry.register(PersonSpecification);
```

### Setup DataStore (Optional: By default it uses LocalStorage)
```typescript
// index.ts
import {RelationalClassStorageDriver} from "@nightmaregaurav/rtsc/RelationalClassStorageDriver";

// You can use any storage here, like LocalStorage, IndexedDB, sql.js, SessionStorage, etc.
// skipping this step will use LocalStorage
const DataStorage = new Map<string, any[]>();
if (!RelationalClassStorageDriver.isConfigured()) {
    RelationalClassStorageDriver.configure(
        async table => await (async () => DataStorage.get(table) || [])(),
        async (table, data) => await (async () => { DataStorage.set(table, data); })()
    );
}
```

### Creating Data Handlers
```typescript
// DataHandlers.ts
import {RelationalClassDataHandler} from "@nightmaregaurav/rtsc/RelationalClassDataHandler";
import {Person} from "./Person";
import {Address} from "./Address";

export const PersonDataHandler = new RelationalClassDataHandler(Person);
export const AddressDataHandler = new RelationalClassDataHandler(Address, 1); // 1 is the depth of relational data
```

### Using Data Handlers
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
    await PersonDataHandler.createIfNotExists(person);
    await AddressDataHandler.createIfNotExists(address1);
    await AddressDataHandler.createIfNotExists(address2);
    console.log(await PersonDataHandler.withDepth(2).retrieve("1"));
    console.log(await AddressDataHandler.retrieve("1"));
})();

// Output:

// Person {
//     id: '1',
//     name: 'John',
//     age: 30,
//     address: [
//         Address {
//             id: '1',
//             street: '123 Main St',
//             city: 'Springfield',
//             personId: '1',
//             person: [Circular *1]
//         },
//         Address {
//             id: '2',
//             street: '456 Elm St',
//             city: 'Springfield',
//             personId: '1',
//             person: [Circular *1]
//         }
//     ]
// }
```

### Backup and Restore (Clearing the storage is not handled, so you need to handle it yourself)
```typescript
// Backup.ts
import {RelationalClassDataHandler} from "@nightmaregaurav/rtsc/RelationalClassDataHandler";

const dump = await RelationalClassDataHandler.dumpAllData(); // dump is a Map<string, any[]> where string is the table name and any[] is the data
... // Save the dump to a file or send it to a server
```
```typescript
// Restore.ts
import {RelationalClassDataHandler} from "@nightmaregaurav/rtsc/RelationalClassDataHandler";

await RelationalClassDataHandler.loadAllData(dump); // dump is a Map<string, any[]> where string is the table name and any[] is the data
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
