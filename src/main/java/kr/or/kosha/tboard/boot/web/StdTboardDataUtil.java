package kr.or.kosha.tboard.boot.web;

import org.json.simple.JSONObject;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class StdTboardDataUtil {
	public StdTboardDataUtil() {
		this.common = new Common(); 
		this.service = new Service();
	}
	
    private Common common;
    private Service service;
    
    @Data
    @NoArgsConstructor
    public static class Common {
        private FrontInfo frontInfo = new FrontInfo();
        private Paging paging = new Paging();
        private AuthInfo authInfo = new AuthInfo();
        private String secrity;
        private Tboard tboard = new Tboard();
        private JSONObject data = new JSONObject();
        
    }
    
    @Data
    @NoArgsConstructor
    public static class FrontInfo {
        // Add attributes as needed
    }
    
    @Data
    @NoArgsConstructor
    public static class Paging {
        // Add attributes as needed
    }
    
    @Data
    @NoArgsConstructor
    public static class AuthInfo {
        // Add attributes as needed
    }
    
    @Data
    @NoArgsConstructor
    public static class Tboard {
        private String bbsId;
        private String channel;
        private String systemCd;
    }

    @Data
    @NoArgsConstructor
    public static class Service {
        private Info info = new Info();
        private JSONObject data = new JSONObject();
    
    }
    
    @Data
    public static class Info {
        private String id;
        private String type;
    }
    
}

	

