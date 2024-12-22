package kr.or.kosha.tboard.boot.web;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class StdTboardArtclUtil{
	
	@JsonProperty("search")
    private SearchCond search = new SearchCond();
    @JsonProperty("list")
    private SearchList list = new SearchList();
    @JsonProperty("detail")
    private Detail detail = new Detail();
    @JsonProperty("reply")
    private Reply reply = new Reply();
    @JsonProperty("write")
    private Write write = new Write();
    @JsonProperty("writeReply")
    private WriteReply writeReply = new WriteReply();

    
    public StdTboardArtclUtil(JSONArray jsonArray) throws JsonMappingException, JsonProcessingException, ParseException {
    	JSONObject jsonObject = reformatArclJson(jsonArray);
    	JSONParser parser = new JSONParser();
    	jsonObject = (JSONObject)parser.parse(jsonObject.toString());
    	
    	ObjectMapper objectMapper = new ObjectMapper();
        Iterator<String> keys = jsonObject.keySet().iterator();
        while (keys.hasNext()) {
        	String key = keys.next(); //search
        	if (key.equalsIgnoreCase("search")) {
        		this.search = objectMapper.readValue(((JSONObject)jsonObject.get(key)).toJSONString(), SearchCond.class);
        	}
        	else if (key.equalsIgnoreCase("list")) {
        		this.list = objectMapper.readValue(((JSONObject)jsonObject.get(key)).toJSONString(), SearchList.class);
        	}
        	else if (key.equalsIgnoreCase("detail")) {
        		this.detail = objectMapper.readValue(((JSONObject)jsonObject.get(key)).toJSONString(), Detail.class);
        	}
        	else if (key.equalsIgnoreCase("reply")) {
        		this.reply = objectMapper.readValue(((JSONObject)jsonObject.get(key)).toJSONString(), Reply.class);
        	}
        	else if (key.equalsIgnoreCase("write")) {
        		this.write = objectMapper.readValue(((JSONObject)jsonObject.get(key)).toJSONString(), Write.class);
        	}
        	else if (key.equalsIgnoreCase("writeReply")) {
        		this.writeReply = objectMapper.readValue(((JSONObject)jsonObject.get(key)).toJSONString(), WriteReply.class);
        	}
        }
    }
    
    
    @Data
    @NoArgsConstructor
    public static class SearchCond {
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject control = new JSONObject();
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject sort = new JSONObject();
        
        public Object getCtrlInfo(String artclNo) {
        	return getControllInfo(control, artclNo);
        }
        
        public List<String> getArtclNoList() {
        	return extractSortValues(sort);
        }
        
        public boolean isControl() {
        	return isExist(control);
        }
        
        public boolean isSort() {
        	return isExist(sort);
        }
        
        public boolean isReqired(String artclNo) {
        	return isReqiredValue(control, artclNo);
        }
        
        public int getLength(String artclNo) {
        	return getInputLength(control, artclNo);
        }
    }

    @Data
    @NoArgsConstructor
    public static class SearchList {
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject control = new JSONObject();
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject sort = new JSONObject();
        
        public Object getCtrlInfo(String artclNo) {
        	return getControllInfo(control, artclNo);
        }
        
        public List<String> getArtclNoList() {
        	return extractSortValues(sort);
        }
        
        public boolean isControl() {
        	return isExist(control);
        }
        
        public boolean isSort() {
        	return isExist(sort);
        }
    }
    
    @Data
    @NoArgsConstructor
    public static class Detail {
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject control = new JSONObject();
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject sort = new JSONObject();
        
        public Object getCtrlInfo(String artclNo) {
        	return getControllInfo(control, artclNo);
        }
        
        public List<String> getArtclNoList() {
        	return extractSortValues(sort);
        }
        
        public boolean isControl() {
        	return isExist(control);
        }
        
        public boolean isSort() {
        	return isExist(sort);
        }
    }
    
    @Data
    @NoArgsConstructor
    public static class Reply {
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject control = new JSONObject();
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject sort = new JSONObject();
        
        public Object getCtrlInfo(String artclNo) {
        	return getControllInfo(control, artclNo);
        }
        
        public List<String> getArtclNoList() {
        	return extractSortValues(sort);
        }
        
        public boolean isControl() {
        	return isExist(control);
        }
        
        public boolean isSort() {
        	return isExist(sort);
        }
    }
    
    @Data
    @NoArgsConstructor
    public static class Write {
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject control = new JSONObject();
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject sort = new JSONObject();
        
        public Object getCtrlInfo(String artclNo) {
        	return getControllInfo(control, artclNo);
        }
        
        public List<String> getArtclNoList() {
        	return extractSortValues(sort);
        }
        
        public boolean isControl() {
        	return isExist(control);
        }
        
        public boolean isSort() {
        	return isExist(sort);
        }
        
        public boolean isReqired(String artclNo) {
        	return isReqiredValue(control, artclNo);
        }
        
        public boolean checkUploadCnt(String artclNo, int fileCnt) {
        	return checkMaxUploadCnt(control, artclNo, fileCnt);
        }
        
        public boolean checkUploadSize(String artclNo, long fileSize) {
        	return checkMaxUploadSize(control, artclNo, fileSize);
        }
        
        public boolean checkAllowedExt(String artclNo, String ext) {
        	return checkAllowedUploadExt(control, artclNo, ext);
        }
        
  
        
    }
    
    @Data
    @NoArgsConstructor
    public static class WriteReply {
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject control = new JSONObject();
        @JsonDeserialize(using = JSONObjectDeserializer.class)
        private JSONObject sort = new JSONObject();
        
        public Object getCtrlInfo(String artclNo) {
        	return getControllInfo(control, artclNo);
        }
        
        public List<String> getArtclNoList() {
        	return extractSortValues(sort);
        }
        
        public boolean isControl() {
        	return isExist(control);
        }
        
        public boolean isSort() {
        	return isExist(sort);
        }
    }
    
    
    public String toJSONString() throws Exception {
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.writeValueAsString(this);
    }

    private static List<String> extractSortValues(JSONObject object) {
        List<String> values = new ArrayList<>();
        for (Object key : object.keySet()) {
            Object value = object.get(key);
            if (value != null) {
                values.add(value.toString());
            }
        }
        return values;
    }
    
    private static Object getControllInfo(JSONObject control, String artclNo) {
    	JSONObject rtnObject = new JSONObject();
    	try {
        	if (control == null || (control.containsKey(artclNo) == false)) {
        		return rtnObject;
        	}
        	
        	if (StringUtils.isBlank(artclNo)) {
        		return rtnObject;
        	}

        	
       		return control.get(artclNo);
    	} catch (NullPointerException e) {
    		return rtnObject;
		} catch (Exception e) {
			return rtnObject;
		}
    }
 
    private static boolean isExist(JSONObject object)  {
    	try {
    		if (object.keySet().size() < 1) {
        		return false;
        	}	
    	} catch (NullPointerException e) {
    		return false;
		} catch (Exception e) {
			return false;
		}
    	return true;
    }
    
    private static int getInputLength(JSONObject control, String artclNo)  {
    	int rtnLength = 4000;
    	try {
        	if (control == null || (control.containsKey(artclNo) == false)) {
        		return 0;
        	}
        	
        	if (StringUtils.isBlank(artclNo)) {
        		return rtnLength;
        	}
        	
        	if (((JSONObject) control.get(artclNo)).containsKey("len") == false) {
        		return  rtnLength;
        	}
        	String strLength = ((JSONObject) control.get(artclNo)).get("len").toString();
        	rtnLength = Integer.parseInt(strLength); 
    	} catch (NullPointerException e) {
    		return rtnLength;
		} catch (Exception e) {
			return rtnLength;
		}
    	return rtnLength;
    }
    
    private static boolean isReqiredValue(JSONObject control, String artclNo)  {
    	try {
        	if (control == null || (control.containsKey(artclNo) == false)) {
        		return false;
        	}
        	
        	if (StringUtils.isBlank(artclNo)) {
        		return false;
        	}
        	
        	if (((JSONObject) control.get(artclNo)).containsKey("req") == false) {
        		return  false;
        		
        	}

        	if ("Y".equalsIgnoreCase( ((JSONObject) control.get(artclNo)).get("req").toString() )) {
        		return true;
        	}

        	return false;
    	} catch (NullPointerException e) {
    		return false;
		} catch (Exception e) {
			return false;
		}
    }
    
    
    
    
    private static boolean checkMaxUploadCnt(JSONObject control, String artclNo, int fileCnt) {
    	try {
        	if ((control.get(artclNo) instanceof JSONObject) == false) {
        		return false;
        	}
        	
        	JSONObject artclInfo  = (JSONObject) control.get(artclNo);
        	JSONObject fileConfig = (JSONObject) artclInfo.get("file");
        	
        	String strFileCnt = fileConfig.get("cnt").toString();
        	if (fileCnt > Integer.parseInt(strFileCnt)) {
        		return false;
        	}
        	return true;
    	}
    	catch(NullPointerException e) {
    		return false;
    	}
    	catch(Exception e) {
    		return false;
    	}
    }
    
    private static boolean checkMaxUploadSize(JSONObject control, String artclNo, long fileSize) {
    	try {
        	if ((control.get(artclNo) instanceof JSONObject) == false) {
        		return false;
        	}
        	JSONObject artclInfo  = (JSONObject) control.get(artclNo);
        	JSONObject fileConfig = (JSONObject) artclInfo.get("file");
        	
        	String strFileSize = fileConfig.get("size").toString();
        	
        	if (fileSize > Long.parseLong(strFileSize)) {
        		return false;
        	}
        	return true;
    	}
    	catch(NullPointerException e) {
    		return false;
    	}
    	catch(Exception e) {
    		return false;
    	}
    }
    
    
    private static boolean checkAllowedUploadExt(JSONObject control, String artclNo, String fileExt) {
    	try {
        	if ((control.get(artclNo) instanceof JSONObject) == false) {
        		return false;
        	}
        	JSONObject artclInfo  = (JSONObject) control.get(artclNo);
        	JSONObject fileConfig = (JSONObject) artclInfo.get("file");
        	String strFileExt = fileConfig.get("ext").toString();
        	
            String[] allowedExtensions = strFileExt.split("\\|");
            for (String allowedExtension : allowedExtensions) {
                if (allowedExtension.equalsIgnoreCase(fileExt)) {
                    return true;
                }
            }

            return false;
    	}
    	catch(NullPointerException e) {
    		return false;
    	}
    	catch(Exception e) {
    		return false;
    	}
    }
    
    
    
    
    public static class JSONObjectDeserializer extends JsonDeserializer<JSONObject> {
        public JSONObjectDeserializer() {
            super(); // 기본 생성자
        }
        @Override
        public JSONObject deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        	JSONParser parser = new JSONParser();
            JsonNode node = p.getCodec().readTree(p); // JSON을 읽어서 노드로 변환
            
            // JsonNode를 JSONObject로 변환
            JSONObject jsonObject = new JSONObject();
            node.fieldNames().forEachRemaining(fieldName -> {
                JsonNode fieldNode = node.get(fieldName); // 해당 필드의 노드 가져오기
                
                if (fieldNode.isObject()) { // fieldNode가 JSONObject라면
                    // fieldNode를 JSONObject로 변환
                    try {
                    	System.out.println(fieldName);
                    	System.out.println(fieldNode.toString());
                    	
						jsonObject.put(fieldName, (JSONObject)parser.parse(fieldNode.toString()));
						
						System.out.println(jsonObject.get(fieldName).toString());
					} catch (ParseException e) {
						// TODO Auto-generated catch block
						jsonObject.put(fieldName, new JSONObject());
					}
                } else {
                    // String 값일 경우
                    jsonObject.put(fieldName, fieldNode.asText());
                }
            });

            return jsonObject;
        }
    }
    
    
    public static JSONObject reformatArclJson(JSONArray jsonArray) {
    	
    	// 그룹핑 결과 저장용 Map
        Map<String, Map<String, Object>> result = new HashMap<>();
        
        convertJSONArrayToList(jsonArray).stream().forEach(artclInfo -> {
        	String type1Key = (String) artclInfo.get("type1"); // search, list, etc.
        	String type2Key = (String) artclInfo.get("type2"); // control, sort

        	JSONObject value = (JSONObject) artclInfo.get("value");
        	
            // type1이 존재하지 않으면 초기화
        	result.putIfAbsent(type1Key, new HashMap<>());
            Map<String, Object> type1Map = result.get(type1Key);

            // type2가 존재하지 않으면 초기화
            type1Map.putIfAbsent(type2Key, new JSONObject());
            Map<String, Object> type2Map = (Map<String, Object>) type1Map.get(type2Key);
            
            // value 값을 type2Map에 병합
            Iterator<String> keys = value.keySet().iterator();
            while (keys.hasNext()) {
                String field = keys.next();
                type2Map.put(field, value.get(field));
                
                System.out.println(field +  " : " + type2Map.get(field).getClass());
                if ("W03".equals(field) ) {
                	System.out.println("xxx");
                }
                
                if(type2Map.get(field) instanceof JSONObject) {
                	if (((JSONObject)type2Map.get(field)).containsKey("file")) {
                		System.out.println(((JSONObject)type2Map.get(field)).get("file").getClass());
                	}
                }
            }
        });
    	
        JSONObject resultJson = new JSONObject(result);
        return resultJson;
    }
    
    
    
	public static List<JSONObject> convertJSONArrayToList(JSONArray jsonArray) {
		List<JSONObject> jsonList = new ArrayList<>();
		for (Object obj : jsonArray) {
			jsonList.add((JSONObject)obj);
		}
		return jsonList;
	}
    
}

