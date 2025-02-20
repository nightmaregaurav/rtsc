import {EntityIdentifierType} from "./BaseTypes";
import ClassSpecification from "./ClassSpecification";
import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import ClassSpecificationRegistry from "./ClassSpecificationRegistry";
import DataDriver from "./DataDriver";
import RelationalQuery from "./RelationalQuery";

export default class RelationalRepository<T extends PlainObject> {
  private readonly classSpecification: ClassSpecification<T>;

  constructor(_class: ClassReference<T>) {
    this.classSpecification = ClassSpecificationRegistry.getSpecificationFor(_class);
  }

  public async create(instance: T): Promise<EntityIdentifierType> {
    const tableName = this.classSpecification.table;
    const identifierProperty = this.classSpecification.identifier;
    const identifierValue = instance[identifierProperty] as EntityIdentifierType;
    const dataKey = DataDriver.getTableDataKey(tableName, identifierValue);
    const pureObject = this.getPureObject(instance);

    await DataDriver.addTableIndex(tableName, identifierValue);
    await DataDriver.instance.write(dataKey, pureObject);

    for (const relationalProperty of this.classSpecification.relationalProperties) {
      if (!relationalProperty.isList) {
        const relatedClassSpecification = ClassSpecificationRegistry
          .getSpecificationFor(relationalProperty.class);
        const relatedTable = relatedClassSpecification.table;
        const nameOnSourceTable = relationalProperty.name;
        const idOnSource = instance[relationalProperty.idProperty] as EntityIdentifierType;
        await DataDriver.addRelationIndex(
          relatedTable,
          tableName,
          nameOnSourceTable,
          idOnSource,
          identifierValue
        );
        const relationalRepository = new RelationalRepository(relationalProperty.class);
        const relatedObject = instance[relationalProperty.name];
        await relationalRepository.createOrUpdate(
      }
    }
    return identifierValue;
  }
  
  public getQueryable(): RelationalQuery<T, T> {
    return new RelationalQuery<T, T>(this.classSpecification);
  }

  public async update(instance: T): Promise<void> {
    const tableName = this.classSpecification.table;
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
    const tableName = this.classSpecification.table;
    const dataKey = DataDriver.getTableDataKey(
      tableName,
      identifier,
    );
    const dataToBeDeleted = await DataDriver.instance.read<T>(dataKey);
    await DataDriver.instance.remove(dataKey);
    await DataDriver.removeTableIndex(tableName, identifier);
    for (const relationalProperty of this.classSpecification.relationalProperties) {
      if (!relationalProperty.isList) {
        const relatedClassSpecification = ClassSpecificationRegistry
          .getSpecificationFor(relationalProperty.class);
        const nonFkTableName = relatedClassSpecification.table;
        const fk = dataToBeDeleted[relationalProperty.idProperty] as EntityIdentifierType;
        await DataDriver.removeRelationIndex(nonFkTableName, tableName, fk, identifier);
      }
      else {
        const relatedClassSpecification = ClassSpecificationRegistry
          .getSpecificationFor(relationalProperty.class);
        const fkTableName = relatedClassSpecification.table;
        await DataDriver.removeRelationIndexRecord(tableName, fkTableName, identifier);
      }
    }
  }
  
  private getPureObject(instance: T): PlainObject {
    const obj: PlainObject = {};
    const relationalProperties = this.classSpecification.relationalProperties.map(x => x.name);
    for (const column of Object.keys(instance)) {
      if (relationalProperties.includes(column)) {
        continue;
      }
      obj[column] = instance[column];
    }
    return obj;
  }
}