import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import {RelationalClassesIn} from "./BaseTypes";
import RelationalProperty from "./RelationalProperty";

export default class ClassSpecification<T extends PlainObject> {
    class: ClassReference<T>;
    table: string;
    identifier: string;
    relationalProperties: RelationalProperty<RelationalClassesIn<T>>[];
}