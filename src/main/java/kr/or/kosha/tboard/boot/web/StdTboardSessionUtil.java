package kr.or.kosha.tboard.boot.web;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;

import kr.or.kosha.tboard.session.SessionLink;
import kr.or.kosha.tboard.session.TboardAuthority;
import lombok.Data;
import lombok.NoArgsConstructor;


public class StdTboardSessionUtil {
	
	private TboardAuthority tboardAuthority;
	private SessionLink sessionLink;
	private HttpServletRequest request;
	
	private String SESSION_TYPE = "token";
	private BoardInfo boardInfo = new BoardInfo();
	private UserInfo  userInfo  = new UserInfo();
	private StdTboardOptionUtil optUtil;    //StdBbsPrmsManager 
	private StdTboardArtclUtil  artclUtil;  //StdBbsItemManager
	
    @Data
    @NoArgsConstructor
    public class BoardInfo {
    	private String bbsId;
        private String sysSeCd;
        private String channelCd;
        private String authGroupId;
        
        BoardInfo(JSONObject jsonObject) {
        	String message = "게시판 입력값 오류";
    		try {
    			this.bbsId = jsonObject.get("bbsId").toString();
    			this.sysSeCd = jsonObject.get("sysSeCd").toString();
    			this.channelCd = jsonObject.get("channelCd").toString();
    			
    			if (StringUtils.isAnyBlank(bbsId, sysSeCd, channelCd)) {
    				throw new IllegalArgumentException(message);
    			}
    		}
    		catch (NullPointerException e) {
    			throw new IllegalArgumentException(message);
    		}
    		catch (Exception e) {
    			throw new IllegalArgumentException(message);
    		}
        }
    }

    @Data
    @NoArgsConstructor
    public class UserInfo {
    	private String userId;
        private String userNm;
        private List<String> authList;
        private JSONObject artclInfo;
        
        private final String USER_ID_KEY = "userId";
        private final String USER_NM_KEY = "userNm";
        
        
        UserInfo(JSONObject jsonObject) {
        	//String message = "게시판 입력값 오류";
    		try {
    			this.userId = jsonObject.get(USER_ID_KEY).toString();
    			this.userNm = jsonObject.get(USER_NM_KEY).toString();
    			
    			//this.sysSeCd = jsonObject.get("sysSeCd").toString();
    			//this.channelCd = jsonObject.get("channelCd").toString();
    			
    		}
    		catch (NullPointerException e) {
    			System.out.println("----1");
    		}
    		catch (Exception e) {
    			System.out.println("----2");
    		}
        }
    }
    
    
    public StdTboardSessionUtil(){
    	
    }
    
