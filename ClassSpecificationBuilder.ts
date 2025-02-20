import ClassSpecification from "./ClassSpecification";
import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import {
  CollectionRelationalPropertiesIn,
  PotentialIdentifierTypesIn,
  RelationalClassesIn,
  SingularRelationalPropertiesIn
} from "./BaseTypes";

export default class ClassSpecificationBuilder<T extends PlainObject> {
  private readonly specification: ClassSpecification<T> = new ClassSpecification<T>();
  private isTableNameManuallySet: boolean = false;

  constructor(_class: ClassReference<T>) {
    this.specification.class = _class;
    this.specification.table = _class.name;
    this.specification.relationalProperties = [];
  }

  public useTableName(tableName: string): ClassSpecificationBuilder<T> {
    if (this.isTableNameManuallySet) {
      throw new Error("Cannot set the table name more than once.");
    }
    this.specification.table = tableName;
    this.isTableNameManuallySet = true;
    return this;
  }

  public withIdentifier(identifier: PotentialIdentifierTypesIn<T>): ClassSpecificationBuilder<T> {
    if (this.specification.identifier) {
      throw new Error("Cannot set multiple identifiers for the same class.");
    }
    this.specification.identifier = identifier as string;
    return this;
  }

  public hasOne<TT extends RelationalClassesIn<T>>(
    property: SingularRelationalPropertiesIn<T>,
    relatedClass: ClassReference<TT>,
    foreignKeyProperty: PotentialIdentifierTypesIn<T>
  ): ClassSpecificationBuilder<T> {
    if (
      this.specification.relationalProperties.find(
        x => x.name === property
      )
    ) {
      throw new Error(`Cannot set multiple relational properties with the same name: ${property as string}`);
    }
    this.specification.relationalProperties.push({
      name: property as string,
      class: relatedClass,
      idProperty: foreignKeyProperty as string,
      isList: false
    });
    return this;
  }

  public hasMany<TT extends RelationalClassesIn<T>>(
    property: CollectionRelationalPropertiesIn<T>,
    relatedClass: ClassReference<TT>,
    foreignKeyProperty: PotentialIdentifierTypesIn<TT>
  ): ClassSpecificationBuilder<T> {
    if (
      this.specification.relationalProperties.find(
        x => x.name === property
      )
    ) {
      throw new Error(`Cannot set multiple relational properties with the same name: ${property as string}`);
    }
    this.specification.relationalProperties.push({
      name: property as string,
      class: relatedClass,
      idProperty: foreignKeyProperty as string,
      isList: true
    });
    return this;
  }

  public build(): ClassSpecification<T> {
    if (!this.specification.identifier) {
      throw new Error("Cannot create a specification without an identifier.");
    }
    return this.specification;
  }
}
