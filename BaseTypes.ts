import {Except, FlattenArrayTypes, PlainObject, TypesInType} from "@nightmaregaurav/ts-utility-types";

export type EntityPropertyType = string | number | boolean | Date;
export type EntityIdentifierType = string | number;
export type RelationalClassesIn<T> = Except<FlattenArrayTypes<TypesInType<T>>, EntityPropertyType>;

export type GetKeyFlatTypeFor<T extends PlainObject, Key extends keyof T> = T[Key] extends (infer U extends PlainObject)[] ? U : T[Key];

export type PotentialIdentifierTypesIn<T> = {
  [K in keyof T]: T[K] extends EntityIdentifierType ? K : never;
}[keyof T];

export type RelationalPropertiesIn<T> = {
  [K in keyof T]: T[K] extends RelationalClassesIn<T> | RelationalClassesIn<T>[] ? K : never;
}[keyof T];

export type SingularRelationalPropertiesIn<T> = {
  [K in keyof T]: T[K] extends RelationalClassesIn<T> ? K : never;
}[keyof T];

export type CollectionRelationalPropertiesIn<T> = {
  [K in keyof T]: T[K] extends RelationalClassesIn<T>[] ? K : never;
}[keyof T];
