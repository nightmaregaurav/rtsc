import IDataDriver from "./IDataDriver";
import {EntityIdentifierType} from "./BaseTypes";

export default class DataDriver {
  private static _instance: IDataDriver;
  
  public static get instance(): IDataDriver {
    if (!DataDriver._instance) {
      throw new Error("DataDriver has not been set");
    }
    return DataDriver._instance;
  }

  public static configure(driver: IDataDriver) {
    DataDriver._instance = driver;
  }
  
  private static getTableIndexKey(table: string): string {
    return ':' +
      ':index-of:' +
      `:${table}-identifiers:` +
    ':';
  }
  
  private static getRelationIndexKey(
    destinationTable: string,
    sourceTable: string,
    destinationIdPropertyNameOnSourceTable: string,
    destinationIdOnSourceTable: EntityIdentifierType
  ): string {
    return ':' +
      ':index-of:' +
      `:${sourceTable}-identifiers:` +
      ':which-has-one:' +
      `:${destinationTable}:` +
      ':as:' +
      `:${destinationIdPropertyNameOnSourceTable}:` +
      ':with-identifier:' +
      `:${destinationIdOnSourceTable}:` +
    ':';
  }
  
  static async getTableIndex(table: string): Promise<EntityIdentifierType[]> {
    const tableIndexKey = DataDriver.getTableIndexKey(table);
    const index = await DataDriver.instance.read<EntityIdentifierType[]>(tableIndexKey);
    return index || [];
  }
  
  static async getRelationIndex(
    destinationTable: string,
    sourceTable: string,
    destinationIdPropertyNameOnSourceTable: string,
    destinationIdOnSourceTable: EntityIdentifierType,
  ): Promise<EntityIdentifierType[]> {
    const relationIndexKey = DataDriver.getRelationIndexKey(
      destinationTable,
      sourceTable,
      destinationIdPropertyNameOnSourceTable,
      destinationIdOnSourceTable
    );
    return await DataDriver.instance.read<EntityIdentifierType[]>(relationIndexKey);
  }
  
  static async addTableIndex(table: string, identifier: EntityIdentifierType): Promise<void> {
    const tableIndexKey = DataDriver.getTableIndexKey(table);
    const tableIndex = await DataDriver.instance.read<EntityIdentifierType[]>(tableIndexKey);
    if (!tableIndex) {
      await DataDriver.instance.write(tableIndexKey, [identifier]);
      return;
    }
    if (tableIndex.includes(identifier)) {
      throw new Error(`Index constraint violation: ${identifier} already exists in ${table}`);
    }
    tableIndex.push(identifier);
    await DataDriver.instance.write(tableIndexKey, tableIndex);
  }
  
  static async addRelationIndex(
    destinationTable: string,
    sourceTable: string,
    destinationIdPropertyNameOnSourceTable: string,
    destinationIdOnSourceTable: EntityIdentifierType,
    identifier: EntityIdentifierType
  ): Promise<void> {
    const relationIndexKey = DataDriver.getRelationIndexKey(
      destinationTable,
      sourceTable,
      destinationIdPropertyNameOnSourceTable,
      destinationIdOnSourceTable
    );
    const relationIndex = await DataDriver.instance.read<EntityIdentifierType[]>(
      relationIndexKey
    );
    if (!relationIndex) {
      await DataDriver.instance.write(relationIndexKey, [identifier]);
      return;
    }
    if (relationIndex.includes(identifier)) {
      return;
    }
    relationIndex.push(identifier);
    await DataDriver.instance.write(relationIndexKey, relationIndex);
  }
  
  static async removeTableIndex(table: string, identifier: EntityIdentifierType): Promise<void> {
    const tableIndexKey = DataDriver.getTableIndexKey(table);
    const tableIndex = await DataDriver.instance.read<EntityIdentifierType[]>(tableIndexKey);
    if (!tableIndex) {
      return;
    }
    const newIndex = tableIndex.filter(x => x !== identifier);
    await DataDriver.instance.write(tableIndexKey, newIndex);
  }
  
  static async removeRelationIndex(
    destinationTable: string,
    sourceTable: string,
    destinationIdPropertyNameOnSourceTable: string,
    destinationIdOnSourceTable: EntityIdentifierType,
    identifier: EntityIdentifierType
  ): Promise<void> {
    const relationIndexKey = DataDriver.getRelationIndexKey(
      destinationTable,
      sourceTable,
      destinationIdPropertyNameOnSourceTable,
      destinationIdOnSourceTable
    );
    const relationIndex = await DataDriver.instance.read<EntityIdentifierType[]>(relationIndexKey);
    if (!relationIndex) {
      return;
    }
    const newRelationIndex = relationIndex.filter(x => x !== identifier);
    await DataDriver.instance.write(relationIndexKey, newRelationIndex);
  }

  static async removeRelationIndexRecord(
    destinationTable: string,
    sourceTable: string,
    destinationIdPropertyNameOnSourceTable: string,
    destinationIdOnSourceTable: EntityIdentifierType
  ): Promise<void> {
    const relationIndexKey = DataDriver.getRelationIndexKey(
      destinationTable,
      sourceTable,
      destinationIdPropertyNameOnSourceTable,
      destinationIdOnSourceTable
    );
    await DataDriver.instance.remove(relationIndexKey);
  }
  
  static getTableDataKey(tableName: string, index: EntityIdentifierType): string {
    return `${tableName}:${index};`;
  }
}