import RelationalClassSpecification from "./RelationalClassSpecification";
import {PlainObject} from "@nightmaregaurav/ts-utility-types";
import {EntityIdentifierType, GetKeyFlatTypeFor, RelationalPropertiesIn} from "./BaseTypes";
import DataDriver from "./DataDriver";
import RelationalRepository from "./RelationalRepository";

export default class RelationalQuery<Root extends PlainObject, Current extends PlainObject = Root> {
    private includeMap: PlainObject = {};
    private currentIncludePointer: string = "";
    
    constructor(private rootClassSpecification: RelationalClassSpecification<Root>) {}
    
    private injectCurrentIncludePointer(currentIncludePointer: string) {
        this.currentIncludePointer = currentIncludePointer;
        return this;
    }

    private injectIncludeMap(includeMap: PlainObject) {
        this.includeMap = includeMap;
        return this;
    }
    
    include<K extends RelationalPropertiesIn<Root>>(
      key: K
    ): RelationalQuery<Root, GetKeyFlatTypeFor<Root, K>> {
        if (this.includeMap[key as string] === undefined){
            this.includeMap[key as string] = {};
        }
        this.currentIncludePointer = key as string;
        
        const query = new RelationalQuery<Root, GetKeyFlatTypeFor<Root, K>>(this.rootClassSpecification);
        query.injectCurrentIncludePointer(this.currentIncludePointer);
        query.injectIncludeMap(this.includeMap);
        return query;
    }

    thenInclude<K extends RelationalPropertiesIn<Current>>(
      key: K
    ): RelationalQuery<Root, GetKeyFlatTypeFor<Current, K>> {
        if (this.currentIncludePointer === ""){
            throw new Error("Cannot call thenInclude without calling include first.");
        }
        
        const currentIncludePointer = this.currentIncludePointer;
        const currentIncludePath = currentIncludePointer.split("::");
        
        let includeMapContext: PlainObject = {};
        for(const includePath of currentIncludePath){
            includeMapContext = this.includeMap[includePath];
            if (this.includeMap[includePath] === undefined){
                throw new Error("Something went wrong while fetching include map context.");
            }
            includeMapContext = this.includeMap[includePath];
        }
        
        if (includeMapContext[key as string] === undefined){
            includeMapContext[key as string] = {};
        }
        
        this.currentIncludePointer = currentIncludePointer + "::" + (key as string);
        
        const query = new RelationalQuery<Root, GetKeyFlatTypeFor<Current, K>>(this.rootClassSpecification);
        query.injectCurrentIncludePointer(this.currentIncludePointer);
        query.injectIncludeMap(this.includeMap);
        return query;
    }

    async getById(id: EntityIdentifierType) : Promise<Root>{
        const dataKey = DataDriver.getTableDataKey(this.rootClassSpecification.tableName, id);
        const data = await DataDriver.instance.read<Root>(dataKey);
        if (!data){
            throw new Error(
              `No data found for id: ${id}. 
               Table ${this.rootClassSpecification.tableName} does not 
               contain row with property ${this.rootClassSpecification.identifier} having value ${id}`
            );
        }
        return RelationalQuery.attachIncludesAndGet(
          data,
          this.rootClassSpecification,
          this.includeMap
        );
    }

    async getByIds(ids: EntityIdentifierType[]) : Promise<Root[]>{
        const result: Root[] = [];
        for(const id of ids){
            const dataKey = DataDriver.getTableDataKey(this.rootClassSpecification.tableName, id);
            const data = await DataDriver.instance.read<Root>(dataKey);
            if (data){
                const attachedData = await RelationalQuery.attachIncludesAndGet(
                  data,
                  this.rootClassSpecification,
                  this.includeMap
                );
                result.push(attachedData);
            }
        }
        return result;
    }
    
    async getAll(): Promise<Root[]> {
        const indexes = await DataDriver.getIndex(this.rootClassSpecification.tableName);
        const result: Root[] = [];
        for(const index of indexes){
            const dataKey = DataDriver.getTableDataKey(this.rootClassSpecification.tableName, index);
            const data = await DataDriver.instance.read<Root>(dataKey);
            if (data){
                const attachedData = await RelationalQuery.attachIncludesAndGet(
                  data,
                  this.rootClassSpecification,
                  this.includeMap
                );
                result.push(attachedData);
            }
        }
        return result;
    }
    
    private static async attachIncludesAndGet<T extends PlainObject>(
      data: T,
      classSpecification: RelationalClassSpecification<T>,
      includeContext: PlainObject
    ): Promise<T> {
        const relationalProperties = classSpecification.relationalProperties;
        const attachedData: PlainObject = {...data};
        for(const includeKey in includeContext){
            const relationalPropertyDefinition = relationalProperties
              .find(x => x.name === includeKey);
            if (!relationalPropertyDefinition){
                throw new Error(
                  `Invalid include key: ${includeKey}.
                   No such relational property found in class: ${classSpecification.registeredClass.name}`
                );
            }
            
            const relationalPropertyRepository = new RelationalRepository(
              relationalPropertyDefinition.relatedClass
            );
            const isRelationalPropertyAList = relationalPropertyDefinition.isList;
            if(isRelationalPropertyAList){
                const fkTableName = relationalPropertyDefinition.relatedClass.name;
                const nonFkTableName = classSpecification.tableName;
                const fk = data[classSpecification.identifier];
                const idsToFetch = await DataDriver.getFkIndex(
                  nonFkTableName,
                  fkTableName,
                  fk
                );
                attachedData[includeKey] = await relationalPropertyRepository
                  .getQueryable()
                  .injectIncludeMap(includeContext[includeKey])
                  .getByIds(idsToFetch);
            }
            if(!isRelationalPropertyAList){
                const fk = data[relationalPropertyDefinition.fkPropName];
                attachedData[includeKey] = await relationalPropertyRepository
                  .getQueryable()
                  .injectIncludeMap(includeContext[includeKey])
                  .getById(fk);
            }
        }
        return attachedData as T;
    }
}