package test;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class Test {

	public static void main(String[] args) {
		// TODO Auto-generated method stub
		
		JSONObject jsonRtnData  = new JSONObject();
		JSONObject jsonPostInfo = new JSONObject();
		
		
		
		
		
		jsonPostInfo.put("pstNo", "data");
		
		
		
		
		
		
		jsonRtnData.put("result", addToJSONArray(jsonPostInfo));
		
		
		System.out.println(jsonRtnData.toJSONString());
	}

	

    public static JSONArray addToJSONArray(JSONObject jsonObject) {
        // 빈 JSON 배열 생성
        JSONArray jsonArray = new JSONArray();
        
        // 객체를 배열에 추가
        jsonArray.add(jsonObject);
        
        // 배열 반환
        return jsonArray;
    }

}
