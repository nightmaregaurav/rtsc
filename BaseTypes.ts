import {Except, FlattenArrayTypes, TypesInType} from "@nightmaregaurav/ts-utility-types";

export type EntityPropertyType = string | number | boolean | Date;
export type RelationalClassesOf<T> = Except<FlattenArrayTypes<TypesInType<T>>, EntityPropertyType>;
