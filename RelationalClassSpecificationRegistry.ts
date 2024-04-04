import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import {RelationalClassSpecification} from "./RelationalClassSpecification";

export class RelationalClassSpecificationRegistry {
    private static readonly specifications: PlainObject = {};

    static register(specification: RelationalClassSpecification): void {
        if (this.specifications[specification.registeredClass.name]) {
            throw new Error(`A Class Specification is already registered for the class ${specification.registeredClass.name} which is mapped to table ${specification.tableName}`);
        }
        const alreadyMappedToTable = Object.values(this.specifications).find((x: RelationalClassSpecification) => x.tableName === specification.tableName);
        if (alreadyMappedToTable) {
            throw new Error(`${specification.tableName} is already mapped to class ${alreadyMappedToTable.class.name}`);
        }
        this.specifications[specification.registeredClass.name] = specification;
    }

    static isRegistered(specification: RelationalClassSpecification): boolean {
        return !!this.specifications[specification.registeredClass.name];
    }

    static isSpecificationRegisteredFor<T>(_class: ClassReference<T>): boolean {
        return !!this.specifications[_class.name];
    }

    static getSpecificationFor<T>(_class: ClassReference<T>): RelationalClassSpecification {
        if (!this.specifications[_class.name]) {
            throw new Error("No specification found for class " + _class.name);
        }
        return this.specifications[_class.name];
    }

    static getAllSpecifications(): RelationalClassSpecification[] {
        return Object.values(this.specifications);
    }
}
