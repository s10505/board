package kr.or.kosha.tboard.session;

import org.json.simple.JSONObject;
import org.springframework.stereotype.Component;

@Component
public class TboardAuthority {
	
	public JSONObject getPermission(String groupId) {
		JSONObject jsonObject = new JSONObject();
		
		
		if ("G000001".equals(groupId)) {
			//permission.getAtuh()
		}
		else if ("G000002".equals(groupId)) {
			//permission.getAtuh()
		}
		else if ("G000003".equals(groupId)) {
			//permission.getAtuh()
		}
		else if ("G000004".equals(groupId)) {
			//permission.getAtuh()
		}
		
		jsonObject.put("userId"  , "testId");
		jsonObject.put("userNm"  , "홍길동");
		jsonObject.put("authCode", "auth000000001");
		
		
		
		return jsonObject;
		
	}

}

