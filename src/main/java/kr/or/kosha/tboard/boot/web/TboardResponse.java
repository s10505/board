package kr.or.kosha.tboard.boot.web;

import org.json.simple.JSONObject;

public class TboardResponse {
	private String rtnCode;
    private String rtnMsg;
	private String rtnSubCode;
    private String rtnSubMsg;
    private JSONObject rtnData;
    
    
	public String getRtnCode() {
		return rtnCode;
	}
	public void setRtnCode(String rtnCode) {
		this.rtnCode = rtnCode;
	}
	public String getRtnMsg() {
		return rtnMsg;
	}
	public void setRtnMsg(String rtnMsg) {
		this.rtnMsg = rtnMsg;
	}
	public String getRtnSubCode() {
		return rtnSubCode;
	}
	public void setRtnSubCode(String rtnSubCode) {
		this.rtnSubCode = rtnSubCode;
	}
	public String getRtnSubMsg() {
		return rtnSubMsg;
	}
	public void setRtnSubMsg(String rtnSubMsg) {
		this.rtnSubMsg = rtnSubMsg;
	}
	public JSONObject getRtnData() {
		return rtnData;
	}
	public void setRtnData(JSONObject rtnData) {
		this.rtnData = rtnData;
	}

    
    
    
 
}
