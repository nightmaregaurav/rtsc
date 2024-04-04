import {RelationalClassStorageDriver} from "./RelationalClassStorageDriver";
import {RelationalClassSpecificationRegistry} from "./RelationalClassSpecificationRegistry";
import {RelationalClassSpecification} from "./RelationalClassSpecification";
import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";

export class RelationalClassDataHandler<T extends PlainObject> {
    private readonly Write: (data: PlainObject[]) => Promise<void>;
    private readonly getClassSpecification: () => RelationalClassSpecification;

    constructor(private _class: ClassReference<T>, private depth: number = 1) {
        this.getClassSpecification = () => RelationalClassSpecificationRegistry.getSpecificationFor(_class);
        this.Write = (data: PlainObject[]) => RelationalClassStorageDriver.getTableWriter()(this.getClassSpecification().tableName, data);
    }

    private async sanitize(data: T[]){
        const sanitizedData: T[] = [];
        for(const obj of data){
            const sanitizedObj = {...obj};
            const specification = this.getClassSpecification();
            for (const relProperty of specification.relationalProperties) {
                delete sanitizedObj[relProperty.name];
            }
            sanitizedData.push(sanitizedObj);
        }
        return sanitizedData;
    }

    private async getAllData<TT extends PlainObject>(_class: ClassReference<TT>, depth: number): Promise<TT[]> {
        const specification = RelationalClassSpecificationRegistry.getSpecificationFor(_class);
        const data = await RelationalClassStorageDriver.getTableReader()(specification.tableName) || []

        const relationalTableData: PlainObject = new PlainObject();
        for (const relProperty of specification.relationalProperties) {
            const relatedClassName = relProperty.relatedClass.name;
            if (depth <= 0) {
                relationalTableData[relatedClassName] = [];
                continue;
            }
            relationalTableData[relatedClassName] = await this.getAllData(relProperty.relatedClass, depth - 1);
        }

        data.forEach((obj: any) => {
            for (const relProperty of specification.relationalProperties) {
                const relatedClassName = relProperty.relatedClass.name;
                if (relProperty.isList) {
                    obj[relProperty.name] = relationalTableData[relatedClassName].filter((x: PlainObject) => x[relProperty.idPropName] === obj[specification.identifier]);
                } else {
                    const relatedPropSpec = RelationalClassSpecificationRegistry.getSpecificationFor(relProperty.relatedClass);
                    obj[relProperty.name] = relationalTableData[relatedClassName].find((x: PlainObject) => x[relatedPropSpec.identifier] === obj[relProperty.idPropName]);
                }
            }
        });
        return (data || []) as TT[];
    }

    async create(obj: T): Promise<void> {
        let data = await this.getAllData(this._class, this.depth);
        if (data.find(x => x[this.getClassSpecification().identifier] === obj[this.getClassSpecification().identifier])) {
            throw new Error(`Object with id ${obj[this.getClassSpecification().identifier]} already exists.`);
        }
        data.push(obj);
        await this.Write(await this.sanitize(data));
    }

    async retrieve(id: string): Promise<T> {
        let data = await this.getAllData(this._class, this.depth);
        const obj = data.find(x => x[this.getClassSpecification().identifier] === id);
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
        const index = data.findIndex(x => x[this.getClassSpecification().identifier] === obj[this.getClassSpecification().identifier]);
        if (index === -1) {
            throw new Error(`Object with id ${obj[this.getClassSpecification().identifier]} does not exist`);
        }
        data[index] = obj;
        await this.Write(await this.sanitize(data));
    }

    async createOrUpdate(obj: T): Promise<void> {
        let data = await this.getAllData(this._class, this.depth);
        const index = data.findIndex(x => x[this.getClassSpecification().identifier] === obj[this.getClassSpecification().identifier]);
        if (index === -1) {
            data.push(obj);
        } else {
            data[index] = obj;
        }
        await this.Write(await this.sanitize(data));
    }

    async createIfNotExists(obj: T): Promise<void> {
        let data = await this.getAllData(this._class, this.depth);
        if (data.find(x => x[this.getClassSpecification().identifier] === obj[this.getClassSpecification().identifier])) {
            return;
        }
        data.push(obj);
        await this.Write(await this.sanitize(data));
    }

    async exists(id: string): Promise<boolean> {
        let data = await this.getAllData(this._class, this.depth);
        return !!data.find(x => x[this.getClassSpecification().identifier] === id);
    }

    async delete(obj: T): Promise<void> {
        let data = await this.getAllData(this._class, this.depth);
        const index = data.findIndex(x => x[this.getClassSpecification().identifier] === obj[this.getClassSpecification().identifier]);
        if (index === -1) {
            throw new Error(`Object with id ${obj[this.getClassSpecification().identifier]} does not exist`);
        }
        data.splice(index, 1);
        await this.Write(await this.sanitize(data));
    }

    async deleteIfExists(id: string): Promise<void> {
        let data = await this.getAllData(this._class, this.depth);
        const index = data.findIndex(x => x[this.getClassSpecification().identifier] === id);
        if (index === -1) {
            return;
        }
        data.splice(index, 1);
        await this.Write(await this.sanitize(data));
    }

    withDepth(depth: number): RelationalClassDataHandler<T> {
        return new RelationalClassDataHandler(this._class, depth);
    }

    static async dumpAllData(): Promise<Map<string, PlainObject[]>> {
        const data: Map<string, PlainObject[]> = new Map<string, PlainObject[]>();
        const specifications = RelationalClassSpecificationRegistry.getAllSpecifications();
        for(const spec of specifications){
            const tableReader = RelationalClassStorageDriver.getTableReader();
            data.set(spec.tableName, await tableReader(spec.tableName) || []);
        }
        return data;
    }

    static async loadAllData(data: Map<string, PlainObject[]>): Promise<void> {
        const specifications = RelationalClassSpecificationRegistry.getAllSpecifications();
        for(const spec of specifications){
            const tableWriter = RelationalClassStorageDriver.getTableWriter();
            let tableData = data.get(spec.tableName);
            if(!tableData){
                tableData = [];
            }
            await tableWriter(spec.tableName, tableData);
        }
    }
}
