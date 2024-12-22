package test;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestJson {
    private Common common;
    private Service service;

    public TestJson() {
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
        private Data data;

        public Common() {
            this.frontInfo = new FrontInfo();  // 빈 객체로 초기화
            this.paging = new Paging();  // 빈 객체로 초기화
            this.authInfo = new AuthInfo();  // 빈 객체로 초기화
            this.tboard = new Tboard();  // 빈 객체로 초기화
            this.data = new Data();  // 빈 객체로 초기화
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
        // 필요한 필드와 생성자, getter/setter 추가
    }

    // 기타 클래스들 (예: FrontInfo, Paging, AuthInfo, Tboard)도 정의할 수 있습니다.
    public static class FrontInfo { /*필드 정의*/ }
    public static class Paging { /*필드 정의*/ }
    public static class AuthInfo { /*필드 정의*/ }
    public static class Tboard { /*필드 정의*/ }

    public static void main(String[] args) {
        String jsonString = "{ \"common\": { \"frontInfo\": {}, \"paging\": {}, \"authInfo\": {}, \"secrity\": \"\", \"tboard\": { \"bbsId\": \"\", \"channel\": \"\", \"systemCd\": \"\" }, \"data\": {} }, \"service\": { \"info\": { \"id\": \"\", \"type\": \"\" }, \"data\": {} } }";

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            TestJson dataUtil = objectMapper.readValue(jsonString, TestJson .class);
            System.out.println("DataUtil: " + dataUtil);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
