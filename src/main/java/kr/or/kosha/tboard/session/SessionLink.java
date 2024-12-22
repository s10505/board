package kr.or.kosha.tboard.session;

import javax.servlet.http.HttpServletRequest;

import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;
import org.springframework.stereotype.Component;

import kr.or.kosha.tboard.boot.web.StdTempData;

@Component
public class SessionLink {
	

	
	
	public Object getSession(HttpServletRequest request, String key) {
		Object object = new Object();
		
//		jsonObject.put("userId"  , "testId");
//		jsonObject.put("userNm"  , "홍길동");
//		jsonObject.put("authCode", "auth000000001");
		
		if (key.equals("erpUserId")) {
			return "";
		}
		else if (key.equals("portalUserId")) {
			return "";
		}
		
		
		return object;
	}
	
	public JSONObject getTboardAuth(HttpServletRequest request, String sesssionKey) throws ParseException {
		
		return StdTempData.getData();
		
	}
	
	
	public JSONObject setTboardAuth(String sesssionKey) {
		JSONObject jsonObject = new JSONObject();
		

		
		
		
		return jsonObject;
		
	}
	

}

