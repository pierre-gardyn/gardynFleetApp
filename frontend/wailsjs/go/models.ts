export namespace main {
	
	export class OtaDevicesFilter {
	
	
	    static createFrom(source: any = {}) {
	        return new OtaDevicesFilter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

