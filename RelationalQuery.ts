import {RelationalClassSpecification} from "./RelationalClassSpecification";
import {PlainObject} from "@nightmaregaurav/ts-utility-types";
import {GetKeyFlatTypeFor, RelationalPropertiesIn} from "./BaseTypes";

class RelationalQuery<Root extends PlainObject, Current extends PlainObject = Root> {
    private includeMap: PlainObject = {};
    private currentIncludePointer: string = "";

    constructor(private rootClassSpecification: RelationalClassSpecification<Root>) {}

    include<K extends RelationalPropertiesIn<Root>>(key: K): RelationalQuery<Root, GetKeyFlatTypeFor<Root, K>> {
        this.includes.push(String(key));
        return new RelationalQuery<Root, GetKeyFlatTypeFor<Root, K>>(this.rootClassSpecification);
    }

    thenInclude<K extends RelationalPropertiesIn<Current>>(key: K): RelationalQuery<Root, GetKeyFlatTypeFor<Current, K>> {
        this.includes.push(String(key));
        return new RelationalQuery<Root, GetKeyFlatTypeFor<Current, K>>(this.rootClassSpecification);
    }
    
    
}