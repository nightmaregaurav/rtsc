import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import {RelationalClassesIn} from "./BaseTypes";
import RelationalProperty from "./RelationalProperty";

export default class RelationalClassSpecification<T extends PlainObject> {
    registeredClass: ClassReference<T>;
    tableName: string;
    identifier: string;
    isIdentifierString: boolean;
    relationalProperties: RelationalProperty<RelationalClassesIn<T>>[];
}