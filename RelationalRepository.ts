import {EntityIdentifierType} from "./BaseTypes";
import {RelationalClassSpecification} from "./RelationalClassSpecification";
import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import {RelationalClassSpecificationRegistry} from "./RelationalClassSpecificationRegistry";
import DataDriver from "./DataDriver";
import {RelationalQuery} from "./RelationalQuery";

export class RelationalRepository<T extends PlainObject> {
  private readonly classSpecification: RelationalClassSpecification<T>;

  constructor(_class: ClassReference<T>) {
    this.classSpecification = RelationalClassSpecificationRegistry.getSpecificationFor(_class);
  }

  public async create(instance: T): Promise<EntityIdentifierType> {
    const identifier = this.classSpecification.identifier;
    const tableName = this.classSpecification.tableName;
    const identifierValue = instance[identifier] as EntityIdentifierType;
    const schema = this.classSpecification.schema;
    for (const column of schema) {
      const dataKey = DataDriver.getTableDataKey(
        tableName,
        identifierValue,
        identifier
      );

      await DataDriver.instance.write(dataKey, instance[column]);
    }
    await DataDriver.addIndex(tableName, identifierValue);
    return identifierValue;
  }
  
  public async getQueryable(): Promise<RelationalQuery<T>> {
    return new RelationalQuery<T>(this.classSpecification);
  }

  public async update(instance: T): Promise<void> {
    const identifier = this.classSpecification.identifier;
    const tableName = this.classSpecification.tableName;
    const identifierValue = instance[identifier] as EntityIdentifierType;
    const schema = this.classSpecification.schema;
    for (const column of schema) {
      const dataKey = DataDriver.getTableDataKey(
        tableName,
        identifierValue,
        column
      );
      await DataDriver.instance.write(dataKey, instance[column]);
    }
  }

  public async delete(identifier: EntityIdentifierType): Promise<void> {
    const tableName = this.classSpecification.tableName;
    await DataDriver.removeIndex(tableName, identifier);
    const schema = this.classSpecification.schema;
    for (const column of schema) {
      const dataKey = DataDriver.getTableDataKey(
        tableName,
        identifier,
        column
      );
      await DataDriver.instance.remove(dataKey);
    }
    await DataDriver.removeIndex(tableName, identifier);
  }
}