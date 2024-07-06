export namespace main {
	
	export class DeviceOtaMeta {
	
	
	    static createFrom(source: any = {}) {
	        return new DeviceOtaMeta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

