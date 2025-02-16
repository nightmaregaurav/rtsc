import {IDataDriver} from "./IDataDriver";
import {EntityIdentifierType} from "./BaseTypes";

export default class DataDriver {
  private static _instance: IDataDriver;
  
  public static get instance(): IDataDriver {
    if (!DataDriver._instance) {
      throw new Error("DataDriver has not been set");
    }
    return DataDriver._instance;
  }

  static use(driver: IDataDriver) {
    DataDriver._instance = driver;
  }
  
  static getTableIndexKey(tableName: string): string {
    return `::${tableName}::index`;
  }
  
  static async getIndex(tableName: string): Promise<EntityIdentifierType[]> {
    return await DataDriver.instance.read<EntityIdentifierType[]>(DataDriver.getTableIndexKey(tableName));
  }
  
  static async addIndex(tableName: string, index: EntityIdentifierType): Promise<void> {
    const existingIndex = await DataDriver.getIndex(tableName);
    if (existingIndex.includes(index)) {
      throw new Error(`Index constraint violation: ${index} already exists in ${tableName}`);
    }
    existingIndex.push(index);
    await DataDriver.instance.write(DataDriver.getTableIndexKey(tableName), existingIndex);
  }
  
  static async removeIndex(tableName: string, index: EntityIdentifierType): Promise<void> {
    const existingIndex = await DataDriver.getIndex(tableName);
    if (!existingIndex.includes(index)) {
      return;
    }
    const newIndexes = existingIndex.filter(x => x !== index);
    await DataDriver.instance.write(DataDriver.getTableIndexKey(tableName), newIndexes);
  }
  
  static getTableDataKey(tableName: string, index: EntityIdentifierType, column: string): string {
    return `${tableName}:${index}:${column}`;
  }
}