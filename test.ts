import {RelationalClassSpecificationBuilder} from "./RelationalClassSpecificationBuilder";
import {RelationalClassSpecificationRegistry} from "./RelationalClassSpecificationRegistry";
import {RelationalRepository} from "./RelationalRepository";
import DataDriver from "./DataDriver";
import DefaultDataDriver from "./DefaultDataDriver";
import {PotentialIdentifierTypesIn} from "./BaseTypes";



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

var a : PotentialIdentifierTypesIn<Address>;

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

DataDriver.use(new DefaultDataDriver());

export const PersonDataHandler = new RelationalRepository(Person);
export const AddressDataHandler = new RelationalRepository(Address);


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
  await PersonDataHandler.create(person);
  await AddressDataHandler.create(address1);
  await AddressDataHandler.create(address2);
  
  const personQuery = await PersonDataHandler.getQueryable();
  personQuery.include("address");
  
  console.log(await PersonDataHandler.getQueryable());
  console.log(await AddressDataHandler.getQueryable());
})();