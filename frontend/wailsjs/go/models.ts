export namespace main {
	
	export class BlobInformation {
	
	
	    static createFrom(source: any = {}) {
	        return new BlobInformation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}
	export class DeviceOta {
	
	
	    static createFrom(source: any = {}) {
	        return new DeviceOta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}
	export class DeviceOtaMeta {
	
	
	    static createFrom(source: any = {}) {
	        return new DeviceOtaMeta(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}
	export class OtaDevicesFilter {
	
	
	    static createFrom(source: any = {}) {
	        return new OtaDevicesFilter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

