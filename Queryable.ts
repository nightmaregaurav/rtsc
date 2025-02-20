import ClassSpecification from "./ClassSpecification";
import {PlainObject} from "@nightmaregaurav/ts-utility-types";
import {EntityIdentifierType, GetKeyFlatTypeFor, RelationalPropertiesIn} from "./BaseTypes";
import DataDriver from "./DataDriver";
import Repository from "./Repository";
import ClassSpecificationRegistry from "./ClassSpecificationRegistry";

export default class Queryable<Root extends PlainObject, Current extends PlainObject = Root> {
    private includeMap: PlainObject = {};
    private currentIncludePointer: string = "";
    
    constructor(private rootClassSpecification: ClassSpecification<Root>) {}
    
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
    ): Queryable<Root, GetKeyFlatTypeFor<Root, K>> {
        if (this.includeMap[key as string] === undefined){
            this.includeMap[key as string] = {};
        }
        this.currentIncludePointer = key as string;
        
        const query = new Queryable<Root, GetKeyFlatTypeFor<Root, K>>(this.rootClassSpecification);
        query.injectCurrentIncludePointer(this.currentIncludePointer);
        query.injectIncludeMap(this.includeMap);
        return query;
    }

    thenInclude<K extends RelationalPropertiesIn<Current>>(
      key: K
    ): Queryable<Root, GetKeyFlatTypeFor<Current, K>> {
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
        
        const query = new Queryable<Root, GetKeyFlatTypeFor<Current, K>>(this.rootClassSpecification);
        query.injectCurrentIncludePointer(this.currentIncludePointer);
        query.injectIncludeMap(this.includeMap);
        return query;
    }

    async getById(id: EntityIdentifierType) : Promise<Root>{
        const dataKey = DataDriver.getTableDataKey(this.rootClassSpecification.table, id);
        const data = await DataDriver.instance.read<Root>(dataKey);
        if (!data){
            throw new Error(
              `No data found for id: ${id}. 
               Table ${this.rootClassSpecification.table} does not 
               contain row with property ${this.rootClassSpecification.identifier} having value ${id}`
            );
        }
        return Queryable.attachIncludesAndGet(
          data,
          this.rootClassSpecification,
          this.includeMap
        );
    }

    async getByIds(ids: EntityIdentifierType[]) : Promise<Root[]>{
        const result: Root[] = [];
        for(const id of ids){
            const dataKey = DataDriver.getTableDataKey(this.rootClassSpecification.table, id);
            const data = await DataDriver.instance.read<Root>(dataKey);
            if (data){
                const attachedData = await Queryable.attachIncludesAndGet(
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
        const indexes = await DataDriver.getTableIndex(this.rootClassSpecification.table);
        const result: Root[] = [];
        for(const index of indexes){
            const dataKey = DataDriver.getTableDataKey(this.rootClassSpecification.table, index);
            const data = await DataDriver.instance.read<Root>(dataKey);
            if (data){
                const attachedData = await Queryable.attachIncludesAndGet(
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
      classSpecification: ClassSpecification<T>,
      includeContext: PlainObject
    ): Promise<T> {
        const relationalProperties = classSpecification.relationalProperties;
        const attachedData: PlainObject = {...data};
        for(const includeKey in includeContext){
            const relationalProperty = relationalProperties
              .find(x => x.name === includeKey);
            if (!relationalProperty){
                throw new Error(
                  `Invalid include key: ${includeKey}.
                   No such relational property found in class: ${classSpecification.class.name}`
                );
            }
            const relationalPropertyRepository = new Repository(
              relationalProperty.class
            );
            const isRelationalPropertyAList = relationalProperty.isList;
            if(isRelationalPropertyAList){
                const relationalClassSpecification =
                  ClassSpecificationRegistry.getSpecificationFor(
                    relationalProperty.class
                  );
                const relatedTableName = relationalClassSpecification.table;
                const currentTableName = classSpecification.table;
                const relatedPropertyIdPropertyName = relationalProperty.idProperty;
                const relatedPropertyId = data[classSpecification.identifier];
                const idsToFetch = await DataDriver.getRelationIndex(
                  currentTableName,
                  relatedTableName,
                  relatedPropertyIdPropertyName,
                  relatedPropertyId
                );
                attachedData[includeKey] = await relationalPropertyRepository
                  .getQueryable()
                  .injectIncludeMap(includeContext[includeKey])
                  .getByIds(idsToFetch || []);
            }
            if(!isRelationalPropertyAList){
                const relatedPropertyId = data[relationalProperty.idProperty];
                if (!relatedPropertyId){
                    attachedData[includeKey] = null;
                } else {
                    attachedData[includeKey] = await relationalPropertyRepository
                      .getQueryable()
                      .injectIncludeMap(includeContext[includeKey])
                      .getById(relatedPropertyId);
                }
            }
        }
        return attachedData as T;
    }
}