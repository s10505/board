package kr.or.kosha.tboard.boot.web;

import org.json.simple.JSONObject;

public class DataUtil {
	private String code;
    private String msg;
	private String subCode;
    private String subMsg;
    private JSONObject data;
    
    
	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getMsg() {
		return msg;
	}
	public void setMsg(String msg) {
		this.msg = msg;
	}
	public String getSubCode() {
		return subCode;
	}
	public void setSubCode(String subCode) {
		this.subCode = subCode;
	}
	public String getSubMsg() {
		return subMsg;
	}
	public void setSubMsg(String subMsg) {
		this.subMsg = subMsg;
	}
	public JSONObject getData() {
		return data;
	}
	public void setData(JSONObject Data) {
		this.data = Data;
	}
}
