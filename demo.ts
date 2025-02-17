import {
  DataDriver,
  DefaultDataDriver,
  RelationalClassSpecificationBuilder,
  RelationalClassSpecificationRegistry,
  RelationalRepository,
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

export const PersonSpecification = new RelationalClassSpecificationBuilder<Person>(Person)
  .useTableName("person") // Optional: By default it uses class name
  .withIdentifier("id")
  .hasMany("address", Address, "personId")
  .build();

export const AddressSpecification = new RelationalClassSpecificationBuilder<Address>(Address)
  .useTableName("address") // Optional: By default it uses class name
  .withIdentifier("id")
  .hasOne("person", Person, "personId")
  .build();

RelationalClassSpecificationRegistry.register(AddressSpecification);
RelationalClassSpecificationRegistry.register(PersonSpecification);

export const PersonRepository = new RelationalRepository(Person);
export const AddressRepository = new RelationalRepository(Address);


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
  
  const backup = await DataDriver.instance.dumpAll();
  console.log(backup);
  await DataDriver.instance.loadAll(backup);
})();