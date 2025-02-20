import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";
import ClassSpecification from "./ClassSpecification";

export default class RelationalClassSpecificationRegistry {
    private static readonly specifications: PlainObject = {};

    public static register<T extends PlainObject>(specification: ClassSpecification<T>): void {
        const existingSpecification = this.specifications[specification.class.name];
        if (existingSpecification) {
            throw new Error(`A Class Specification is already registered for the class ${existingSpecification.registeredClass.name} which is mapped to table ${existingSpecification.tableName}`);
        }

        const alreadyMappedToTable = Object.values(this.specifications).find((x: ClassSpecification<T>) => x.table === specification.table);
        if (alreadyMappedToTable) {
            throw new Error(`${specification.table} is already mapped to class ${alreadyMappedToTable.class.name}`);
        }

        this.specifications[specification.class.name] = specification;
    }

    public static isRegistered<T extends PlainObject>(specification: ClassSpecification<T>): boolean {
        return !!this.specifications[specification.class.name];
    }

    public static isSpecificationRegisteredFor<T extends PlainObject>(_class: ClassReference<T>): boolean {
        return !!this.specifications[_class.name];
    }

    public static getSpecificationFor<T extends PlainObject>(_class: ClassReference<T>): ClassSpecification<T> {
        if (!this.specifications[_class.name]) {
            throw new Error("No specification found for class " + _class.name);
        }

        return this.specifications[_class.name] as ClassSpecification<T>;
    }

    public static getAllSpecifications(): ClassSpecification<PlainObject>[] {
        return Object.values(this.specifications) as ClassSpecification<PlainObject>[];
    }
}
