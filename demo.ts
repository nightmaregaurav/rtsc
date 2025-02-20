import {
  DataDriver,
  DefaultDataDriver,
  ClassSpecificationBuilder,
  ClassSpecificationRegistry,
  Repository,
} from "./index";

DataDriver.configure(new DefaultDataDriver());

export class Person {
  id: string;
  name: string;
  age: number;
  address: Address[];
}

export class Address {
  id: string;
  street: string;
  city: string;
  personId: string;
  person: Person;
}

export const PersonSpecification = new ClassSpecificationBuilder<Person>(Person)
  .useTableName("person") // Optional: By default it uses class name
  .withIdentifier("id")
  .hasMany("address", Address, "personId")
  .build();

export const AddressSpecification = new ClassSpecificationBuilder<Address>(Address)
  .useTableName("address") // Optional: By default it uses class name
  .withIdentifier("id")
  .hasOne("person", Person, "personId")
  .build();

ClassSpecificationRegistry.register(AddressSpecification);
ClassSpecificationRegistry.register(PersonSpecification);

export const PersonRepository = new Repository(Person);
export const AddressRepository = new Repository(Address);


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
person1.id = "2";
person1.name = "Jane"
person1.age = 25;
person1.address = [address4, address5];

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