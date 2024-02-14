import {Class, PlainObject} from "./BaseTypes";
import {RelationalClassSpecification} from "./RelationalClassSpecification";

export class RelationalClassSpecificationRegistry {
    private static readonly specifications: PlainObject = {};

    static register<T>(_class: Class<T>, specification: RelationalClassSpecification): void {
        if (this.specifications[_class.name]) {
            throw new Error("A Class Specification is already registered for the class " + _class.name);
        }
        this.specifications[_class.name] = specification;
    }

    static isRegistered<T>(_class: Class<T>): boolean {
        return !!this.specifications[_class.name];
    }

    static getSpecification<T>(_class: Class<T>): RelationalClassSpecification {
        if (!this.specifications[_class.name]) {
            throw new Error("No specification found for class " + _class.name);
        }
        return this.specifications[_class.name];
    }
}
