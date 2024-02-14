"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RelationalClassSpecificationRegistry = void 0;
class RelationalClassSpecificationRegistry {
    static register(_class, specification) {
        if (this.specifications[_class.name]) {
            throw new Error("A Class Specification is already registered for the class " + _class.name);
        }
        this.specifications[_class.name] = specification;
    }
    static isRegistered(_class) {
        return !!this.specifications[_class.name];
    }
    static getSpecification(_class) {
        if (!this.specifications[_class.name]) {
            throw new Error("No specification found for class " + _class.name);
        }
        return this.specifications[_class.name];
    }
}
exports.RelationalClassSpecificationRegistry = RelationalClassSpecificationRegistry;
RelationalClassSpecificationRegistry.specifications = {};
