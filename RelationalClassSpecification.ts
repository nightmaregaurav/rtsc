import {Class} from "./BaseTypes";

export class RelationalProperty {
    name: string;
    relatedClass: Class<any>;
    idPropName: string;
    isList: boolean;
}

export class RelationalClassSpecification {
    identifier: string;
    relationalProperties: RelationalProperty[];
}
