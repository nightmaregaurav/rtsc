import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import {RelationalClassesIn} from "./BaseTypes";

export class RelationalProperty<T extends PlainObject> {
    name: string;
    relatedClass: ClassReference<T>;
    idPropName: string;
    isList: boolean;
}

export class RelationalClassSpecification<T extends PlainObject> {
    registeredClass: ClassReference<T>;
    tableName: string;
    identifier: string;
    isIdentifierString: boolean;
    relationalProperties: RelationalProperty<RelationalClassesIn<T>>[];
    schema: string[];
}