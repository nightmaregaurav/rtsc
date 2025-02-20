import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import {RelationalClassesIn} from "./BaseTypes";
import RelationalProperty from "./RelationalProperty";

export default class RelationalClassSpecification<T extends PlainObject> {
    class: ClassReference<T>;
    table: string;
    identifier: string;
    relationalProperties: RelationalProperty<RelationalClassesIn<T>>[];
}