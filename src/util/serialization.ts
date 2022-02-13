

export class SerializationHelper {
    static toInstance<T>(obj: T, json: object | string): T {
        let jsonObj: any = json;
        if (typeof jsonObj === 'string') {
            jsonObj = JSON.parse(jsonObj);
        }
        if (!jsonObj) {
            jsonObj = {};
        }
        if (typeof obj["fromJSON"] === "function") {
            obj["fromJSON"](jsonObj);
        }
        else {
            for (const propName in jsonObj) {
                obj[propName] = jsonObj[propName];
            }
        }
        return obj;
    }
}