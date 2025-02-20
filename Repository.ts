import {EntityIdentifierType, RelationalClassesIn, RelationalPropertiesIn} from "./BaseTypes";
import ClassSpecification from "./ClassSpecification";
import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import ClassSpecificationRegistry from "./ClassSpecificationRegistry";
import DataDriver from "./DataDriver";
import Queryable from "./Queryable";

export default class Repository<T extends PlainObject> {
  private readonly classSpecification: ClassSpecification<T>;

  constructor(_class: ClassReference<T>) {
    this.classSpecification = ClassSpecificationRegistry.getSpecificationFor(_class);
  }

  public async createOrUpdate(instance: T): Promise<EntityIdentifierType> {
    const tableName = this.classSpecification.table;
    const tableIndex = await DataDriver.getTableIndex(tableName);
    const identifierProperty = this.classSpecification.identifier;
    const identifierValue = instance[identifierProperty] as EntityIdentifierType;
    if (tableIndex.includes(identifierValue)) {
      await this.update(instance);
      return identifierValue;
    }
    return this.create(instance);
  }
  
  public async create(instance: T): Promise<EntityIdentifierType> {
    const tableName = this.classSpecification.table;
    const identifierProperty = this.classSpecification.identifier;
    const identifierValue = instance[identifierProperty] as EntityIdentifierType;
    
    await this.handleRelationalProperties(instance, identifierValue);

    const dataKey = DataDriver.getTableDataKey(tableName, identifierValue);
    const pureObject = this.getPureObject(instance);
    await DataDriver.addTableIndex(tableName, identifierValue);
    await DataDriver.instance.write(dataKey, pureObject);
    return identifierValue;
  }
  
  public getQueryable(): Queryable<T, T> {
    return new Queryable<T, T>(this.classSpecification);
  }

  public async update(instance: T): Promise<void> {
    const tableName = this.classSpecification.table;
    const identifierProperty = this.classSpecification.identifier;
    const identifierValue = instance[identifierProperty] as EntityIdentifierType;
    
    await this.handleRelationalProperties(instance, identifierValue);

    const dataKey = DataDriver.getTableDataKey(tableName, identifierValue,);
    const pureObject = this.getPureObject(instance);
    await DataDriver.instance.write(dataKey, pureObject);
  }

  public async delete(instance: T): Promise<void> {
    const tableName = this.classSpecification.table;
    const identifierProperty = this.classSpecification.identifier;
    const identifierValue = instance[identifierProperty] as EntityIdentifierType;
    const dataKey = DataDriver.getTableDataKey(tableName, identifierValue);
    
    await DataDriver.removeTableIndex(tableName, identifierValue);
    await DataDriver.instance.remove(dataKey);

    for (const relationalProperty of this.classSpecification.relationalProperties) {
      const relatedClassSpecification = ClassSpecificationRegistry
        .getSpecificationFor(relationalProperty.class);
      const relatedTable = relatedClassSpecification.table;
      const relatedPropertyIdName = relationalProperty.idProperty;
      if (!relationalProperty.isList) {
        const identifierOfRelatedTable = instance[relationalProperty.idProperty] as EntityIdentifierType;
        await DataDriver.removeRelationIndex(
          relatedTable,
          tableName,
          relatedPropertyIdName,
          identifierOfRelatedTable,
          identifierValue
        );
      }
      else {
        await DataDriver.removeRelationIndexRecord(
          tableName,
          relatedTable,
          relationalProperty.idProperty,
          identifierValue
        );
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
  
  private async handleRelationalProperties(instance: T, identifier: EntityIdentifierType): Promise<void> {
    for (const relationalProperty of this.classSpecification.relationalProperties) {
      if (!relationalProperty.isList) {
        const relatedClassSpecification = ClassSpecificationRegistry
          .getSpecificationFor(relationalProperty.class);
        const nameOnSourceTable = relationalProperty.name;
        const relatedObject = instance[nameOnSourceTable];
        let idOnSource = instance[relationalProperty.idProperty] as EntityIdentifierType;
        if (relatedObject) {
          if (!idOnSource) {
            idOnSource = relatedObject[relatedClassSpecification.identifier];
            Object.assign(instance, {[relationalProperty.idProperty]: idOnSource});
          }
          const relationalRepository = new Repository(relationalProperty.class);
          await relationalRepository.createOrUpdate(relatedObject);
        }
        
        const relatedTable = relatedClassSpecification.table;
        const relatedIdNameOnSource = relationalProperty.idProperty;
        await DataDriver.addRelationIndex(
          relatedTable,
          this.classSpecification.table,
          relatedIdNameOnSource,
          idOnSource,
          identifier
        );
      } else {
        const relatedObjects = instance[relationalProperty.name] as RelationalClassesIn<T>[];
        if (!relatedObjects || relatedObjects.length === 0) {
          continue;
        }
        const relationalRepository = new Repository(relationalProperty.class);
        for (const relatedObject of relatedObjects) {
          const idOfSource = instance[this.classSpecification.identifier] as EntityIdentifierType;
          const sourceIdPropNameOnRelatedObject = relationalProperty.idProperty;
          relatedObject[sourceIdPropNameOnRelatedObject] = idOfSource;
          await relationalRepository.createOrUpdate(relatedObject);
        }
      }
    }
  }
}