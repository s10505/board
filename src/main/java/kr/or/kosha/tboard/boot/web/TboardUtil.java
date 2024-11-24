package kr.or.kosha.tboard.boot.web;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"kr.or.kosha", "egovframework"})
public class TboardUtil {
	private String code;
    private String msg;
	private String subCode;
    private String subMsg;
    private String data;
    
    
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
	public String getData() {
		return data;
	}
	public void setData(String Data) {
		this.data = Data;
	}


}
