import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import {RelationalClassSpecification} from "./RelationalClassSpecification";

export class RelationalClassSpecificationRegistry {
    private static readonly specifications: PlainObject = {};

    static register<T extends PlainObject>(specification: RelationalClassSpecification<T>): void {
        const existingSpecification = this.specifications[specification.registeredClass.name];
        if (existingSpecification) {
            throw new Error(`A Class Specification is already registered for the class ${existingSpecification.registeredClass.name} which is mapped to table ${existingSpecification.tableName}`);
        }

        const alreadyMappedToTable = Object.values(this.specifications).find((x: RelationalClassSpecification<T>) => x.tableName === specification.tableName);
        if (alreadyMappedToTable) {
            throw new Error(`${specification.tableName} is already mapped to class ${alreadyMappedToTable.class.name}`);
        }

        this.specifications[specification.registeredClass.name] = specification;
    }

    static isRegistered<T extends PlainObject>(specification: RelationalClassSpecification<T>): boolean {
        return !!this.specifications[specification.registeredClass.name];
    }

    static isSpecificationRegisteredFor<T extends PlainObject>(_class: ClassReference<T>): boolean {
        return !!this.specifications[_class.name];
    }

    static getSpecificationFor<T extends PlainObject>(_class: ClassReference<T>): RelationalClassSpecification<T> {
        if (!this.specifications[_class.name]) {
            throw new Error("No specification found for class " + _class.name);
        }

        return this.specifications[_class.name] as RelationalClassSpecification<T>;
    }

    static getAllSpecifications(): RelationalClassSpecification<PlainObject>[] {
        return Object.values(this.specifications) as RelationalClassSpecification<PlainObject>[];
    }
}
