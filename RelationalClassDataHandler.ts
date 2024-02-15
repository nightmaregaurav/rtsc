import {RelationalClassStorageDriver, TableReader, TableWriter} from "./RelationalClassStorageDriver";
import {Class, PlainObject} from "./BaseTypes";
import {RelationalClassSpecificationRegistry} from "./RelationalClassSpecificationRegistry";

export class RelationalClassDataHandler<T extends PlainObject> {
    private readonly tableReader: TableReader;
    private readonly tableWriter: TableWriter;

    constructor(private _class: Class<T>, private depth: number = 1) {
        if(RelationalClassStorageDriver.isConfigured()) {
            this.tableReader = RelationalClassStorageDriver.getTableReader();
            this.tableWriter = RelationalClassStorageDriver.getTableWriter();
        } else {
            this.tableReader = (table: string) => (async () => {
                return JSON.parse(localStorage.getItem(table) || "[]");
            })();
            this.tableWriter = (table: string, data: PlainObject[]) => (async () => {
                localStorage.setItem(table, JSON.stringify(data));
            })();
        }
    }

    private async getAllData(_class: Class<T>, depth: number): Promise<T[]> {
        const data = await this.tableReader(_class.name);

        const specification = RelationalClassSpecificationRegistry.getSpecification(_class);
        const relationalTableData: PlainObject = new PlainObject();
        for (const relProperty of specification.relationalProperties) {
            if (depth <= 0) {
                relationalTableData[relProperty.relatedClass.name] = [];
                continue;
            }
            relationalTableData[relProperty.relatedClass.name] = await this.getAllData(relProperty.relatedClass, depth - 1);
        }

        data.forEach((obj: any) => {
            for (const relProperty of specification.relationalProperties) {
                if (relProperty.isList) {
                    obj[relProperty.name] = relationalTableData[relProperty.relatedClass.name].filter((x: PlainObject) => x[relProperty.idPropName] === obj[specification.identifier]);
                } else {
                    const relatedPropSpec = RelationalClassSpecificationRegistry.getSpecification(relProperty.relatedClass);
                    obj[relProperty.name] = relationalTableData[relProperty.relatedClass.name].find((x: PlainObject) => x[relatedPropSpec.identifier] === obj[relProperty.idPropName]);
                }
            }
        });
        return (data || []) as T[];
    }

    async create(obj: T): Promise<void> {
        let data = await this.getAllData(this._class, this.depth);
        const specification = RelationalClassSpecificationRegistry.getSpecification(this._class);
        if (data.find(x => x[specification.identifier] === obj[specification.identifier])) {
            throw new Error(`Object with id ${obj[specification.identifier]} already exists.`);
        }
        data.push(obj);
        await this.tableWriter(this._class.name, data);
    }

    async retrieve(id: string): Promise<T> {
        let data = await this.getAllData(this._class, this.depth);
        const specification = RelationalClassSpecificationRegistry.getSpecification(this._class);
        const obj = data.find(x => x[specification.identifier] === id);
        if (!obj) {
            throw new Error(`Object with id ${id} does not exist`);
        }
        return obj;
    }

    async retrieveAll(): Promise<T[]> {
        return await this.getAllData(this._class, this.depth);
    }

    async count(): Promise<number> {
        return (await this.getAllData(this._class, this.depth)).length;
    }

    async update(obj: T): Promise<void> {
        let data = await this.getAllData(this._class, this.depth);
        const specification = RelationalClassSpecificationRegistry.getSpecification(this._class);
        const index = data.findIndex(x => x[specification.identifier] === obj[specification.identifier]);
        if (index === -1) {
            throw new Error(`Object with id ${obj[specification.identifier]} does not exist`);
        }
        data[index] = obj;
        await this.tableWriter(this._class.name, data);
    }

    async createOrUpdate(obj: T): Promise<void> {
        let data = await this.getAllData(this._class, this.depth);
        const specification = RelationalClassSpecificationRegistry.getSpecification(this._class);
        const index = data.findIndex(x => x[specification.identifier] === obj[specification.identifier]);
        if (index === -1) {
            data.push(obj);
        } else {
            data[index] = obj;
        }
        await this.tableWriter(this._class.name, data);
    }

    async createIfNotExists(obj: T): Promise<void> {
        let data = await this.getAllData(this._class, this.depth);
        const specification = RelationalClassSpecificationRegistry.getSpecification(this._class);
        if (data.find(x => x[specification.identifier] === obj[specification.identifier])) {
            return;
        }
        data.push(obj);
        await this.tableWriter(this._class.name, data);
    }

    async exists(id: string): Promise<boolean> {
        let data = await this.getAllData(this._class, this.depth);
        const specification = RelationalClassSpecificationRegistry.getSpecification(this._class);
        return !!data.find(x => x[specification.identifier] === id);
    }

    async delete(obj: T): Promise<void> {
        let data = await this.getAllData(this._class, this.depth);
        const specification = RelationalClassSpecificationRegistry.getSpecification(this._class);
        const index = data.findIndex(x => x[specification.identifier] === obj[specification.identifier]);
        if (index === -1) {
            throw new Error(`Object with id ${obj[specification.identifier]} does not exist`);
        }
        data.splice(index, 1);
        await this.tableWriter(this._class.name, data);
    }

    async deleteIfExists(id: string): Promise<void> {
        let data = await this.getAllData(this._class, this.depth);
        const specification = RelationalClassSpecificationRegistry.getSpecification(this._class);
        const index = data.findIndex(x => x[specification.identifier] === id);
        if (index === -1) {
            return;
        }
        data.splice(index, 1);
        await this.tableWriter(this._class.name, data);
    }
}
