import {EntityIdentifierType} from "./BaseTypes";
import RelationalClassSpecification from "./RelationalClassSpecification";
import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import RelationalClassSpecificationRegistry from "./RelationalClassSpecificationRegistry";
import DataDriver from "./DataDriver";
import RelationalQuery from "./RelationalQuery";

export default class RelationalRepository<T extends PlainObject> {
  private readonly classSpecification: RelationalClassSpecification<T>;

  constructor(_class: ClassReference<T>) {
    this.classSpecification = RelationalClassSpecificationRegistry.getSpecificationFor(_class);
  }

  public async create(instance: T): Promise<EntityIdentifierType> {
    const tableName = this.classSpecification.tableName;
    const identifierProperty = this.classSpecification.identifier;
    const identifierValue = instance[identifierProperty] as EntityIdentifierType;
    const dataKey = DataDriver.getTableDataKey(
      tableName,
      identifierValue,
    );
    const pureObject = this.getPureObject(instance);
    await DataDriver.instance.write(dataKey, pureObject);
    await DataDriver.addIndex(tableName, identifierValue);
    for (const relationalProperty of this.classSpecification.relationalProperties) {
      if (!relationalProperty.isList) {
        const relatedClassSpecification = RelationalClassSpecificationRegistry
          .getSpecificationFor(relationalProperty.relatedClass);
        const nonFkTableName = relatedClassSpecification.tableName;
        const fk = instance[relationalProperty.fkPropName] as EntityIdentifierType;
        await DataDriver.addFkIndex(nonFkTableName, tableName, fk, identifierValue);
      }
    }
    return identifierValue;
  }
  
  public getQueryable(): RelationalQuery<T, T> {
    return new RelationalQuery<T, T>(this.classSpecification);
  }

  public async update(instance: T): Promise<void> {
    const tableName = this.classSpecification.tableName;
    const identifierProperty = this.classSpecification.identifier;
    const identifierValue = instance[identifierProperty] as EntityIdentifierType;
    const dataKey = DataDriver.getTableDataKey(
      tableName,
      identifierValue,
    );
    const pureObject = this.getPureObject(instance);
    await DataDriver.instance.write(dataKey, pureObject);
  }

  public async delete(identifier: EntityIdentifierType): Promise<void> {
    const tableName = this.classSpecification.tableName;
    const dataKey = DataDriver.getTableDataKey(
      tableName,
      identifier,
    );
    const dataToBeDeleted = await DataDriver.instance.read<T>(dataKey);
    await DataDriver.instance.remove(dataKey);
    await DataDriver.removeIndex(tableName, identifier);
    for (const relationalProperty of this.classSpecification.relationalProperties) {
      if (!relationalProperty.isList) {
        const relatedClassSpecification = RelationalClassSpecificationRegistry
          .getSpecificationFor(relationalProperty.relatedClass);
        const nonFkTableName = relatedClassSpecification.tableName;
        const fk = dataToBeDeleted[relationalProperty.fkPropName] as EntityIdentifierType;
        await DataDriver.removeFkIndex(nonFkTableName, tableName, fk, identifier);
      }
      else {
        const relatedClassSpecification = RelationalClassSpecificationRegistry
          .getSpecificationFor(relationalProperty.relatedClass);
        const fkTableName = relatedClassSpecification.tableName;
        const fkIndexKey = DataDriver.getFkIndexKey(tableName, fkTableName, identifier);
        await DataDriver.instance.remove(fkIndexKey);
      }
    }
  }
  
  private getPureObject(instance: T): PlainObject {
    const schema = this.classSpecification.schema;
    const obj: PlainObject = {};
    for (const column of schema) {
      obj[column] = instance[column];
    }
    return obj;
  }
}