    public StdTboardSessionUtil(HttpServletRequest request, JSONObject jsonObject) throws JsonMappingException, JsonProcessingException {
    	this.init(request, jsonObject);
    }
    
    
    public void init(HttpServletRequest request, JSONObject jsonObject) throws JsonMappingException, JsonProcessingException {
    	try {
	    	this.request    = request;
	    	this.boardInfo  = new BoardInfo(jsonObject);
	    	tboardAuthority = new TboardAuthority();
	    	sessionLink     = new SessionLink();
	    	
	    	//01. 게시판 권한그룹 정보
	    	JSONObject bbsPrmsInfo = this.getPrmsGroupInfo();
	    	this.boardInfo.setAuthGroupId(bbsPrmsInfo.get("groupId").toString());
	    	
	    	//02. 사용자ID 확인
//	    	String userIdKey = "portalUserId";
//	    	String userId = "";
//	    	if (this.getBbsInfo().getSysSeCd().equals("10")) {
//	    		userIdKey = "erpUserId";
//	    	}
//	    	userId = (String) sessionLink.getSession(request, userIdKey);
	    	
	    	//로그인이 됐어 권한그룹을 넘겨, 그런데 그게시판은 비로그인 게시판이야
	    	
	    	//사용자가 A게시판은 관리자, B게시판은 일반,
	    	//두개의 게시판이 같은 권한그룹이면 그룹아이디만 넘기면 구분이 안됨
	    	
	    	//02. 시스템 별 권한그룹정보 
	    	JSONObject sysPrmsInfo = tboardAuthority.getPermission(this.boardInfo.getAuthGroupId());
	    	//JSONObject sysPrmsInfo = this.getSystemPermissions();
	    	this.userInfo = new UserInfo(sysPrmsInfo);
	    	System.out.println( this.userInfo.getUserId() );
	    	System.out.println( this.userInfo.getUserNm() );
	    	
	    	
	    	//03. redis에서 정보 가져오기
	    	JSONObject bbsManageInfo = null;
	    	if ("token".equalsIgnoreCase(SESSION_TYPE)) {
	    		//sessionlink
	    		bbsManageInfo = this.getUserSessionFromToken();
	    	}
	    	else {
	    		
	    	}
	    	
	    	//03. 없거나 시간비교해서 변경이 있으면 권한정보 재조회

	    	
	    	//권한.기능 객체 생성
	    	optUtil = new StdTboardOptionUtil((JSONArray)bbsManageInfo.get("prmsInfo"));
	    	//항목 객체 생성
	    	artclUtil = new StdTboardArtclUtil((JSONArray)bbsManageInfo.get("artclInfo"));

	    	
	    	System.out.println( optUtil.isFaqType() );
	    	System.out.println( artclUtil.getDetail().getArtclNoList() );
	    	
	    	System.out.println("----------------------");
	    	
	    	System.out.println(bbsManageInfo);
	    	System.out.println(bbsManageInfo.get("prmsInfo"));
	    	System.out.println(bbsManageInfo.get("artclInfo"));
	    	
	    	System.out.println("----------------------");
    	}
    	catch (IllegalArgumentException e) {
    		System.out.println("Xxx1");
    		throw new IllegalArgumentException("게시판 입력값 오류");
    	}
    	catch (Exception e) {
    		e.printStackTrace();
		}
    }
    
    
    
    public JSONObject getPrmsGroupInfo() {
    	JSONObject rtnObject = new JSONObject();
    	
        String groupId = "G000001";
        String optChangedTime = "20241222113700";
        String fldChangedTime = "20241222113700";
        
        rtnObject.put("groupId", groupId);
        rtnObject.put("optChangedTime", optChangedTime);
        rtnObject.put("fldChangedTime", fldChangedTime);
    	
    	return rtnObject;
    }
    

    
    //프로젝트별 권한그룹 정보 조회
    //사용자정보 및 권한그룹 및 기타....
    public JSONObject getSystemPermissions() {
    	return tboardAuthority.getPermission(this.boardInfo.getAuthGroupId());
    }
    
    
    
    
    private JSONObject getUserSessionFromToken() throws ParseException {
    	JSONObject rtnObject = new JSONObject();
    	
    	String bbsId     = this.boardInfo.getBbsId();
    	String channelCd = this.boardInfo.getChannelCd();
    	String rediKey = "bbs" + bbsId + channelCd;
    	
    	rtnObject = sessionLink.getTboardAuth(request, rediKey);
    	
    	//
    	
    	
    	
    	
    	return rtnObject;   	
    }
    
    
    private void getBbsInfoFromRedis() {
    	
    	
    	tboardAuthority.getPermission("");
    	
    }
    
    private void setBbsInfoInRedis() {
    	
    	tboardAuthority.getPermission("");
    	
    }
    
    public boolean isLogin() {
    	//return this.isLogin;
    	return true;
    }
    
    
    
    public BoardInfo getBbsInfo() {
    	return this.boardInfo;
    }
    
    public UserInfo getUserInfo() {
    	return this.userInfo;
    }

    public StdTboardOptionUtil getOptionUtil() {
    	return this.optUtil;
    }
    
    public StdTboardArtclUtil getArclUtil() {
    	return this.artclUtil;
    }
    
}
	

