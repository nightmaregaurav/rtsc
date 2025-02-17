import {PlainObject} from "@nightmaregaurav/ts-utility-types";

export default interface IDataDriver {
  write<T>(key: string, value: T): Promise<boolean>;
  read<T>(key: string): Promise<T>;
  remove(key: string): Promise<boolean>;
  dumpAll(): Promise<PlainObject>;
  loadAll(data: PlainObject): Promise<boolean>;
}