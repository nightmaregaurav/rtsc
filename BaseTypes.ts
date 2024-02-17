export class PlainObject { [key: string]: any; }

export type Class<T> = new () => T;

export type EntityPropertyType = string | number | boolean | Date;

export type TypesInClass<T> = { [P in keyof T]: T[P]; }[keyof T];

export type RemoveArrayTypes<T> = T extends (infer U)[] ? RemoveArrayTypes<U> : T;

export type Except<T, K extends T> = T extends K ? never : T;

export type RelationalClassesOf<T> = Except<RemoveArrayTypes<TypesInClass<T>>, EntityPropertyType>;
