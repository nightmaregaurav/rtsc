import {ClassReference, PlainObject} from "@nightmaregaurav/ts-utility-types";

export default class RelationalProperty<T extends PlainObject> {
  name: string;
  relatedClass: ClassReference<T>;
  fkPropName: string;
  isList: boolean;
}