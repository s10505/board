package test;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class StdTboardDataUtil {
    private Common common;
    private Service service;

    public StdTboardDataUtil() {
        this.common = new Common();
        this.service = new Service();
    }
	
    // Common 클래스
    public static class Common {
        private FrontInfo frontInfo;
        private Paging paging;
        private AuthInfo authInfo;
        private String secrity;
        private Tboard tboard;
        private Data data;  // Common 내의 Data 객체

        public Common() {
            this.frontInfo = new FrontInfo();
            this.paging = new Paging();
            this.authInfo = new AuthInfo();
            this.tboard = new Tboard();
            this.data = new Data();  // Common에서의 Data는 독립적인 객체
        }

        // Getter & Setter
        public FrontInfo getFrontInfo() { return frontInfo; }
        public void setFrontInfo(FrontInfo frontInfo) { this.frontInfo = frontInfo; }

        public Paging getPaging() { return paging; }
        public void setPaging(Paging paging) { this.paging = paging; }

        public AuthInfo getAuthInfo() { return authInfo; }
        public void setAuthInfo(AuthInfo authInfo) { this.authInfo = authInfo; }

        public String getSecrity() { return secrity; }
        public void setSecrity(String secrity) { this.secrity = secrity; }

        public Tboard getTboard() { return tboard; }
        public void setTboard(Tboard tboard) { this.tboard = tboard; }

        public Data getData() { return data; }
        public void setData(Data data) { this.data = data; }
    }
    
    
    // Service 클래스
    public static class Service {
        private Info info;
        private Data data;  // Service 내의 Data 객체 (독립적)

        public Service() {
            this.info = new Info();
            this.data = new Data();  // Service에서의 Data는 Common의 Data와 별개
        }

        // Getter & Setter
        public Info getInfo() { return info; }
        public void setInfo(Info info) { this.info = info; }

        public Data getData() { return data; }  // Service에서 사용하는 Data
        public void setData(Data data) { this.data = data; }
    }
    
    
    
    // Info 클래스
    public static class Info {
        private String id;
        private String type;

        // Getter & Setter
        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
    }

    // Data 클래스 (Common 내의 data와 Service 내의 data는 별도의 객체로 관리)
    public static class Data {
    	public Data() {}
    }

    // 기타 클래스들 (예: FrontInfo, Paging, AuthInfo, Tboard)도 정의할 수 있습니다.
    public static class FrontInfo {
    	public FrontInfo() {}
    }
    public static class Paging {
    	public Paging() {} 
    }
    public static class AuthInfo {
    	public AuthInfo() {} 
    }
    public static class Tboard { 
        public Tboard() {}
    }
    
    
}
	

