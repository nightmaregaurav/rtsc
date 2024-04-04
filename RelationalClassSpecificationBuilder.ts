import {RelationalClassSpecification} from "./RelationalClassSpecification";
import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import {RelationalClassesOf} from "./BaseTypes";

export class RelationalClassSpecificationBuilder<T extends PlainObject> {
    private readonly specification: RelationalClassSpecification = new RelationalClassSpecification();
    private isTableNameManuallySet: boolean = false;

    constructor(_class: ClassReference<T>) {
        this.specification.registeredClass = _class;
        this.specification.tableName = _class.name;
        this.specification.relationalProperties = [];
    }

    withTableName(tableName: string): RelationalClassSpecificationBuilder<T> {
        if (this.isTableNameManuallySet) {
            throw new Error("Cannot set the table name more than once.");
        }
        this.specification.tableName = tableName;
        this.isTableNameManuallySet = true;
        return this;
    }

    hasIdentifier(identifier: keyof T): RelationalClassSpecificationBuilder<T> {
        if (this.specification.identifier) {
            throw new Error("Cannot set multiple identifiers for the same class.");
        }
        this.specification.identifier = identifier as string;
        return this;
    }

    hasOne<TT extends RelationalClassesOf<T>>(name: keyof T, relatedClass: ClassReference<TT>, idPropName: keyof T): RelationalClassSpecificationBuilder<T> {
        if (this.specification.relationalProperties.find(x => x.name === name)) {
            throw new Error(`Cannot set multiple relational properties with the same name: ${name as string}`);
        }
        this.specification.relationalProperties.push({
            name: name as string,
            relatedClass: relatedClass,
            idPropName: idPropName as string,
            isList: false
        });
        return this;
    }

    hasMany<TT extends RelationalClassesOf<T>>(name: keyof T, relatedClass: ClassReference<TT>, idPropName: keyof TT): RelationalClassSpecificationBuilder<T> {
        if (this.specification.relationalProperties.find(x => x.name === name)) {
            throw new Error(`Cannot set multiple relational properties with the same name: ${name as string}`);
        }
        this.specification.relationalProperties.push({
            name: name as string,
            relatedClass: relatedClass,
            idPropName: idPropName as string,
            isList: true
        });
        return this;
    }

    build(): RelationalClassSpecification {
        if (!this.specification.identifier) {
            throw new Error("Cannot create a specification without an identifier.");
        }
        return this.specification;
    }
}
