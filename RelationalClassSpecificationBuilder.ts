import RelationalClassSpecification from "./RelationalClassSpecification";
import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import {
  CollectionRelationalPropertiesIn,
  EntityIdentifierType,
  PotentialIdentifierTypesIn,
  RelationalClassesIn,
  SingularRelationalPropertiesIn
} from "./BaseTypes";
import DataDriver from "./DataDriver";

export default class RelationalClassSpecificationBuilder<T extends PlainObject> {
  private readonly specification: RelationalClassSpecification<T> = new RelationalClassSpecification<T>();
  private isTableNameManuallySet: boolean = false;

  constructor(_class: ClassReference<T>) {
    this.specification.registeredClass = _class;
    this.specification.tableName = _class.name;
    this.specification.relationalProperties = [];
  }

  public useTableName(tableName: string): RelationalClassSpecificationBuilder<T> {
    if (this.isTableNameManuallySet) {
      throw new Error("Cannot set the table name more than once.");
    }
    this.specification.tableName = tableName;
    this.isTableNameManuallySet = true;
    return this;
  }

  public withIdentifier(identifier: PotentialIdentifierTypesIn<T>): RelationalClassSpecificationBuilder<T> {
    if (this.specification.identifier) {
      throw new Error("Cannot set multiple identifiers for the same class.");
    }
    this.specification.identifier = identifier as string;
    this.specification.isIdentifierString = 
      typeof this.specification.registeredClass.prototype[identifier] === "string";
    return this;
  }

  public hasOne<TT extends RelationalClassesIn<T>>(
    property: SingularRelationalPropertiesIn<T>,
    relatedClass: ClassReference<TT>,
    foreignKeyProperty: PotentialIdentifierTypesIn<T>
  ): RelationalClassSpecificationBuilder<T> {
    if (
      this.specification.relationalProperties.find(
        x => x.name === property
      )
    ) {
      throw new Error(`Cannot set multiple relational properties with the same name: ${property as string}`);
    }
    this.specification.relationalProperties.push({
      name: property as string,
      relatedClass: relatedClass,
      fkPropName: foreignKeyProperty as string,
      isList: false
    });
    return this;
  }

  public hasMany<TT extends RelationalClassesIn<T>>(
    property: CollectionRelationalPropertiesIn<T>,
    relatedClass: ClassReference<TT>,
    foreignKeyProperty: PotentialIdentifierTypesIn<TT>
  ): RelationalClassSpecificationBuilder<T> {
    if (
      this.specification.relationalProperties.find(
        x => x.name === property
      )
    ) {
      throw new Error(`Cannot set multiple relational properties with the same name: ${property as string}`);
    }
    this.specification.relationalProperties.push({
      name: property as string,
      relatedClass: relatedClass,
      fkPropName: foreignKeyProperty as string,
      isList: true
    });
    return this;
  }

  public build(): RelationalClassSpecification<T> {
    if (!this.specification.identifier) {
      throw new Error("Cannot create a specification without an identifier.");
    }
    return this.specification;
  }
}
