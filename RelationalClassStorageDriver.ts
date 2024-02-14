import {PlainObject} from "./BaseTypes";

export type TableReader = (table: string) => Promise<PlainObject[]>;
export type TableWriter = (table: string, data: PlainObject[]) => Promise<void>;

export class RelationalClassStorageDriver {
    private static TableReader: TableReader;
    private static TableWriter: TableWriter;

    public static configure(tableReader: TableReader, tableWriter: TableWriter): void {
        if (RelationalClassStorageDriver.isConfigured()){
            throw new Error("RelationalClassStorageDriver is already configured.");
        }
        RelationalClassStorageDriver.TableReader = tableReader;
        RelationalClassStorageDriver.TableWriter = tableWriter;
    }

    public static isConfigured(): boolean {
        return !!RelationalClassStorageDriver.TableReader && !!RelationalClassStorageDriver.TableWriter;
    }

    public static getTableReader() {
        if (RelationalClassStorageDriver.TableReader == null){
            throw new Error("TableReader is not configured.");
        }
        return RelationalClassStorageDriver.TableReader;
    }

    public static getTableWriter() {
        if (RelationalClassStorageDriver.TableWriter == null){
            throw new Error("TableWriter is not configured.");
        }
        return RelationalClassStorageDriver.TableWriter;
    }
}
