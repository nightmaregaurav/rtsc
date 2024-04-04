import {PlainObject} from "@nightmaregaurav/ts-utility-types";

export type TableReader = (table: string) => Promise<PlainObject[]>;
export type TableWriter = (table: string, data: PlainObject[]) => Promise<void>;

export class RelationalClassStorageDriver {
    private static TableReader: TableReader = (table: string) => (async () => {
        return JSON.parse(localStorage.getItem(table) || "[]");
    })();

    private static TableWriter: TableWriter = (table: string, data: PlainObject[]) => (async () => {
        localStorage.setItem(table, JSON.stringify(data));
    })();

    private static _isConfigured: boolean = false;
    public static configure(tableReader: TableReader, tableWriter: TableWriter): void {
        if (RelationalClassStorageDriver._isConfigured){
            throw new Error("RelationalClassStorageDriver is already configured.");
        }
        RelationalClassStorageDriver._isConfigured = true;
        RelationalClassStorageDriver.TableReader = tableReader;
        RelationalClassStorageDriver.TableWriter = tableWriter;
    }

    public static isConfigured(): boolean {
        return RelationalClassStorageDriver._isConfigured;
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
