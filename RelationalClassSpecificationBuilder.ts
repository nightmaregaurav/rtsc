import {RelationalClassSpecification} from "./RelationalClassSpecification";
import {Class, PlainObject} from "./BaseTypes";

export class RelationalClassSpecificationBuilder<T extends PlainObject> {
    private readonly specification: RelationalClassSpecification = new RelationalClassSpecification();

    constructor() {
        this.specification.relationalProperties = [];
    }

    hasIdentifier(identifier: keyof T): RelationalClassSpecificationBuilder<T> {
        if (this.specification.identifier) {
            throw new Error("Cannot set multiple identifiers for the same class.");
        }
        this.specification.identifier = identifier as string;
        return this;
    }

    hasOne<TT extends PlainObject>(name: keyof T, relatedClass: Class<TT>, idPropName: keyof T): RelationalClassSpecificationBuilder<T> {
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

    hasMany<TT extends PlainObject>(name: keyof T, relatedClass: Class<TT>, idPropName: keyof TT): RelationalClassSpecificationBuilder<T> {
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
