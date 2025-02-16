export interface IDataDriver {
  write<T>(key: string, value: T): Promise<boolean>;
  read<T>(key: string): Promise<T>;
  remove(key: string): Promise<boolean>;
}