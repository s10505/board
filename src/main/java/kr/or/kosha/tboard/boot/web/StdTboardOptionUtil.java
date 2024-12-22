package kr.or.kosha.tboard.boot.web;

import org.apache.commons.lang3.StringUtils;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class StdTboardOptionUtil{
	private final String BASIC_KEY = "basic";
	private final String REPLY_KEY = "reply";
	private final String COMMENT_KEY = "comment";
	private final String COMMENT_REPLY_KEY = "commentReply";
	private final String FILE_KEY = "file";
	private final String MANAGE_KEY = "manage";
	
	private final String BOARD_TYPE_KEY = "boardType";
	private final String VIEW_COUNT_KEY = "viewCount";
	private final String NOTICE_POST_KEY = "notice";
	private final String SECRET_POST_KEY = "secret";
	private final String POST_API_KEY   = "postApi";
	
	JSONObject bbsOption = new JSONObject();
	
	public StdTboardOptionUtil(JSONArray permArray) {
        // 각 항목에 대해 처리
		bbsOption = reformat(permArray);
	}
	
	public StdTboardOptionUtil(JSONObject jsonObject) {
		bbsOption = jsonObject;
	}
	
	public static JSONObject reformat(JSONArray permArray) {
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
        
        return result;
	}
	
	public boolean isAdmin(String optKey) {
		try {
			String chkPrmsKey = optKey.split(".")[0];
			if (chkPrmsKey.equalsIgnoreCase(BASIC_KEY)) {
				return this.isBasicAdmin();
			}
			else if (chkPrmsKey.equalsIgnoreCase(REPLY_KEY)) {
				return this.isReplyAdmin();
			}
			else if (chkPrmsKey.equalsIgnoreCase(COMMENT_KEY)) {
				return this.isCommentAdmin();
			}
			else if (chkPrmsKey.equalsIgnoreCase(COMMENT_REPLY_KEY)) {
				return this.isCommentReplyAdmin();
			}
			else if (chkPrmsKey.equalsIgnoreCase(FILE_KEY)) {
				return this.isFileAdmin();
			}
		}
		catch (NullPointerException e) {
			return false;
		}
		catch (Exception e) {
			return false;
		}
		
		return false;
	}
	
	
	public boolean isBasicAdmin() {
		String str = this.getOptionValue(BASIC_KEY + "." + MANAGE_KEY);
		if (StringUtils.isBlank(str)) {
			return false;
		}
		return true;
	}
	
	public boolean isReplyAdmin() {
		String str = this.getOptionValue(REPLY_KEY + "." + MANAGE_KEY);
		if (StringUtils.isBlank(str)) {
			return false;
		}
		return true;
	}
	public boolean isCommentAdmin() {
		String str = this.getOptionValue(COMMENT_KEY + "." + MANAGE_KEY);
		if (StringUtils.isBlank(str)) {
			return false;
		}
		return true;
	}
	public boolean isCommentReplyAdmin() {
		String str = this.getOptionValue(COMMENT_REPLY_KEY + "." + MANAGE_KEY);
		if (StringUtils.isBlank(str)) {
			return false;
		}
		return true;
	}
	
	public boolean isFileAdmin() {
		String str = this.getOptionValue(FILE_KEY + "." + MANAGE_KEY);
		if (StringUtils.isBlank(str)) {
			return false;
		}
		return true;
	}
	
	
	public boolean hasPermission(String optKey) {
		if (this.isAdmin(optKey) == true) {
			return true;
		}
		String str = this.getOptionValue(optKey);
		if (StringUtils.isBlank(str)) {
			return false;
		}
		return true;
	}
	
	
	public String getBoardType(String boardType) {
		return this.getOptionValue(BOARD_TYPE_KEY);
	}
	
	public boolean isFaqType() {
		String str = this.getOptionValue(BOARD_TYPE_KEY);
		if ("type2".equalsIgnoreCase(str)) {
			return true;
		}
		return false;
	}
	
	public boolean isGalleryType(String boardType) {
		String str = this.getOptionValue(BOARD_TYPE_KEY);
		if ("type3".equalsIgnoreCase(str)) {
			return true;
		}
		return false;
	}
	
	public boolean isNoticePost() {
		String str = this.getOptionValue(NOTICE_POST_KEY);
		if ("Y".equalsIgnoreCase(str)) {
			return true;
		}
		return false;
	}
	
	public boolean isSecretPost() {
		String str = this.getOptionValue(SECRET_POST_KEY);
		if ("Y".equalsIgnoreCase(str)) {
			return true;
		}
		return false;
	}
	
	public String getViewCount() {
		return this.getOptionValue(VIEW_COUNT_KEY);
	}
	
	public String getOptionValue(String key) {
		String rtnStr = "";
		try {
			String str = bbsOption.get(key).toString();
			if (StringUtils.isBlank(str)) {
				return rtnStr;
			}
			return StringUtils.trim(bbsOption.get(key).toString());
		}
		catch (NullPointerException e) {
			return rtnStr;
		}
		catch (Exception e) {
			return rtnStr;
		}
	}
	
	
	public JSONObject getObject() {
		return bbsOption;
	}
    
}

