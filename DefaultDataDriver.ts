import {IDataDriver} from "./IDataDriver";

export default class DefaultDataDriver implements IDataDriver {
  keyPrefix = "rtsc::";
  
  write(key: string, value: any): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.setItem(this.keyPrefix + key, value);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }

  read(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const value = localStorage.getItem(this.keyPrefix + key);
        resolve(value);
      } catch (error) {
        reject(error);
      }
    });
  }

  remove(key: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        localStorage.removeItem(this.keyPrefix + key);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
}