package kr.or.kosha.tboard.boot.web;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;



public class StdTempData {
	
	private static JSONObject jsonObject;

    
	static String permission = "[{\r\n"
    		+ "    \"type1\": \"basic\",\r\n"
    		+ "    \"type2\": \"access\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"basic\",\r\n"
    		+ "    \"type2\": \"read\",\r\n"
    		+ "    \"value\": \"dsacxew\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"basic\",\r\n"
    		+ "    \"type2\": \"write\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"basic\",\r\n"
    		+ "    \"type2\": \"delete\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"basic\",\r\n"
    		+ "    \"type2\": \"manage\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"reply\",\r\n"
    		+ "    \"type2\": \"access\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"reply\",\r\n"
    		+ "    \"type2\": \"read\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"reply\",\r\n"
    		+ "    \"type2\": \"write\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"reply\",\r\n"
    		+ "    \"type2\": \"delete\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"reply\",\r\n"
    		+ "    \"type2\": \"manage\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"comment\",\r\n"
    		+ "    \"type2\": \"read\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"comment\",\r\n"
    		+ "    \"type2\": \"write\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"comment\",\r\n"
    		+ "    \"type2\": \"delete\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"comment\",\r\n"
    		+ "    \"type2\": \"manage\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"commentReply\",\r\n"
    		+ "    \"type2\": \"read\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"commentReply\",\r\n"
    		+ "    \"type2\": \"write\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"commentReply\",\r\n"
    		+ "    \"type2\": \"delete\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"commentReply\",\r\n"
    		+ "    \"type2\": \"manage\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"file\",\r\n"
    		+ "    \"type2\": \"upload\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"download\",\r\n"
    		+ "    \"type2\": \"write\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"manage\",\r\n"
    		+ "    \"type2\": \"delete\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"notice\",\r\n"
    		+ "    \"type2\": \"write\",\r\n"
    		+ "    \"value\": \"\"\r\n"
    		+ "}\r\n"
    		+ "\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"viewcount\",\r\n"
    		+ "    \"type2\": \"\",\r\n"
    		+ "    \"value\": \"5\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"secret\",\r\n"
    		+ "    \"type2\": \"\",\r\n"
    		+ "    \"value\": \"Y\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"boardType\",\r\n"
    		+ "    \"type2\": \"\",\r\n"
    		+ "    \"value\": \"type1\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"postYn\",\r\n"
    		+ "    \"type2\": \"\",\r\n"
    		+ "    \"value\": \"Y\"\r\n"
    		+ "}\r\n"
    		+ "\r\n"
    		+ "\r\n"
    		+ "]";

	
    
	static String jsonArtcl = "[{\r\n"
    		+ "    \"type1\": \"search\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"S01\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"search\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"S02\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"search\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"S03\\\": {\\\"len\\\":\\\"50\\\", \\\"req\\\": \\\"Y\\\", \\\"file\\\": {\\\"size\\\":  5, \\\"ext\\\": \\\"jpg|bmp|png\\\", \\\"cnt\\\":10} }}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"search\",\r\n"
    		+ "    \"type2\": \"sort\",\r\n"
    		+ "    \"value\": \"{\\\"1\\\": \\\"S01\\\", \\\"2\\\": \\\"S02\\\", \\\"3\\\": \\\"S03\\\"}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"list\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"L01\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"list\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"L02\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"list\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"L03\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\", \\\"file\\\": {\\\"size\\\":  5, \\\"ext\\\": \\\"jpg|bmp|png\\\", \\\"cnt\\\":10} }}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"list\",\r\n"
    		+ "    \"type2\": \"sort\",\r\n"
    		+ "    \"value\": \"{\\\"1\\\": \\\"L01\\\", \\\"2\\\": \\\"L02\\\", \\\"3\\\": \\\"L03\\\"}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"detail\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"D01\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"detail\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"D02\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"detail\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"D03\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\", \\\"file\\\": {\\\"size\\\":  5, \\\"ext\\\": \\\"jpg|bmp|png\\\", \\\"cnt\\\":10} }}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"detail\",\r\n"
    		+ "    \"type2\": \"sort\",\r\n"
    		+ "    \"value\": \"{\\\"1\\\": \\\"D01\\\", \\\"2\\\": \\\"D02\\\", \\\"3\\\": \\\"D03\\\"}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"write\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"W01\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"write\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"W02\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"write\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"W03\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\", \\\"file\\\": {\\\"ext\\\": \\\"jpg|bmp|png\\\",\\\"size\\\": 5,\\\"cnt\\\": 10,\\\"dd\\\": {\\\"xxx\\\": \\\"test\\\"}} }}\"\r\n"
    		+ ""
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"write\",\r\n"
    		+ "    \"type2\": \"sort\",\r\n"
    		+ "    \"value\": \"{\\\"1\\\": \\\"W01\\\", \\\"2\\\": \\\"W02\\\", \\\"3\\\": \\\"W03\\\"}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"reply\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"R01\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"reply\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"R02\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\"}}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"reply\",\r\n"
    		+ "    \"type2\": \"control\",\r\n"
    		+ "    \"value\": \"{\\\"R03\\\": {\\\"cpt\\\":\\\"\\\", \\\"req\\\": \\\"\\\", \\\"file\\\": {\\\"size\\\":  5, \\\"ext\\\": \\\"jpg|bmp|png\\\", \\\"cnt\\\":10} }}\"\r\n"
    		+ "}\r\n"
    		+ ",{\r\n"
    		+ "    \"type1\": \"reply\",\r\n"
    		+ "    \"type2\": \"sort\",\r\n"
    		+ "    \"value\": \"{\\\"1\\\": \\\"R01\\\", \\\"2\\\": \\\"R02\\\", \\\"3\\\": \\\"R03\\\"}\"\r\n"
    		+ "}\r\n"
    		+ "]";
    
	
	
	public static JSONObject getData() throws ParseException {
		JSONObject rtnObject = new JSONObject();
		
		JSONParser parser = new JSONParser();
        JSONArray artclArray = (JSONArray) parser.parse(jsonArtcl);
        for (Object obj : artclArray) {
            JSONObject jsonObject = (JSONObject) obj;
            String value = (String) jsonObject.get("value");
            JSONObject valueObject = (JSONObject) parser.parse(value);
            jsonObject.put("value", valueObject);
        }
        
        
        JSONArray permArray = (JSONArray) parser.parse(permission);
        JSONObject result = new JSONObject();
        // 각 항목에 대해 처리
        for (Object obj : permArray) {
            String type1 = (String)((JSONObject) obj).get("type1");
            String type2 = (String)((JSONObject) obj).get("type2");  // "type2"가 없으면 빈 문자열 처리
            String value = (String)((JSONObject) obj).get("value");

            // "type2"가 비어있으면 "type1"만 사용
            String key = type1 + (type2.isEmpty() ? "" : "." + type2);
            result.put(key, value);
        }
        
        
        rtnObject.put("artclInfo", artclArray);
		rtnObject.put("prmsInfo", permArray);
		
		return rtnObject;
	}
	    
}
	

